import { captureUTMs } from "./utm_parser.js";
import { ConsentManager } from "../consent_manager/consent_manager.js";
import { ConsentStorage } from "../consent_manager/consent_storage.js";
import {SessionManager } from "./session_manager.js"


// ==========================================
// FUNNEL ENGINE & BEHAVIORAL ANALYTICS
// ==========================================


/** 
 * FUNNEL PAYLOAD SCHEMA (arkana_lead_state)
 * This structure is maintained in Storage and periodically synced.
 * ```js
 * {
 *   "meta": { "version": "1.0", "first_visited_at": "...", "last_active_at": "...", "utm": {...} },
 *   "funnel": { "current_stage": "awareness", "score": 10 },
 *   "awareness": { "total_sessions": 1, "total_page_views": 1, "total_time_seconds": 120, "sections_browsed_seconds": {"hero": 45} },
 *   "interest": { "explored_team_philosophy": true, "github_repos_clicked": [] },
 *   "evaluation": { "projects_inspected": { "joel_apps": {"screenshots_viewed": 2, "checked_impact": true} } },
 *   "intent": { "form_initiated": true, "form_topic_selected": "b2b_services" },
 *   "conversion": { "converted": true, "submitted_at": "..." }
 * } ```

 * Core engine for tracking user behavior, managing funnel state, 
 * and pushing event-driven telemetry to Google Tag Manager (GTM).
 * Respects GDPR by dynamically swapping between localStorage and sessionStorage.
 */
export const FunnelEngine = {
  /** @type {string} */
  STORAGE: 'arkana_lead_state',
  
  /** @type {Storage} Only localStorage is used when consent is granted. */
  storageAPI: localStorage, 
  
  /** @type {Array<Function>} External listeners for real-time hooks */
  listeners: [],
  
  /** @type {number|null} ID for the 60-second GTM heartbeat loop */
  _syncInterval: null,

  /**
   * Bootstraps the Funnel Engine. 
   * Awaits user consent, halts if consent is denied, loads previous state, 
   * and sets up the exit triggers and periodic heartbeat.
   * @returns {Promise<void>}
   */
  async init() {
    // 1. Determine Initial Consent Level (0: None, 1: Necessary, 2: Analytics/All)
    let consentLevel = ConsentStorage.hasConsentRecorded() ? 
        (ConsentStorage.isGranted(ConsentStorage.ANALYTICS_STORAGE) ? 2 : 1) : 0;
    
    this.storageAPI = localStorage; 
    this.state = this.loadState();
    
    const now = Date.now();
    const lastActive = this.state && this.state.meta ? new Date(this.state.meta.last_active_at).getTime() : 0;

    // 2. Show popup if no consent exists, or if the session has been dead for 24h
    if (!this.state || (lastActive + 24 * 3600 * 1000) < now || consentLevel === 0) {
      consentLevel = await ConsentManager.verifyAndShowConsentPopup();
    }

    // 3. STRICT GDPR ENFORCEMENT: Halt entirely if analytics consent is missing
    if (consentLevel === 1 || consentLevel === 0) {
      console.warn("User opted out of analytics (or consent missing). FunnelEngine halted.");
      return; 
    }

    // 4. We have full Analytics Consent. Proceed with tracking.
    this.initState();
    this.update_awareness_payload();
    SessionManager.startAutoPing(SessionManager.SESSION_DURATION);
    this.startPeriodicSync();

    // 5. THE EXIT TRIGGER: Capture the final awareness data exactly when the user leaves
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveState(); // Ensure the latest section timers are saved locally
        this.syncStateToGA4('page_exit'); // Fire the final payload to GA4
      }
    });
  },

  /**
   * Safely reads the funnel state from storage.
   * @returns {Object|null}
   */
  loadState() {
    const storedState = JSON.parse(this.storageAPI.getItem(this.STORAGE) || "null");
    if (storedState && storedState.meta) {  
      return storedState;
    }
    return null;
  },

  /**
   * Persists the current in-memory state to storage.
   */
  saveState() {
    if (this.state) {
        this.state.meta.last_active_at = new Date().toISOString();
        this.storageAPI.setItem(this.STORAGE, JSON.stringify(this.state));
    }
  },

  /**
   * Generates a fresh state schema for a new user, capturing UTM parameters if present.
   * @returns {Object}
   */
  initState() {
    let payload = captureUTMs(this.state) || JSON.parse(this.storageAPI.getItem(this.STORAGE) || "{}");
    const now = new Date().toISOString();

    payload.meta = payload.meta || { utm: {} };
    payload.meta.version = payload.meta.version || "1.0";
    payload.meta.first_visited_at = payload.meta.first_visited_at || now;
    payload.meta.last_active_at = now;
    payload.meta.initial_referrer = payload.meta.initial_referrer || document.referrer || "direct";

    payload.funnel = payload.funnel || { current_stage: "awareness", score: 0 };
    payload.awareness = payload.awareness || { total_sessions: 0, total_page_views: 0, total_time_seconds: 0, visited_pages: {}, sections_browsed_seconds: {} };
    payload.interest = payload.interest || {};
    payload.evaluation = payload.evaluation || {};
    payload.intent = payload.intent || {};
    payload.conversion = payload.conversion || {};

    this.state = payload;
    this.saveState();
    return payload;
  },

  /**
   * Progresses the user down the funnel. Prevents backward demotion.
   */
  promoteStage(newStage, scoreBoost) {
    const stages = ['awareness', 'interest', 'evaluation', 'intent', 'conversion'];
    const currentIndex = stages.indexOf(this.state.funnel.current_stage);
    const newIndex = stages.indexOf(newStage);
    
    if (currentIndex < newIndex) {
        this.state.funnel.current_stage = newStage;
    }
    this.state.funnel.score = (this.state.funnel.score || 0) + scoreBoost;
  },

  // ==========================================
  // GA4 / GTM EVENT PIPELINE (Flattened Sync)
  // ==========================================

  /**
   * Starts the fallback asynchronous heartbeat. 
   * Pushes a flattened snapshot to GA4 every 60 seconds.
   */
  startPeriodicSync() {
    if (this._syncInterval) clearInterval(this._syncInterval);
    
    this._syncInterval = setInterval(() => {
        this.saveState();
        this.syncStateToGA4('heartbeat_60s');
    }, 60000);
  },

  /**
   * Flattens the nested local state and sends a single, consolidated summary to GA4.
   * @param {string} triggerName - The reason for the sync (e.g., 'page_exit', 'stage_up')
   * @param {Object} [extraData={}] - Optional trigger-specific data to merge into the payload
   */
  syncStateToGA4(triggerName, extraData = {}) {
    if (!this.state) return;

    // 1. Flatten arrays and extract key data safely
    const inspectedProjects = Object.keys(this.state.evaluation?.projects_inspected || {});
    const githubRepos = this.state.interest?.github_repos_clicked || [];
    
    // Find the most visited page based on count
    const topVisitedPage = Object.entries(this.state.awareness?.visited_pages || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    // 2. Build a strictly flat payload (Numbers and Strings only, GA4 friendly)
    const flatPayload = {
      event: 'funnel_state_sync',
      sync_trigger: String(triggerName).substring(0, 50),
      
      // Funnel KPIs
      lead_score: this.state.funnel?.score || 0,
      current_stage: this.state.funnel?.current_stage || 'awareness',

      initial_referrer: this.state.meta.initial_referrer,
      utm_medium: this.state.meta.utm.utm_medium,
      utm_campaign: this.state.meta.utm.utm_campaign,
      // Awareness Metrics (Always includes latest accumulated time)
      total_sessions: this.state.awareness?.total_sessions || 1,
      total_time_seconds: this.state.awareness?.total_time_seconds || 0,
      total_page_views: this.state.awareness?.total_page_views || 0,
      top_page: String(topVisitedPage).substring(0, 100),
      initial_referrer: String(this.state.meta?.initial_referrer || 'direct').substring(0, 100),
      utm_source: String(this.state.meta?.utm?.source || 'organic').substring(0, 50),
      
      // Interest & Evaluation Dimensions
      projects_inspected: inspectedProjects.join(',').substring(0, 100) || 'none',
      github_repos: githubRepos.join(',').substring(0, 100) || 'none',
      explored_philosophy: this.state.interest?.explored_team_philosophy ? 'yes' : 'no',
      
      // Intent Dimensions
      intent_topic: String(this.state.intent?.form_topic_selected || 'none').substring(0, 100),
      
      // Merge any trigger-specific actions (e.g., project_id clicked)
      ...extraData
    };

    // 3. Push to GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(flatPayload);
  },

  // ==========================================
  // STATE UPDATERS (Track specific user actions)
  // ==========================================

  update_awareness_payload() {
    SessionManager.runOncePerSession(() => {
      this.state.awareness.total_sessions = (this.state.awareness.total_sessions || 0) + 1;
      // Sync immediately on first session load
      this.syncStateToGA4('session_start'); 
    });

    if (this.state.awareness.total_sessions === 0) {
        this.state.awareness.total_sessions = 1;
    }

    this.state.awareness.total_page_views = (this.state.awareness.total_page_views || 0) + 1;
    const path = window.location.pathname;
    this.state.awareness.visited_pages = this.state.awareness.visited_pages || {};
    this.state.awareness.visited_pages[path] = (this.state.awareness.visited_pages[path] || 0) + 1;

    // Start tracking section dwell time
    const sections = getListOfSections() || [];
    this._sectionTimers = this._sectionTimers || [];
    sections.forEach((el) => {
      if (!el) return;
      if (this._sectionTimers.find(s => s.el === el)) return;
      this._sectionTimers.push({ el, controller: calculateTimeOfTop(el) });
    });

    this.saveState();
  },

  updateInterest(data = {}) {
    if (!this.state) return;
    this.state.interest = this.state.interest || { explored_team_philosophy: false, github_repos_clicked: [] };

    let actionDetail = 'n/a';

    if (data.explored_team_philosophy) {
        this.state.interest.explored_team_philosophy = true;
        actionDetail = 'explored_philosophy';
    }
    
    if (data.github_repo) {
        if (!this.state.interest.github_repos_clicked.includes(data.github_repo)) {
            this.state.interest.github_repos_clicked.push(data.github_repo);
        }
        actionDetail = `github_${data.github_repo}`;
    }

    this.promoteStage('interest', 10);
    this.saveState();

    // Piggyback GA4 Sync
    this.syncStateToGA4('stage_promoted_interest', {
        action_detail: actionDetail.substring(0, 100)
    });
  },

  updateEvaluation(projectId, actionType) {
    if (!this.state) return;
    this.state.evaluation.projects_inspected = this.state.evaluation.projects_inspected || {};
    
    if (!this.state.evaluation.projects_inspected[projectId]) {
        this.state.evaluation.projects_inspected[projectId] = { screenshots_viewed: 0, checked_impact: false, external_links_clicked: [] };
    }

    const proj = this.state.evaluation.projects_inspected[projectId];
    
    if (actionType === 'flipped') proj.checked_impact = true;
    if (actionType === 'gallery') proj.screenshots_viewed += 1;
    if (actionType === 'store_link') proj.external_links_clicked.push('store');

    this.promoteStage('evaluation', 15);
    this.saveState();

    // Piggyback GA4 Sync
    this.syncStateToGA4('stage_promoted_evaluation', {
        interaction_project: projectId.substring(0, 50),
        interaction_type: actionType.substring(0, 50)
    });
  },

  updateIntent(data = {}) {
    if (!this.state) return;

    if (data.form_topic_selected) {
        this.state.intent.form_topic_selected = data.form_topic_selected;
        
        // Piggyback sync when they select a topic
        this.syncStateToGA4('intent_topic_selected');
    }

    if (data.form_initiated) this.state.intent.form_initiated = true;
    if (data.time_spent_in_form_seconds > 0) {
      this.state.intent.time_spent_in_form_seconds = (this.state.intent.time_spent_in_form_seconds || 0) + Math.round(data.time_spent_in_form_seconds);
    }

    this.promoteStage('intent', 20);
    this.saveState();
  },

  updateConversion(data = {}) {
    if (!this.state) return;
    this.state.conversion.converted = true;
    this.state.conversion.submitted_at = new Date().toISOString();
    if (data.formspree_submission_id) this.state.conversion.formspree_submission_id = data.formspree_submission_id;

    this.promoteStage('conversion', 50);
    this.saveState();

    // The Ultimate Sync
    this.syncStateToGA4('stage_promoted_conversion', {
        conversion_id: String(data.formspree_submission_id || 'none').substring(0, 50)
    });
  },

  subscribe(fn) {
    this.listeners.push(fn);
  },

  recordEvent(eventName, data) {
    switch(eventName) {
        case 'interest': this.updateInterest(data); break;
        case 'evaluation': this.updateEvaluation(data.projectId, data.actionType); break;
        case 'intent': this.updateIntent(data); break;
        case 'conversion': this.updateConversion(data); break;
    }
    this.listeners.forEach(sink => sink(eventName, data, this.state));
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getListOfSections() {
  const main = document.getElementById('main-content') || document.body;
  return Array.from(main.querySelectorAll('section'));
}

function calculateTimeOfTop(section) {
  const el = typeof section === 'string' ? document.getElementById(section.replace(/^#/, '')) : section;
  if (!el) return;

  const sectionId = el.id || el.getAttribute('data-template');
  if (!sectionId) return;
    
  let startTs = null;
  let tickInterval = null;
  const TICK_SECONDS = 15;

  function addTick() {
    FunnelEngine.state.awareness.sections_browsed_seconds[sectionId] = (FunnelEngine.state.awareness.sections_browsed_seconds[sectionId] || 0) + TICK_SECONDS;
    FunnelEngine.state.awareness.total_time_seconds = (FunnelEngine.state.awareness.total_time_seconds || 0) + TICK_SECONDS;
    
    // Save locally ONLY. Do not push to GA4 here to avoid spam.
    SessionManager.debounceEvent('funnel_save', TICK_SECONDS * 1000, () => {
      FunnelEngine.saveState();
    });
  }

  function startTiming() {
    if (startTs) return;
    startTs = Date.now();
    tickInterval = setInterval(addTick, TICK_SECONDS * 1000);
  }

  function stopTiming(forceSave = false) {
    if (!startTs) return;

    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }

    const now = Date.now();
    const elapsed = Math.round((now - startTs) / 1000);
    startTs = null;

    const fullTicks = Math.floor(elapsed / TICK_SECONDS);
    const leftover = elapsed - (fullTicks * TICK_SECONDS);

    if (leftover > 0) {
      FunnelEngine.state.awareness.sections_browsed_seconds[sectionId] = (FunnelEngine.state.awareness.sections_browsed_seconds[sectionId] || 0) + leftover;
      FunnelEngine.state.awareness.total_time_seconds = (FunnelEngine.state.awareness.total_time_seconds || 0) + leftover;
    }

    if (forceSave) {
        FunnelEngine.saveState();
    } else {
        SessionManager.debounceEvent('funnel_save', TICK_SECONDS * 1000, () => {
            FunnelEngine.saveState();
        });
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startTiming();
      } else {
        stopTiming(false);
      }
    });
  }, { 
      rootMargin: "-15% 0px -15% 0px", 
      threshold: 0 
  });

  observer.observe(el);

  const visibilityHandler = () => { if (document.hidden) stopTiming(false); };
  const beforeUnloadHandler = () => stopTiming(true);

  document.addEventListener('visibilitychange', visibilityHandler, { passive: true });
  window.addEventListener('beforeunload', beforeUnloadHandler);

  return {
    stop: () => {
      stopTiming(true);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    }
  };
}
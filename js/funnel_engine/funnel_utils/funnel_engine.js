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
 * 
 * {
 *   "meta": { "version": "1.0", "first_visited_at": "...", "last_active_at": "...", "utm": {...} },
 *   "funnel": { "current_stage": "awareness", "score": 10 },
 *   "awareness": { "total_sessions": 1, "total_page_views": 1, "total_time_seconds": 120, "sections_browsed_seconds": {"hero": 45} },
 *   "interest": { "explored_team_philosophy": true, "github_repos_clicked": [] },
 *   "evaluation": { "projects_inspected": { "joel_apps": {"screenshots_viewed": 2, "checked_impact": true} } },
 *   "intent": { "form_initiated": true, "form_topic_selected": "b2b_services" },
 *   "conversion": { "converted": true, "submitted_at": "..." }
 * }
 */

/**
 * Core engine for tracking user behavior, managing funnel state, 
 * and pushing event-driven telemetry to Google Tag Manager (GTM).
 * Respects GDPR by dynamically swapping between localStorage and sessionStorage.
 */
export const FunnelEngine = {
  /** @type {string} */
  STORAGE: 'arkana_lead_state',
  
  /** @type {Storage} Dynamically assigned to localStorage or sessionStorage based on consent */
  storageAPI: localStorage, 
  
  /** @type {Array<Function>} External listeners for real-time hooks */
  listeners: [],
  
  /** @type {number|null} ID for the 60-second GTM heartbeat loop */
  _syncInterval: null,

  /**
   * Bootstraps the Funnel Engine. 
   * Awaits user consent, determines the storage backend, loads previous state, 
   * and starts the periodic GTM heartbeat.
   * @returns {Promise<void>}
   */
  async init() {
    // 1. Determine Consent Level (0: None, 1: Necessary, 2: All)
    const consentLevel = ConsentStorage.hasConsentRecorded() ? 
        (ConsentStorage.isGranted(ConsentStorage.ANALYTICS_STORAGE) ? 2 : 1) : 0;
    
    // 2. Dynamic Backend Swap (GDPR Compliance)
    this.storageAPI = (consentLevel === 2) ? localStorage : sessionStorage;
    
    // 3. Load State
    this.state = this.loadState();
    const now = Date.now();
    const lastActive = this.state && this.state.meta ? new Date(this.state.meta.last_active_at).getTime() : 0;

    // 4. Show popup if no state exists, or if the session has been dead for 24h
    if (!this.state || (lastActive + 24 * 3600 * 1000) < now) {
      
      // Halts execution until the user interacts with the consent banner
      const res = await ConsentManager.verifyAndShowConsentPopup();
      
      if (res === 1 || res === 2) {
        this.storageAPI = (res === 2) ? localStorage : sessionStorage;
        this.initState();
        
        // ENGINEERED FIX: Run awareness BEFORE auto-ping so the session count registers correctly
        this.update_awareness_payload();
        SessionManager.startAutoPing(SessionManager.SESSION_DURATION);
        this.startPeriodicSync();
      } else {
        console.warn("Consent rejected. Funnel halted.");
      }
    } else {
      // Returning user: Resume operations silently
      this.update_awareness_payload();
      SessionManager.startAutoPing(SessionManager.SESSION_DURATION);
      this.startPeriodicSync();
    }
  },

  /**
   * Safely reads the funnel state from the active storage API.
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
   * Persists the current in-memory state to the active storage API.
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
   * @param {'awareness'|'interest'|'evaluation'|'intent'|'conversion'} newStage 
   * @param {number} scoreBoost - Points to add to the lead score
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
  // GA4 / GTM EVENT PIPELINE
  // ==========================================

  /**
   * Starts the asynchronous heartbeat. Pushes time/score to GTM every 60 seconds.
   */
  startPeriodicSync() {
    if (this._syncInterval) clearInterval(this._syncInterval);
    
    this._syncInterval = setInterval(() => {
        this.saveState();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'funnel_heartbeat',
            total_time_seconds: this.state.awareness?.total_time_seconds || 0,
            funnel_score: this.state.funnel?.score || 0
        });
    }, 60000);
  },

  /**
   * Pushes a flattened, data-rich event to GTM for GA4 Funnel Explorations.
   * @param {string} stageName - e.g., 'funnel_evaluation'
   * @param {Object} actionData - e.g., { project_id: 'joel_apps', action: 'flipped' }
   */
  pushStageEvent(stageName, actionData = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: stageName,
        current_score: this.state.funnel?.score || 0,
        ...actionData // Flattened properties to bypass GA4's nested JSON limits
    });
  },

  // ==========================================
  // STATE UPDATERS (Track specific user actions)
  // ==========================================

  /**
   * Tracks base metrics: session counts, page views, and section dwell time.
   */
  update_awareness_payload() {
    SessionManager.runOncePerSession(() => {
      this.state.awareness.total_sessions = (this.state.awareness.total_sessions || 0) + 1;
      
      this.pushStageEvent('funnel_awareness', {
          initial_referrer: String(this.state.meta?.initial_referrer || 'direct').substring(0, 100),
          utm_source: this.state.meta?.utm?.source || 'organic'
      });
    });

    // ENGINEERED FIX: Failsafe for dev testing when localStorage is cleared but sessionStorage isn't
    if (this.state.awareness.total_sessions === 0) {
        this.state.awareness.total_sessions = 1;
    }

    this.state.awareness.total_page_views = (this.state.awareness.total_page_views || 0) + 1;
    const path = window.location.pathname;
    this.state.awareness.visited_pages = this.state.awareness.visited_pages || {};
    this.state.awareness.visited_pages[path] = (this.state.awareness.visited_pages[path] || 0) + 1;

    const sections = getListOfSections() || [];
    this._sectionTimers = this._sectionTimers || [];
    sections.forEach((el) => {
      if (!el) return;
      if (this._sectionTimers.find(s => s.el === el)) return;
      this._sectionTimers.push({ el, controller: calculateTimeOfTop(el) });
    });

    this.saveState();
  },

  /**
   * Tracks when a user explores your philosophy or checks GitHub.
   * @param {Object} data 
   * @param {boolean} [data.explored_team_philosophy]
   * @param {string} [data.github_repo]
   */
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

    // GA4 EVENT: Step 2
    this.pushStageEvent('funnel_interest', {
        interest_action: actionDetail.substring(0, 100)
    });
  },

  /**
   * Tracks deep interaction with portfolio projects.
   * @param {string} projectId - The ID of the project (e.g., 'joel_apps')
   * @param {'flipped'|'gallery'|'store_link'} actionType - The interaction type
   */
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

    // GA4 EVENT: Step 3 (Highly detailed!)
    this.pushStageEvent('funnel_evaluation', {
        project_id: projectId.substring(0, 50),
        evaluation_action: actionType.substring(0, 50)
    });
  },

  /**
   * Tracks when the user interacts with the contact form.
   * @param {Object} data 
   * @param {boolean} [data.form_initiated]
   * @param {string} [data.form_topic_selected]
   */
  updateIntent(data = {}) {
    if (!this.state) return;

    if (data.form_topic_selected) {
        this.state.intent.form_topic_selected = data.form_topic_selected;
        
        // GA4 EVENT: Step 4
        this.pushStageEvent('funnel_intent', {
            topic_selected: String(data.form_topic_selected).substring(0, 100)
        });
    }

    if (data.form_initiated) this.state.intent.form_initiated = true;
    if (data.time_spent_in_form_seconds > 0) {
      this.state.intent.time_spent_in_form_seconds = (this.state.intent.time_spent_in_form_seconds || 0) + Math.round(data.time_spent_in_form_seconds);
    }

    this.promoteStage('intent', 20);
    this.saveState();
  },

  /**
   * The ultimate goal. Triggers when the form successfully bypasses validation constraints.
   * @param {Object} data - Contains submission ID or conversion flags
   */
  updateConversion(data = {}) {
    if (!this.state) return;
    this.state.conversion.converted = true;
    this.state.conversion.submitted_at = new Date().toISOString();
    if (data.formspree_submission_id) this.state.conversion.formspree_submission_id = data.formspree_submission_id;

    this.promoteStage('conversion', 50);
    this.saveState();

    // GA4 EVENT: Step 5 (The Ultimate Goal)
    this.pushStageEvent('funnel_conversion', {
        final_topic: String(this.state.intent.form_topic_selected || 'none').substring(0, 100),
        projects_inspected_count: Object.keys(this.state.evaluation.projects_inspected || {}).length,
        total_funnel_seconds: this.state.awareness.total_time_seconds || 0
    });
  },

  /**
   * Registers external callback functions.
   * @param {Function} fn 
   */
  subscribe(fn) {
    this.listeners.push(fn);
  },

  /**
   * Central dispatcher mapping raw event strings to the correct updaters.
   * @param {string} eventName 
   * @param {Object} data 
   */
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
// UTILITY FUNCTIONS (Optimized)
// ==========================================

/**
 * Scans the DOM for semantic landmarks to track viewport dwell time.
 * @param {boolean} isWebsite 
 * @returns {Array<HTMLElement>}
 */
function getListOfSections() {
 
  
  // ENGINEERED FIX: Rely purely on semantic <section> tags injected by templates
  const main = document.getElementById('main-content') || document.body;
  const sections = Array.from(main.querySelectorAll('section'));
  
  return sections;
}

/**
 * Tracks how many seconds a user spends looking at a specific section.
 * Uses an IntersectionObserver to start/stop a 15-second tick interval.
 * @param {HTMLElement|string} section 
 * @returns {Object} Controller object with a stop() method
 */
function calculateTimeOfTop(section) {
  const el = typeof section === 'string' ? document.getElementById(section.replace(/^#/, '')) : section;
  if (!el) return;

 // ABSOLUTE GUARANTEE: Read the ID. If it doesn't have an ID, abort tracking. No random junk allowed.
  const sectionId = el.id || el.getAttribute('data-template');
  if (!sectionId) return;
    
  let startTs = null;
  let tickInterval = null;
  const TICK_SECONDS = 15;

  function addTick() {
    FunnelEngine.state.awareness.sections_browsed_seconds[sectionId] = (FunnelEngine.state.awareness.sections_browsed_seconds[sectionId] || 0) + TICK_SECONDS;
    FunnelEngine.state.awareness.total_time_seconds = (FunnelEngine.state.awareness.total_time_seconds || 0) + TICK_SECONDS;
    
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

    // Force an immediate synchronous save if the tab is closing (beforeunload)
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
      // The section must enter the middle 70% of the screen to count as "being read"
      rootMargin: "-15% 0px -15% 0px", 
      threshold: 0 // Fires immediately when the margin is crossed
  });

  observer.observe(el);

  const visibilityHandler = () => { if (document.hidden) stopTiming(false); };
  
  // ENGINEERED FIX: Force synchronous save so we don't lose the final seconds when tab closes
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
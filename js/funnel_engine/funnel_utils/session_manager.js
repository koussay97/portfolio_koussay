/**
 * COMPLETE USAGE GUIDE:
 * 
 * 1. Subscribe to Session Starts
 *    Register actions that should happen EVERY TIME a new 30-minute session begins.
 *    ```js
 *    SessionManager.onSessionStart(() => {
 *        let state = JSON.parse(localStorage.getItem('arkana_lead_state')) || { 
 *            awareness: { total_sessions: 0 } 
 *        };
 *        state.awareness.total_sessions += 1;
 *        localStorage.setItem('arkana_lead_state', JSON.stringify(state));
 *        console.log("New session registered. Total:", state.awareness.total_sessions);
 *    });
 *    ```
 * 
 * 2. Start the Background Stream (The Auto-Ping)
 *    Run this once on page load. It immediately evaluates the session and sets up 
 *    the periodic background check (e.g., every 60 seconds) to extend the session 
 *    or trigger a new one if the user was idle for >30 minutes.
 *    ```js
 *    SessionManager.startAutoPing(60000); 
 *    ```
 * 
 * 3. Use the One-Off Execution Guard
 *    If you have a function that absolutely must only run once per active session 
 *    (independently of the background stream).
 *    ```js
 *    SessionManager.runOncePerSession(() => {
 *        console.log("This fires strictly once per 30-minute block.");
 *    });
 *    ```
 * 
 * 4. Prevent UI Double-Clicks (Debounce)
 *    Wrap your button clicks to prevent users from artificially inflating metrics 
 *    by clicking a project multiple times rapidly.
 *    ```js
 *    document.getElementById('xcite-immo-card').addEventListener('click', () => {
 *        SessionManager.debounceEvent('view_xcite_immo', 2000, () => {
 *            // Safely push to localStorage or GTM here
 *            console.log("Project viewed. Locked for 2 seconds.");
 *        });
 *    });
 */
export const SessionManager = { 

    /** 
     * Default session duration: 30 minutes in milliseconds.
     * @type {number} 
     */
    SESSION_DURATION: 30 * 60 * 1000,
    _onStartSubscribers: [],
    
    // Internal property to hold the timer ID so we don't accidentally start duplicates
    _timerId: null,
    
    schedulePeriodicCallbacks(callbacks) {
        // ENGINEERED FIX: Correctly check for Array or single Function
        if (Array.isArray(callbacks)) {
            callbacks.forEach(cb => {
                if (typeof cb === 'function') this._onStartSubscribers.push(cb);
            });
        } else if (typeof callbacks === 'function') {
            this._onStartSubscribers.push(callbacks);
        } else {
            console.warn("Type error: callbacks must be a function or an array of functions");
        }
    },

    /**
     * Executes a function only if there is no active session, 
     * then immediately starts a new session to block subsequent calls.
     * Ideal for incrementing `total_sessions` on page load.
     * 
     * @param {Function} func - The callback function to execute.
     * @returns {void}
     */
    runOncePerSession(func) {
        if (!this.isActive()) {
            func(); 
            // ENGINEERED FIX: Corrected method call (added the underscore)
            this._startNewSession(); 
        } else {
            console.log("Call ignored: current session is still active");
        }
    },

    /**
     * Prevents a specific function from executing multiple times within a set delay.
     * Uses sessionStorage to create a temporary lock. Ideal for preventing 
     * rapid double-clicks on portfolio projects from artificially inflating metrics.
     * 
     * @param {string} key - A unique identifier for the event lock (e.g., 'view_gsp_project').
     * @param {number} delayMs - The cooldown duration in milliseconds before it can fire again.
     * @param {Function} func - The callback function to execute.
     * @returns {void}
     */
    debounceEvent(key, delayMs, func) {
        const lockKey = `arkana_lock_${key}`;
        
        if (!sessionStorage.getItem(lockKey)) {
            func(); 
            
            sessionStorage.setItem(lockKey, 'locked');
            
            setTimeout(() => {
                sessionStorage.removeItem(lockKey);
            }, delayMs);
        } else {
            console.log(`Duplicate event prevented for: ${key}`);
        }
    },

    /**
     * Initializes a new session in sessionStorage with a 30-minute expiration timestamp.
     * 
     * @returns {void}
     */
    _startNewSession() {
        const payload = {
            active: true,
            expires_at: Date.now() + this.SESSION_DURATION
        };
        sessionStorage.setItem('arkana_session', JSON.stringify(payload));
        
        this._onStartSubscribers.forEach(callback => {
            try { callback(); } catch (e) { console.error(e); }
        });
    },

    /**
     * Checks if a valid, unexpired session exists. 
     * Automatically cleans up the storage if the session has expired.
     * 
     * @returns {boolean} True if the session is active, false if expired or non-existent.
     */
    isActive() {
        const raw = sessionStorage.getItem('arkana_session');
        if (!raw) return false;

        const data = JSON.parse(raw);
        const now = Date.now();

        if (now > data.expires_at) {
            sessionStorage.removeItem('arkana_session');
            return false;
        }

        return true; 
    },

    ping() {
        if (!this.isActive()) {
            this._startNewSession();
        } else {
            const payload = {
                active: true,
                expires_at: Date.now() + this.SESSION_DURATION
            };
            sessionStorage.setItem('arkana_session', JSON.stringify(payload));
        }
    },
    
    /**
     * Starts the internal periodic stream.
     * @param {number} intervalMs - How often to ping (default: 60 seconds)
     */
    startAutoPing(intervalMs = 60000) {
        // 1. Prevent overlapping timers if called twice
        if (this._timerId) {
            clearInterval(this._timerId);
        }

        // 2. Fire an immediate ping on initialization
        this.ping();

        // 3. Start the internal periodic loop (JavaScript's version of Stream.periodic)
        // We use an arrow function () => to preserve the 'this' context.
        this._timerId = setInterval(() => {
            this.ping();
        }, intervalMs);

        // ENGINEERED FIX: Removed the recursive `this.startAutoPing(intervalMs)` call 
        // that would have caused an infinite stack-overflow crash.
    },

    /**
     * Safely kills the internal stream (useful for cleanup or pausing).
     */
    stopAutoPing() {
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = null;
        }
    }
};
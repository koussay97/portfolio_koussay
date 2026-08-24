/**
 * Consent Storage Manager
 * 
 * Schema:
 * ```js 
 *   arkana_consent_state: {
 *      analytics_storage: { granted: boolean, timestamp: string },
 *      ad_storage: { granted: boolean, timestamp: string },
 *      ad_user_data: { granted: boolean, timestamp: string },
 *      ad_personalization: { granted: boolean, timestamp: string }
 *   },
 * ```
 * how to use: 
 * 
 * ```js 
    function getConsentStateForGtag() {
        const mapStatus = (key) => ConsentStorage.isGranted(key) ? 'granted' : 'denied';
        return {
            'analytics_storage': mapStatus(ConsentStorage.ANALYTICS_STORAGE),
            'ad_storage': mapStatus(ConsentStorage.AD_STORAGE),
            'ad_user_data': mapStatus(ConsentStorage.AD_USER_DATA),
            'ad_personalization': mapStatus(ConsentStorage.AD_PERSONALIZATION)
        };
    }

    // Example usage when initializing consent:
    gtag('consent', 'default', {
        ...getConsentStateForGtag(),
        'wait_for_update': 500
    });

    // Example usage on popup 'Accept All' click:
    function onAcceptAllClicked() {
        ConsentStorage.setAll(true);
        gtag('consent', 'update', getConsentStateForGtag());
    } 
  ```

 */
export const ConsentStorage = {
  MAIN_KEY: 'arkana_consent_state',
  
  // The specific keys Google and standard CMPs look for
  ANALYTICS_STORAGE: 'analytics_storage',
  AD_STORAGE: 'ad_storage',
  AD_USER_DATA: 'ad_user_data',
  AD_PERSONALIZATION: 'ad_personalization',
  SECURITY_STORAGE: 'security_storage',       // NEW: Strictly Necessary
  FUNCTIONALITY_STORAGE: 'functionality_storage', // NEW: Strictly Necessary

  getAll() {
    try {
      const raw = localStorage.getItem(this.MAIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  getByKey(key) {
    const data = this.getAll();
    return data && data[key] ? data[key] : null;
  },

  set(key, granted) {
    try {
      const current = this.getAll() || {};
      current[key] = { granted: Boolean(granted), timestamp: new Date().toISOString() };
      localStorage.setItem(this.MAIN_KEY, JSON.stringify(current));
    } catch (e) {}
  },

  // NEW: Precise Key-by-Key setting
  setMultiple(permissionsMap) {
    try {
      const current = this.getAll() || {};
      const timestamp = new Date().toISOString();
      
      for (const [key, granted] of Object.entries(permissionsMap)) {
        current[key] = { granted: Boolean(granted), timestamp };
      }
      
      localStorage.setItem(this.MAIN_KEY, JSON.stringify(current));
    } catch (e) {}
  },

  setAll(granted) {
    const isGranted = Boolean(granted);
    this.setMultiple({
      [this.ANALYTICS_STORAGE]: isGranted,
      [this.AD_STORAGE]: isGranted,
      [this.AD_USER_DATA]: isGranted,
      [this.AD_PERSONALIZATION]: isGranted,
      [this.SECURITY_STORAGE]: true, // Security is always true
      [this.FUNCTIONALITY_STORAGE]: true // Functionality is always true
    });
  },

  isGranted(key) {
    const item = this.getByKey(key);
    return Boolean(item?.granted);
  },

  hasConsentRecorded() {
    return this.getAll() !== null;
  }
};
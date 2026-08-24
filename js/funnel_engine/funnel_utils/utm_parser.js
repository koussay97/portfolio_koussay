/**
 * 
 * @param {Map<string, any>} state 
 * @returns {Map<string, any>}
 */

export function captureUTMs(state) {
  // 1. Get current state from localStorage
  // let state = JSON.parse(localStorage.getItem(String(mainStorageKey)));

  // 2. Initialize the meta object if it doesn't exist
  if (!state.meta) state.meta = { utm: {} };

  // 3. Check if we already captured UTMs in a previous session
  // (We only want the very first source that brought them to you)
  if (Object.keys(state.meta.utm).length > 0) return;

  // 4. Parse the current URL
  const queryParams = new URLSearchParams(window.location.search);
  const source = queryParams.get("utm_source");

  // 5. If a UTM source exists, save it to the payload
  if (source) {
    state.meta.utm = {
      source: source,
      medium: queryParams.get("utm_medium") || null,
      campaign: queryParams.get("utm_campaign") || null,
      term: queryParams.get("utm_term") || null,
      content: queryParams.get("utm_content") || null,
    };

    // Also capture the referrer (e.g., "https://news.ycombinator.com")
    state.meta.initial_referrer = document.referrer || "direct";

    // Save back to local storage
    // return the state object, because we will initialize more values in the engine.
    return state;
    ///localStorage.setItem('arkana_lead_state', JSON.stringify(state));
  }
}


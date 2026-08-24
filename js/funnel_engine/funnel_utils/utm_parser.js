/**
 * 
 * @param {Map<string, any>} state 
 * @returns {Map<string, any>}
 */
export function captureUTMs(state) {
  // 1. Defend against null/undefined state (e.g., First-time visitor)
  if (!state) {
    state = {};
  }

  // 2. Initialize the meta object safely
  if (!state.meta) state.meta = {};
  if (!state.meta.utm) state.meta.utm = {};

  // 3. Check if we already captured UTMs in a previous session
  if (Object.keys(state.meta.utm).length > 0) {
    return state; // Exit early but MUST return the state
  }

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

    // Also capture the referrer (e.g., "https://linkedin.com")
    state.meta.initial_referrer = document.referrer || "direct";
  }

  // 6. ALWAYS return the state object so FunnelEngine can continue building it
  return state;
}
// ==========================================
// ANALYTICS & TELEMETRY MODULE
// ==========================================

/**
 * Dispatches events to the Google Tag Manager DataLayer.
 */
export function trackEvent(eventName, eventData = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        ...eventData
    });
    
    // Uncomment the line below if you want to see events fire in your console during testing
    // console.log(`[GTM Event]: ${eventName}`, eventData); 
}

/**
 * Initializes standalone observers and listeners for the analytics funnel.
 */
export function initAnalytics() {
    // --- Stage 1 & 3: Funnel Visibility Tracking (Scroll Observers) ---
    const funnelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'about') {
                    trackEvent('portfolio_engaged');
                }
                if (entry.target.id === 'contact') {
                    trackEvent('contact_initiated', { source: 'scroll' });
                }
                funnelObserver.unobserve(entry.target); // Only track once per session
            }
        });
    }, { threshold: 0.3 }); // Triggers when 30% of the section is visible

    const aboutSection = document.getElementById('about');
    const contactSection = document.getElementById('contact');
    if (aboutSection) funnelObserver.observe(aboutSection);
    if (contactSection) funnelObserver.observe(contactSection);

    // --- Stage 4: Intent Selection Tracking ---
    const intentSelect = document.getElementById('intent');
    if (intentSelect) {
        intentSelect.addEventListener('change', (e) => {
            trackEvent('intent_selected', { intent_value: e.target.value });
        });
    }
}


function obtainConsent(){
    /// we should explicitly say this 
    let localState = JSON.parse(localStorage.getItem('consent_state')|| null)
    if (localState){
        
    }
}
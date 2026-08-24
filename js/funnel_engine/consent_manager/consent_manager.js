// ==========================================
// CONSENT MANAGER
// ==========================================
import { ConsentStorage } from "./consent_storage.js"; 

// Initialize Google's DataLayer safely before GTM even loads
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

export const ConsentManager = {
    
    /**
     * Bootstraps Advanced Consent Mode.
     * Sets the default state to 'denied' allowing cookieless pings.
     */
    initGoogleConsentMode() {
        // If user already granted in a previous session, set default to granted.
        // Otherwise, set to denied (cookieless mode).
        const isGranted = ConsentStorage.isGranted(ConsentStorage.ANALYTICS_STORAGE) ? 'granted' : 'denied';
        
        gtag('consent', 'default', {
            'analytics_storage': isGranted,
            'ad_storage': isGranted,
            'ad_user_data': isGranted,
            'ad_personalization': isGranted,
            'security_storage': 'granted',       // Always granted to prevent site breaking
            'functionality_storage': 'granted',  // Always granted to prevent site breaking
            'wait_for_update': 500
        });
        
        // Pushes the explicit dataLayer event Google looks for
        gtag('set', 'url_passthrough', true); // Helps track sessions without cookies
    },

    /**
     * Verifies current consent or shows the popup if none exists.
     * @returns {Promise<number>} 0: Rejected, 1: Necessary Only, 2: All Granted
     */
    async verifyAndShowConsentPopup() {
        // Always enforce the default Google state first
        this.initGoogleConsentMode();

        // If we already have a record, return immediately without showing UI
        if (ConsentStorage.hasConsentRecorded()) {
            return ConsentStorage.isGranted(ConsentStorage.ANALYTICS_STORAGE) ? 2 : 1;
        }

        // Return a Promise that resolves when the user clicks a button
        return new Promise((resolve) => {
            const banner = document.getElementById('arkana-consent-banner');
            
            // Failsafe: if HTML is missing, default to 'Necessary Only'
            if (!banner) return resolve(1); 

            // Smoothly slide the banner up after 1 second of page load
            setTimeout(() => banner.classList.add('is-visible'), 1000);

            // Handle "Necessary Only" click
            document.getElementById('btn-consent-necessary').onclick = () => {
                this._select_allow_necessary();
                banner.classList.remove('is-visible');
                resolve(1);
            };

            // Handle "Accept All" click
            document.getElementById('btn-consent-all').onclick = () => {
                this._select_allow_all();
                banner.classList.remove('is-visible');
                resolve(2);
            };
        });
    },

    /**
     * Pushes the updated consent state to GTM / GA4.
     * @param {boolean} status 
     */
    _updateGoogleConsent(status) {
        const state = status ? 'granted' : 'denied';
        gtag('consent', 'update', {
            'analytics_storage': state,
            'ad_storage': state,
            'ad_user_data': state,
            'ad_personalization': state,
            'security_storage': 'granted',
            'functionality_storage': 'granted'
        });
    },

    /**
     * Explicitly defines permissions key-by-key for "Necessary Only".
     */
    _select_allow_necessary() {
        ConsentStorage.setMultiple({
            [ConsentStorage.SECURITY_STORAGE]: true,
            [ConsentStorage.FUNCTIONALITY_STORAGE]: true,
            [ConsentStorage.ANALYTICS_STORAGE]: false,
            [ConsentStorage.AD_STORAGE]: false,
            [ConsentStorage.AD_USER_DATA]: false,
            [ConsentStorage.AD_PERSONALIZATION]: false
        });
        this._updateGoogleConsent(false);
    },

    /**
     * Grants all tracking permissions.
     */
    _select_allow_all() {
        ConsentStorage.setAll(true);
        this._updateGoogleConsent(true);
    },

    /**
     * Revokes all non-essential permissions.
     */
    _reject_all() {
        ConsentStorage.setAll(false);
        this._updateGoogleConsent(false);
    }
};
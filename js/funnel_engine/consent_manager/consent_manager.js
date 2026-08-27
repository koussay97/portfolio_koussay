// ==========================================
// CONSENT MANAGER
// ==========================================
import { ConsentStorage } from "./consent_storage.js"; 

// Access the global gtag function defined in the HTML
const gtag = window.gtag || function() { window.dataLayer.push(arguments); };

export const ConsentManager = {
    
    /**
     * Verifies current consent or shows the popup if none exists.
     * @returns {Promise<number>} 0: Rejected, 1: Necessary Only, 2: All Granted
     */
    async verifyAndShowConsentPopup() {
        // We no longer need this.initGoogleConsentMode() here!

        if (ConsentStorage.hasConsentRecorded()) {
            return ConsentStorage.isGranted(ConsentStorage.ANALYTICS_STORAGE) ? 2 : 1;
        }

        return new Promise((resolve) => {
            const banner = document.getElementById('arkana-consent-banner');
            if (!banner) return resolve(1); 

            setTimeout(() => banner.classList.add('is-visible'), 1000);

            document.getElementById('btn-consent-necessary').onclick = () => {
                this._select_allow_necessary();
                banner.classList.remove('is-visible');
                resolve(1); // FunnelEngine sees 1 and halts
            };

            document.getElementById('btn-consent-all').onclick = () => {
                this._select_allow_all();
                banner.classList.remove('is-visible');
                resolve(2); // FunnelEngine sees 2 and starts tracking
            };
        });
    },

    _updateGoogleConsent(status) {
        const state = status ? 'granted' : 'denied';
        
        // This 'update' command tells Google to immediately adapt its tracking behavior
        gtag('consent', 'update', {
            'analytics_storage': state,
            'ad_storage': state,
            'ad_user_data': state,
            'ad_personalization': state,
            'security_storage': 'granted',
            'functionality_storage': 'granted'
        });
    },

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

    _select_allow_all() {
        ConsentStorage.setAll(true);
        this._updateGoogleConsent(true);
    }
};
// ==========================================
// FORM VALIDATION & BUSINESS LOGIC
// ==========================================
import { FunnelEngine } from "./funnel_engine/funnel_utils/funnel_engine.js";

export function initForm() {
    const intentSelect = document.getElementById('intent');
    const demoFields = document.querySelectorAll('.demo-only-field');
    const demoSelect = document.getElementById('demo');
    const urlInput = document.getElementById('url');
    const contactForm = document.getElementById('arkana-contact-form');

    // 1. Dynamic Form Fields Based on Intent
    if (intentSelect) {
        intentSelect.addEventListener('change', (e) => {
            const isDemo = e.target.value === 'general_synergy';
            
            // ANALYTICS: Track the segment they selected
            FunnelEngine.updateIntent({ form_topic_selected: e.target.value });
            
            demoFields.forEach(field => {
                field.style.display = isDemo ? 'flex' : 'none';
            });

            if (isDemo) {
                if (demoSelect) demoSelect.setAttribute('required', 'true');
                if (urlInput) urlInput.setAttribute('required', 'true');
            } else {
                if (demoSelect) demoSelect.removeAttribute('required');
                if (urlInput) urlInput.removeAttribute('required');
            }
        });
    }

    // 2. Handle "Request a Demo" button clicks
    const demoButtons = document.querySelectorAll('.store-link');
    demoButtons.forEach(btn => {
        if (btn.textContent.trim().toLowerCase() === 'request a demo') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const projectCard = btn.closest('.project-card');
                const projectId = projectCard ? projectCard.getAttribute('data-project') : null;
                
                if (intentSelect) {
                    intentSelect.value = 'general_synergy';
                    intentSelect.dispatchEvent(new Event('change')); // Triggers the hidden fields
                }
                
                if (demoSelect) {
                    if (projectId === 'joel') demoSelect.value = 'Joel apps';
                    if (projectId === 'mushir') demoSelect.value = 'Mushir';
                }

                showToast(`Demo requested for ${projectId === 'joel' ? 'Joel Apps' : 'Mushir'}. Please submit the form below.`);

                // ANALYTICS: Flag the form as initiated and track the project click
                FunnelEngine.updateIntent({ form_initiated: true, form_topic_selected: 'general_synergy' });
                if (projectId) {
                    FunnelEngine.updateEvaluation(projectId, 'store_link');
                }

                const contactSection = document.getElementById('contact');
                if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    });

    // 3. Engineered Form Validation Middleware
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

            if (messageInput.value.trim().length < 20) {
                e.preventDefault();
                showToast("Transmission denied: Details must be at least 20 characters.");
                messageInput.focus();
                return;
            }

            if (!emailRegex.test(emailInput.value.trim())) {
                e.preventDefault();
                showToast("Transmission denied: Invalid return protocol (email format).");
                emailInput.focus();
                return;
            }

            if (urlInput.hasAttribute('required')) {
                if (!urlRegex.test(urlInput.value.trim())) {
                    e.preventDefault();
                    showToast("Transmission denied: Invalid company website URL.");
                    urlInput.focus();
                    return;
                }
            }

            // ANALYTICS: Conversion!
            // We no longer manually pack the payload. The FunnelEngine handles 
            // aggregating the final score, time spent, and the intent topic securely.
            FunnelEngine.updateConversion({ converted: true });
        });
    }
}

// 4. Sleek Toast Notification System (Exported so it can be used globally if ever needed)
export function showToast(message) {
    let toast = document.getElementById('arkana-toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'arkana-toast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: var(--card-dark, #1F2937); color: #fff; padding: 14px 28px;
            border-radius: 8px; font-size: 0.95rem; font-weight: 500; z-index: 9999;
            opacity: 0; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid var(--accent, #F59E0B);
            text-align: center; pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
    }, 4000);
}
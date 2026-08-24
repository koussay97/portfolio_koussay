import { initAnimations } from './animations.js';
import { ThreeScene } from './ThreeScene.js';
import { initForm } from './form_submission.js';
import { FunnelEngine } from './funnel_engine.js'; // NEW IMPORT

async function init() {
    // 1. Initialize Navigation Logic
    initNav();

    // 2. Initialize Forms & Business Logic
    initForm();

    // 3. Initialize Three.js Background
    new ThreeScene('canvas-container');

    // 4. Initialize GSAP Animations (Renders the site immediately)
    initAnimations();

    // 5. Boot the Funnel Engine (Non-Blocking)
    // We do NOT use 'await' here. This allows the engine to pause and wait 
    // for the consent banner in the background without freezing the UI.
    FunnelEngine.init().catch(console.error);
}

function initNav() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileToggle || !navLinks) return;

    mobileToggle.addEventListener('click', () => {
        const isCurrentlyOpen = navLinks.classList.contains('is-open');
        mobileToggle.classList.toggle('is-open');
        navLinks.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', !isCurrentlyOpen);
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
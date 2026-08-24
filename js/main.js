import { initAnimations } from './animations.js';
import { ThreeScene } from './ThreeScene.js';
import { initForm } from './form_submission.js';
import { FunnelEngine } from './funnel_engine/funnel_utils/funnel_engine.js';
import { initTemplates } from './loader.js';

async function init() {
    // 1. INJECT THE HTML TEMPLATES
    // This MUST run first, otherwise the page is blank and GSAP crashes!
    await initTemplates();
    
    // 2. Initialize Navigation and Forms
    initNav();
    initForm();
    
    // 3. Initialize Three.js Scene
    // Make sure your hero.html has <div id="canvas-container"></div> inside it
    new ThreeScene('canvas-container');

    // 4. Initialize GSAP Animations
    initAnimations();

    // 5. Boot the Funnel Engine in the background
    FunnelEngine.init().catch(console.error);
}

/**
 * Handles Mobile Navigation Toggle & Accessibility states
 */
function initNav() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileToggle || !navLinks) return;

    // Toggle menu open/close
    mobileToggle.addEventListener('click', () => {
        const isCurrentlyOpen = navLinks.classList.contains('is-open');
        
        mobileToggle.classList.toggle('is-open');
        navLinks.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', !isCurrentlyOpen);
    });
    
    // Auto-close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
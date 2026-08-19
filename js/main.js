import { initTemplates } from './loader.js';
import { initAnimations } from './animations.js';
import { ThreeScene } from './ThreeScene.js';

async function init() {
    // 1. Load all HTML templates first
    await initTemplates();

    initNav();
    // 2. Initialize Three.js Scene
    new ThreeScene('canvas-container');

    // 3. Initialize GSAP Animations (must run after templates are loaded)
    initAnimations();
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
        
        // Semantic state toggle
        mobileToggle.classList.toggle('is-open');
        navLinks.classList.toggle('is-open');
        
        // Accessibility update
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

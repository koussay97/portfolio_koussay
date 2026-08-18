import { initTemplates } from './loader.js';
import { initAnimations } from './animations.js';
import { ThreeScene } from './ThreeScene.js';

async function init() {
    // 1. Load all HTML templates first
    await initTemplates();

    // 2. Initialize Three.js Scene
    new ThreeScene('canvas-container');

    // 3. Initialize GSAP Animations (must run after templates are loaded)
    initAnimations();
}

document.addEventListener('DOMContentLoaded', init);

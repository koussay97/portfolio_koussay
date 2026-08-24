import { FunnelEngine } from "./funnel_engine/funnel_utils/funnel_engine.js";

export function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Lightbox Logic ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-content');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');

    const openLightbox = (src) => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
    };
    const closeLightbox = () => lightbox?.classList.remove('active');
    
    lightbox?.addEventListener('click', closeLightbox);
    lightboxClose?.addEventListener('click', closeLightbox);

 
    // --- 2. Initial Fade Reveals (Engineered Batch Processor) ---
    // ScrollTrigger.batch solves the "global delay leak" by only staggering items 
    // that enter the viewport at the exact same time.
    gsap.set(".fade-up", { y: 30, opacity: 0 });

    ScrollTrigger.batch(".fade-up", {
        start: "top 85%", 
        once: true,
        onEnter: (batch) => {
            gsap.to(batch, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "all"
            });
        }
    });

    // --- 3. FLIP Animation Engine (Grid Repositioning) ---
    const performFlipLayout = (action) => {
        const cards = document.querySelectorAll('.project-card');
        
        const state1 = Array.from(cards).map(c => ({
            el: c,
            rect: c.getBoundingClientRect()
        }));

        action();

        requestAnimationFrame(() => {
            state1.forEach(item => {
                const newRect = item.el.getBoundingClientRect();
                const dx = item.rect.left - newRect.left;
                const dy = item.rect.top - newRect.top;

                if (dx !== 0 || dy !== 0) {
                    gsap.killTweensOf(item.el); 
                    gsap.fromTo(item.el, 
                        { x: dx, y: dy }, 
                        { x: 0, y: 0, duration: 0.6, ease: "power3.inOut", clearProps: "transform" }
                    );
                }
            });
        });
    };

    // --- 4. Semantic 3D Flip Engine (Front vs Back) ---
    document.querySelectorAll('.project-card').forEach(card => {
        const inner = card.querySelector('.card-inner');
        const faceFront = card.querySelector('.face-front');
        const faceBack = card.querySelector('.face-back');
        
        const frontIdle = card.querySelector('.front-idle-content');
        const frontExpanded = card.querySelector('.front-expanded-content');

        // Setup Carousel
        let carouselInterval;
        const slides = card.querySelectorAll('.carousel-slide');
        const indicators = card.querySelectorAll('.indicator');
        let currentSlide = 0;

        const startCarousel = () => {
            if (slides.length <= 1) return;
            carouselInterval = setInterval(() => {
                if(slides[currentSlide]) slides[currentSlide].classList.remove('active');
                if(indicators[currentSlide]) indicators[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                if(slides[currentSlide]) slides[currentSlide].classList.add('active');
                if(indicators[currentSlide]) indicators[currentSlide].classList.add('active');
            }, 3000);
        };
        const stopCarousel = () => clearInterval(carouselInterval);

        let currentState = 'IDLE'; 

        card.addEventListener('forceIdle', () => {
            if (currentState !== 'IDLE') {
                currentState = 'IDLE';
                card.classList.remove('is-active');
                frontIdle.classList.remove('hidden');
                frontExpanded.classList.add('hidden');
                stopCarousel();
                
                gsap.to(inner, { rotateY: 0, duration: 0.6, ease: "power3.inOut" });
                faceFront.style.visibility = 'visible';
                faceBack.style.visibility = 'hidden';
            }
        });

        const applyState = (newState) => {
            const oldState = currentState;
            if (oldState === newState) return;
            
            const isLayoutChange = (oldState === 'IDLE' || newState === 'IDLE');

            const stateChangeLogic = () => {
                currentState = newState;
                
                // Only reorder (prepend) on Desktop grids
                if (oldState === 'IDLE' && newState === 'EXPANDED' && window.innerWidth > 900) {
                    card.parentNode.prepend(card);
                }
                
                if (currentState === 'IDLE') {
                    card.classList.remove('is-active');
                    frontIdle.classList.remove('hidden');
                    frontExpanded.classList.add('hidden');
                    stopCarousel();
                } else {
                    card.classList.add('is-active');
                    frontIdle.classList.add('hidden');
                    frontExpanded.classList.remove('hidden');
                    if (currentState === 'EXPANDED') startCarousel();
                    else stopCarousel(); 
                }

                let targetY = (currentState === 'FLIPPED') ? -180 : 0;
                let activeFace = (currentState === 'FLIPPED') ? faceBack : faceFront;

                faceFront.style.visibility = 'visible';
                faceBack.style.visibility = 'visible';

                gsap.to(inner, {
                    rotateY: targetY, 
                    duration: 0.8, 
                    ease: "power3.inOut",
                    onComplete: () => {
                        faceFront.style.visibility = (activeFace === faceFront) ? 'visible' : 'hidden';
                        faceBack.style.visibility = (activeFace === faceBack) ? 'visible' : 'hidden';
                        const scrollable = activeFace.querySelector('.scrollable-text');
                        if (scrollable) scrollable.scrollTop = 0;
                    }
                });

                if (oldState === 'IDLE' && newState === 'EXPANDED') {
                    setTimeout(() => {
                        const yOffset = -100;
                        const targetElement = window.innerWidth > 900 ? card.closest('.projects-grid') : card;
                        const y = targetElement.getBoundingClientRect().top + window.scrollY + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                    }, 50);
                }
            };

            if (isLayoutChange) {
                if (newState === 'EXPANDED') {
                    document.querySelectorAll('.project-card').forEach(c => {
                        if (c !== card) c.dispatchEvent(new Event('forceIdle'));
                    });
                }
                performFlipLayout(stateChangeLogic);
            } else {
                stateChangeLogic();
            }
        };

        // Event Listeners for semantic interactions
        card.addEventListener('click', (e) => {
            e.stopPropagation();

            const projectId = card.getAttribute('data-project');

            if (e.target.closest('.read-more-btn')) applyState('EXPANDED');
            if (e.target.closest('.btn-back-idle')) applyState('IDLE');
            
            // Front to Back (Architectural Evaluation)
            if (e.target.closest('.btn-flip-back')){
                applyState('FLIPPED');
                // ANALYTICS: Track the physical 3D flip evaluation
                FunnelEngine.updateEvaluation(projectId, 'flipped');
            } 
            
            // Back to Front
            if (e.target.closest('.btn-flip-front')) applyState('EXPANDED');

            // Image Gallery Clicks
            const galleryImg = e.target.closest('.detail-gallery-img');
            if (galleryImg) {
                openLightbox(galleryImg.src);
                // ANALYTICS: Track that they are viewing visual evidence
                FunnelEngine.updateEvaluation(projectId, 'gallery');
            }
        });
    });

    // --- 5. "Meet the Team" Easter Egg Logic ---
    const btnMeetTeam = document.getElementById('btn-meet-team');
    const teamContainer = document.getElementById('team-easter-egg');
    const teamCards = document.querySelectorAll('.team-card');
    const detailPanes = document.querySelectorAll('.detail-pane');

    if (btnMeetTeam && teamContainer) {
        btnMeetTeam.addEventListener('click', () => {
            const isHidden = !teamContainer.classList.contains('is-visible');
            
            if (isHidden) {
                teamContainer.classList.add('is-visible');
                btnMeetTeam.textContent = "Hide Team Structure";
                
                // ANALYTICS: Track that they explored your operational philosophy
                FunnelEngine.updateInterest({ explored_team_philosophy: true });
                
                setTimeout(() => {
                    const y = teamContainer.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    
                    gsap.fromTo(teamCards, 
                        { y: 30, opacity: 0 }, 
                        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out" }
                    );
                }, 100);
            } else {
                teamContainer.classList.remove('is-visible');
                btnMeetTeam.textContent = "View Team Structure";
            }
        });

        const activateCard = (card) => {
            if (card.classList.contains('is-active')) return; 

            const targetId = card.getAttribute('data-target');
            
            teamCards.forEach(c => c.classList.remove('is-active'));
            detailPanes.forEach(p => p.classList.remove('is-active'));
            
            card.classList.add('is-active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('is-active');
        };

        teamCards.forEach(card => {
            card.addEventListener('mouseenter', () => activateCard(card));
            card.addEventListener('click', () => {
                activateCard(card);
                if (window.innerWidth <= 900) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        });

        const scrollContainer = document.querySelector('.team-grid');
        if (scrollContainer) {
            const observerOptions = {
                root: scrollContainer,
                rootMargin: '0px',
                threshold: 0.6 
            };

            const swipeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && window.innerWidth <= 900) {
                        activateCard(entry.target);
                    }
                });
            }, observerOptions);

            teamCards.forEach(card => swipeObserver.observe(card));
        }
    }

    // --- 6. Technical Capabilities Accordion ---
    const techModules = document.querySelectorAll('.tech-module');
    
    techModules.forEach(module => {
        const header = module.querySelector('.tech-module-header');
        header.addEventListener('click', () => {
            const isOpen = module.classList.contains('is-open');
            
            techModules.forEach(m => m.classList.remove('is-open'));
            
            if (!isOpen) {
                module.classList.add('is-open');
                
                // ANALYTICS: Opening an accordion proves technical interest. Bump funnel score.
                FunnelEngine.updateInterest({});
                
                setTimeout(() => {
                    const rect = module.getBoundingClientRect();
                    if (rect.bottom > window.innerHeight) {
                        window.scrollBy({ top: rect.bottom - window.innerHeight + 20, behavior: 'smooth' });
                    }
                }, 400);
            }
        });
    });
}
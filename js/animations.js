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

    // --- 2. Initial Fade Reveals ---
    // This existing block handles the Hero entrance perfectly
    gsap.utils.toArray('.fade-up').forEach((element, index) => {
        gsap.from(element, {
            scrollTrigger: { 
                trigger: element, 
                start: "top 90%", 
                once: true 
            },
            y: 30, // Reduced from 60 to make the motion calmer
            opacity: 0, 
            duration: 1, 
            delay: index * 0.15, // Staggered entrance for hero elements
            ease: "power3.out",
            clearProps: "all"
        });
    });
    // --- 3. FLIP Animation Engine (Grid Repositioning) ---
    const performFlipLayout = (action) => {
        const cards = document.querySelectorAll('.project-card');
        
        // Step A: Record First positions
        const state1 = Array.from(cards).map(c => ({
            el: c,
            rect: c.getBoundingClientRect()
        }));

        // Step B: Execute the layout-changing actions (classes, DOM moves)
        action();

        // Step C: Play GSAP invert animation
        requestAnimationFrame(() => {
            state1.forEach(item => {
                const newRect = item.el.getBoundingClientRect();
                const dx = item.rect.left - newRect.left;
                const dy = item.rect.top - newRect.top;

                // Only animate if the card actually moved on the screen
                if (dx !== 0 || dy !== 0) {
                    gsap.killTweensOf(item.el); // Prevent overlaps
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

        let currentState = 'IDLE'; // IDLE, EXPANDED, FLIPPED

        card.addEventListener('forceIdle', () => {
            if (currentState !== 'IDLE') {
                currentState = 'IDLE';
                card.classList.remove('is-active');
                frontIdle.classList.remove('hidden');
                frontExpanded.classList.add('hidden');
                stopCarousel();
                
                // Immediately reset 3D rotation
                gsap.to(inner, { rotateY: 0, duration: 0.6, ease: "power3.inOut" });
                faceFront.style.visibility = 'visible';
                faceBack.style.visibility = 'hidden';
            }
        });

        const applyState = (newState) => {
            const oldState = currentState;
            if (oldState === newState) return;
            
            // Check if this triggers a grid size change (FLIP animation required)
            const isLayoutChange = (oldState === 'IDLE' || newState === 'IDLE');

            const stateChangeLogic = () => {
                currentState = newState;
                
                if (oldState === 'IDLE' && newState === 'EXPANDED') {
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
                    else stopCarousel(); // Stop when flipped
                }

                // Handle the 3D Rotation
                let targetY = (currentState === 'FLIPPED') ? -180 : 0;
                let activeFace = (currentState === 'FLIPPED') ? faceBack : faceFront;

                // Ensure both faces are visible during the rotation
                faceFront.style.visibility = 'visible';
                faceBack.style.visibility = 'visible';

                gsap.to(inner, {
                    rotateY: targetY, 
                    duration: 0.8, 
                    ease: "power3.inOut",
                    onComplete: () => {
                        // Hide the inactive face after rotation to prevent clipping issues
                        faceFront.style.visibility = (activeFace === faceFront) ? 'visible' : 'hidden';
                        faceBack.style.visibility = (activeFace === faceBack) ? 'visible' : 'hidden';
                        
                        // Reset scroll positions
                        const scrollable = activeFace.querySelector('.scrollable-text');
                        if (scrollable) scrollable.scrollTop = 0;
                    }
                });

                // Auto-scroll logic when expanding
                if (oldState === 'IDLE' && newState === 'EXPANDED') {
                    setTimeout(() => {
                        const gridContainer = card.closest('.projects-grid');
                        const yOffset = -100;
                        const y = gridContainer.getBoundingClientRect().top + window.scrollY + yOffset;
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

        // Event Listeners for the semantic buttons
        card.addEventListener('click', (e) => {
            e.stopPropagation();

            if (e.target.closest('.read-more-btn')) applyState('EXPANDED');
            if (e.target.closest('.btn-back-idle')) applyState('IDLE');
            
            // Front to Back
            if (e.target.closest('.btn-flip-back')) applyState('FLIPPED');
            
            // Back to Front
            if (e.target.closest('.btn-flip-front')) applyState('EXPANDED');

            const galleryImg = e.target.closest('.detail-gallery-img');
            if (galleryImg) openLightbox(galleryImg.src);
        });
    });

// --- 5. "Meet the Team" Easter Egg Logic ---
    const btnMeetTeam = document.getElementById('btn-meet-team');
    const teamContainer = document.getElementById('team-easter-egg');
    const teamCards = document.querySelectorAll('.team-card');
    const detailPanes = document.querySelectorAll('.detail-pane');

    if (btnMeetTeam && teamContainer) {
        // Toggle the entire Easter Egg section
        btnMeetTeam.addEventListener('click', () => {
            const isHidden = !teamContainer.classList.contains('is-visible');
            
            if (isHidden) {
                teamContainer.classList.add('is-visible');
                btnMeetTeam.textContent = "Hide Team Structure";
                
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

        // Master-Detail Hover & Click Logic
        teamCards.forEach(card => {
            const triggerDetail = () => {
                const targetId = card.getAttribute('data-target');
                
                // Remove active class from all cards and panes
                teamCards.forEach(c => c.classList.remove('is-active'));
                detailPanes.forEach(p => p.classList.remove('is-active'));
                
                // Activate selected card and pane
                card.classList.add('is-active');
                const targetPane = document.getElementById(targetId);
                if (targetPane) targetPane.classList.add('is-active');

                // NEW: On mobile, gracefully slide the tapped card into the center
                if (window.innerWidth <= 900) {
                    card.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest', 
                        inline: 'center' 
                    });
                }
            };

            card.addEventListener('mouseenter', triggerDetail);
            card.addEventListener('click', triggerDetail);
        });
    }
    // --- 6. Technical Capabilities Accordion ---
    const techModules = document.querySelectorAll('.tech-module');
    
    techModules.forEach(module => {
        const header = module.querySelector('.tech-module-header');
        header.addEventListener('click', () => {
            const isOpen = module.classList.contains('is-open');
            
            // Optional: Close all other modules first for a cleaner UX
            techModules.forEach(m => m.classList.remove('is-open'));
            
            // If it wasn't already open, open it
            if (!isOpen) {
                module.classList.add('is-open');
                
                // Semantic UX: Scroll module into view if offscreen
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
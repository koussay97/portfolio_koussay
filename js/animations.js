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
    gsap.utils.toArray('.fade-up').forEach((element) => {
        gsap.from(element, {
            scrollTrigger: { 
                trigger: element,
                 start: "top 85%",
                  //toggleActions: "play none none reverse",
                  once: true 
                 },
            y: 60, opacity: 0, duration: 1, ease: "power3.out",clearProps: "all"
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

    // --- 4. Multi-State 3D Flip Engine ---
    document.querySelectorAll('.project-card').forEach(card => {
        const inner = card.querySelector('.card-inner');
        
        const faceFront = card.querySelector('.face-front');
        const faceContent1 = card.querySelector('.face-content-1');
        const faceContent2 = card.querySelector('.face-content-2'); // Might be null
        const faceFinal = card.querySelector('.face-final');
        
        const frontIdle = card.querySelector('.front-idle-content');
        const frontExpanded = card.querySelector('.front-expanded-content');

        // Setup Carousel
        let carouselInterval;
        const slides = card.querySelectorAll('.carousel-slide');
        const indicatorContainer = card.querySelector('.carousel-indicators');
        let currentSlide = 0;

        if (indicatorContainer && slides.length > 0) {
            indicatorContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.classList.add('indicator');
                if (idx === 0) dot.classList.add('active');
                indicatorContainer.appendChild(dot);
            });
        }
        const indicators = card.querySelectorAll('.indicator');

        const startCarousel = () => {
            if (slides.length <= 1) return;
            carouselInterval = setInterval(() => {
                slides[currentSlide].classList.remove('active');
                indicators[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
                indicators[currentSlide].classList.add('active');
            }, 3000);
        };
        const stopCarousel = () => clearInterval(carouselInterval);

        const hasContent2 = !!faceContent2;
        const finalYRotation = hasContent2 ? -360 : -180;
        
        if (faceContent1) faceContent1.style.transform = `rotateY(180deg) rotateX(0deg)`;
        if (faceContent2) faceContent2.style.transform = `rotateY(360deg) rotateX(0deg)`;
        if (faceFinal) faceFinal.style.transform = `rotateY(${Math.abs(finalYRotation)}deg) rotateX(180deg)`;

        let currentState = 'IDLE';
        let activeFace = faceFront;

        // Custom event so other cards can force this card back to IDLE 
        card.addEventListener('forceIdle', () => {
            if (currentState !== 'IDLE') {
                currentState = 'IDLE';
                card.classList.remove('is-active');
                frontIdle.classList.remove('hidden');
                frontExpanded.classList.add('hidden');
                stopCarousel();
                
                // Immediately spin back to front face
                gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.inOut" });
                
                const allFaces = [faceFront, faceContent1, faceContent2, faceFinal].filter(f=>f);
                allFaces.forEach(face => { face.style.visibility = (face === faceFront) ? 'visible' : 'hidden'; });
            }
        });

        const applyState = (newState) => {
            const oldState = currentState;
            if (oldState === newState) return;
            
            // Check if this state change triggers a grid size layout change
            const isLayoutChange = (oldState === 'IDLE' || newState === 'IDLE');

            const stateChangeLogic = () => {
                currentState = newState;
                
                // Logic: If expanding from IDLE, move DOM element to index 0
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
                    if(oldState === 'IDLE') startCarousel();
                }

                if (currentState !== 'EXPANDED' && currentState !== 'IDLE') stopCarousel();

                let targetX = 0, targetY = 0;
                switch(currentState) {
                    case 'IDLE': case 'EXPANDED': targetX = 0; targetY = 0; activeFace = faceFront; break;
                    case 'CONTENT_1': targetX = 0; targetY = -180; activeFace = faceContent1; break;
                    case 'CONTENT_2': targetX = 0; targetY = -360; activeFace = faceContent2; break;
                    case 'FINAL': targetX = -180; targetY = finalYRotation; activeFace = faceFinal; break;
                }

                const allFaces = [faceFront, faceContent1, faceContent2, faceFinal].filter(f => f);
                allFaces.forEach(face => {
                    if (face === activeFace || face.style.visibility === 'visible') face.style.visibility = 'visible';
                    else face.style.visibility = 'hidden';
                });

                gsap.to(inner, {
                    rotateX: targetX, rotateY: targetY, duration: 0.8, ease: "power3.inOut",
                    onComplete: () => {
                        allFaces.forEach(face => {
                            face.style.visibility = (face === activeFace) ? 'visible' : 'hidden';
                        });
                        const scrollable = activeFace.querySelector('.scrollable-text');
                        if (scrollable) scrollable.scrollTop = 0;
                    }
                });

                // ==========================================
                // FIX: Auto-scroll accurately to grid start 
                // ==========================================
                if (oldState === 'IDLE' && newState === 'EXPANDED') {
                    setTimeout(() => {
                        const gridContainer = card.closest('.projects-grid');
                        const yOffset = -100; // Account for fixed nav spacing (adjust if needed)
                        
                        // By tracking the grid container rather than the card itself,
                        // we bypass GSAP's mid-flight transform coordinates 
                        const y = gridContainer.getBoundingClientRect().top + window.scrollY + yOffset;
                        
                        window.scrollTo({top: y, behavior: 'smooth'});
                    }, 50);
                }
            };

            // If layout dictates grid repaints, wrap it in the FLIP engine!
            if (isLayoutChange) {
                if (newState === 'EXPANDED') {
                    // Tell all OTHER cards to close themselves
                    document.querySelectorAll('.project-card').forEach(c => {
                        if (c !== card) c.dispatchEvent(new Event('forceIdle'));
                    });
                }
                performFlipLayout(stateChangeLogic);
            } else {
                stateChangeLogic(); // Just standard 3D flip, no grid recalculation needed
            }
        };

        card.addEventListener('click', (e) => {
            e.stopPropagation();

            if (e.target.closest('.read-more-btn')) applyState('EXPANDED');
            
            if (e.target.closest('.btn-next-content1')) applyState('CONTENT_1');
            if (e.target.closest('.btn-next-content2')) applyState('CONTENT_2');
            if (e.target.closest('.btn-next-final')) applyState('FINAL');
            
            if (e.target.closest('.btn-back-idle') || e.target.closest('.btn-close-idle')) applyState('IDLE');
            if (e.target.closest('.btn-back-expanded')) applyState('EXPANDED');
            if (e.target.closest('.btn-back-content1')) applyState('CONTENT_1');
            if (e.target.closest('.btn-back-content2')) {
                applyState(hasContent2 ? 'CONTENT_2' : 'CONTENT_1'); 
            }

            const galleryImg = e.target.closest('.detail-gallery-img');
            if (galleryImg) openLightbox(galleryImg.src);
        });

        // Mouse Parallax for flipped faces
        card.addEventListener('mousemove', (e) => {
            if (currentState === 'IDLE' || currentState === 'EXPANDED') return;
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const visibleParallax = activeFace?.querySelector('.parallax-img');
            if (visibleParallax) {
                gsap.to(visibleParallax, { x: x * 40, y: y * 40, duration: 0.3, ease: "power2.out" });
            }
        });

        card.addEventListener('mouseleave', () => {
            card.querySelectorAll('.parallax-img').forEach(img => {
                gsap.to(img, { x: 0, y: 0, duration: 0.5 });
            });
        });
    });
}
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
            // Because they are already hidden, we animate TO their natural state
            gsap.to(batch, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "all" // Cleans up the inline styles after completion
            });
        }
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
                
                // ENGINEERED FIX: Only reorder (prepend) on Desktop grids.
                // On mobile, keep the card exactly where it is in the scroll list to preserve context.
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
                        const yOffset = -100; // Account for fixed nav
                        
                        // Desktop: Scroll to grid top. Mobile: Scroll to card top.
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

        // Extracted Core Logic for activating a card
        const activateCard = (card) => {
            // Prevent unnecessary DOM updates if already active
            if (card.classList.contains('is-active')) return; 

            const targetId = card.getAttribute('data-target');
            
            // Reset all
            teamCards.forEach(c => c.classList.remove('is-active'));
            detailPanes.forEach(p => p.classList.remove('is-active'));
            
            // Activate target
            card.classList.add('is-active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('is-active');
        };

        // 1. Mouse & Click Listeners
        teamCards.forEach(card => {
            card.addEventListener('mouseenter', () => activateCard(card));
            card.addEventListener('click', () => {
                activateCard(card);
                // If on mobile and tapped, slide it to center manually
                if (window.innerWidth <= 900) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        });

        // 2. Swiping Sensor (Intersection Observer for Mobile)
        // This detects when a card snaps into the center via swipe
        const scrollContainer = document.querySelector('.team-grid');
        if (scrollContainer) {
            const observerOptions = {
                root: scrollContainer,
                rootMargin: '0px',
                threshold: 0.6 // Triggers when 60% of the card is visible in the container
            };

            const swipeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Only apply swipe logic on mobile layouts
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
    // --- 7. Contact Form Logic & Demo Routing ---
    const intentSelect = document.getElementById('intent');
    const demoFields = document.querySelectorAll('.demo-only-field');
    const demoSelect = document.getElementById('demo');
    const urlInput = document.getElementById('url');

    // 7A. Dynamic Form Fields Based on Intent
    if (intentSelect) {
        intentSelect.addEventListener('change', (e) => {
            const isDemo = e.target.value === 'general_synergy';
            
            demoFields.forEach(field => {
                // Show/hide the form groups
                field.style.display = isDemo ? 'flex' : 'none';
            });

            // Dynamically add/remove the 'required' attribute
            if (isDemo) {
                if (demoSelect) demoSelect.setAttribute('required', 'true');
                if (urlInput) urlInput.setAttribute('required', 'true');
            } else {
                if (demoSelect) demoSelect.removeAttribute('required');
                if (urlInput) urlInput.removeAttribute('required');
            }
        });
    }

    // 7B. Handle "Request a Demo" button clicks on Project Cards
    const demoButtons = document.querySelectorAll('.store-link');
    demoButtons.forEach(btn => {
        if (btn.textContent.trim().toLowerCase() === 'request a demo') {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent it from trying to act like a normal link
                
                // 1. Identify which project card the button belongs to
                const projectCard = btn.closest('.project-card');
                const projectId = projectCard ? projectCard.getAttribute('data-project') : null;
                
                // 2. Set the Intent to Demo & trigger the UI update
                if (intentSelect) {
                    intentSelect.value = 'general_synergy';
                    intentSelect.dispatchEvent(new Event('change')); // Forces the hidden fields to appear
                }
                
                // 3. Set the specific project in the newly revealed dropdown
                if (demoSelect) {
                    if (projectId === 'joel') demoSelect.value = 'Joel apps';
                    if (projectId === 'mushir') demoSelect.value = 'Mushir';
                }

                // 4. Show engineered Toast Popup
                showToast(`Demo requested for ${projectId === 'joel' ? 'Joel Apps' : 'Mushir'}. Please submit the form below.`);

                // 5. Smooth scroll down to the contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    // 7C. Sleek Toast Notification System
    function showToast(message) {
        let toast = document.getElementById('arkana-toast');
        
        // Create the toast element if it doesn't exist
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'arkana-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: var(--card-dark, #1F2937);
                color: #fff;
                padding: 14px 28px;
                border-radius: 8px;
                font-size: 0.95rem;
                font-weight: 500;
                z-index: 9999;
                opacity: 0;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                border: 1px solid var(--accent, #F59E0B);
                text-align: center;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        
        // Animate Toast In
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });

        // Hide Toast after 4 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            toast.style.opacity = '0';
        }, 4000);
    }
    // 7D. Engineered Form Validation Middleware
    const contactForm = document.getElementById('arkana-contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const urlInput = document.getElementById('url');
            
            // Regex for strict email and URL validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // Matches http://, https://, or just domain.com formats
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

            // 1. Validate Message Length (Ignore whitespace)
            if (messageInput.value.trim().length < 20) {
                e.preventDefault(); // Stop submission
                showToast("Transmission denied: Details must be at least 20 characters.");
                messageInput.focus();
                return;
            }

            // 2. Validate Email Format
            if (!emailRegex.test(emailInput.value.trim())) {
                e.preventDefault();
                showToast("Transmission denied: Invalid return protocol (email format).");
                emailInput.focus();
                return;
            }

            // 3. Validate Company Website (Only if the field is visible/required)
            if (urlInput.hasAttribute('required')) {
                if (!urlRegex.test(urlInput.value.trim())) {
                    e.preventDefault();
                    showToast("Transmission denied: Invalid company website URL.");
                    urlInput.focus();
                    return;
                }
            }

            // If all checks pass, allow native submission to Formspree
        });
    }
}
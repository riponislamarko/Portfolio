// Add RGB values for the accent color
const root = document.documentElement;
root.style.setProperty('--accent-rgb', '13, 110, 253'); // Bootstrap primary color RGB

// Infinite Brands Carousel
function initBrandsCarousel() {
    const track = document.querySelector('.brands-track');
    if (!track) return;

    const items = Array.from(track.children);
    const itemWidth = items[0].offsetWidth + 64; // 64px is the gap (4rem)
    const totalWidth = itemWidth * (items.length / 2); // Since we duplicated items
    let currentPosition = 0;
    let animationId;
    let speed = 1; // Pixels per frame
    let isPaused = false;

    // Set initial position
    track.style.transform = `translateX(0)`;

    function animate() {
        if (isPaused) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        currentPosition -= speed;
        
        // Reset position when we've scrolled one full loop
        if (currentPosition <= -totalWidth) {
            currentPosition = 0;
        }
        
        track.style.transform = `translateX(${currentPosition}px)`;
        animationId = requestAnimationFrame(animate);
    }

    // Pause on hover
    track.addEventListener('mouseenter', () => {
        isPaused = true;
        track.style.transition = 'transform 0.3s ease';
    });

    track.addEventListener('mouseleave', () => {
        isPaused = false;
        track.style.transition = 'transform 0.1s linear';
        if (!animationId) {
            animationId = requestAnimationFrame(animate);
        }
    });

    // Start animation
    animationId = requestAnimationFrame(animate);

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newItemWidth = items[0].offsetWidth + 64;
            const newTotalWidth = newItemWidth * (items.length / 2);
            
            // Adjust current position proportionally
            const progress = currentPosition / totalWidth;
            currentPosition = progress * newTotalWidth;
            
            track.style.transform = `translateX(${currentPosition}px)`;
            
            // Update dimensions
            itemWidth = newItemWidth;
            totalWidth = newTotalWidth;
        }, 100);
    });
}

// Initialize Testimonial Carousel
function initTestimonialCarousel() {
    const container = document.querySelector('.testimonials-container');
    const track = document.querySelector('.testimonials-track');
    const items = document.querySelectorAll('.testimonial-item');
    const dotsContainer = document.querySelector('.testimonial-dots');
    const prevBtn = document.querySelector('.testimonial-nav.prev');
    const nextBtn = document.querySelector('.testimonial-nav.next');
    
    if (!container || !items.length || !prevBtn || !nextBtn) {
        console.log('Missing elements:', { container, items: items.length, prevBtn, nextBtn });
        return;
    }
    
    // Clear existing dots
    dotsContainer.innerHTML = '';
    
    let currentIndex = 0;
    let isAnimating = false;
    
    // Calculate how many items to show based on screen size
    function getItemsPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    }
    
    // Get unique testimonial count (half of total since we have duplicates)
    const uniqueTestimonialCount = items.length / 2;
    const itemsPerView = getItemsPerView();
    
    // For 3 items, we only need 1 slide (show all at once)
    // For 2 items, we need 2 slides (show 2, then slide to show the 3rd + 1st)
    // For 1 item, we need 3 slides (one for each testimonial)
    const totalSlides = uniqueTestimonialCount;
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.classList.add('testimonial-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }
    
    // Get dots after they're created
    const dots = document.querySelectorAll('.testimonial-dot');
    
    // Update active dot and navigation state
    function updateUI() {
        const dots = document.querySelectorAll('.testimonial-dot');
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
            dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
        });
        
        // Navigation buttons are always enabled for infinite scroll
        prevBtn.disabled = isAnimating;
        nextBtn.disabled = isAnimating;
        
        // Add visual feedback for disabled state
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }
    
    // Scroll to specific index
    function scrollToIndex(index, instant = false) {
        if (isAnimating && !instant) return;
        
        isAnimating = true;
        
        // Handle infinite loop - if we go beyond, wrap to beginning
        if (index >= uniqueTestimonialCount) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = uniqueTestimonialCount - 1;
        } else {
            currentIndex = index;
        }
        
        // Calculate scroll position
        // Each testimonial takes up (100% / itemsPerView) of the container width
        const containerWidth = container.offsetWidth;
        const slideWidth = containerWidth / itemsPerView;
        const scrollPosition = currentIndex * slideWidth;
        
        // Use CSS transform for smoother animation
        track.style.transition = instant ? 'none' : 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${scrollPosition}px)`;
        
        // Handle animation end
        if (!instant) {
            const onTransitionEnd = () => {
                isAnimating = false;
                track.removeEventListener('transitionend', onTransitionEnd);
            };
            track.addEventListener('transitionend', onTransitionEnd, { once: true });
            
            // Fallback timeout in case transitionend doesn't fire
            setTimeout(() => {
                isAnimating = false;
            }, 600);
        } else {
            isAnimating = false;
        }
        
        updateUI();
    }
    
    // Navigation handlers
    function goToNext() {
        scrollToIndex(currentIndex + 1);
    }
    
    function goToPrev() {
        scrollToIndex(currentIndex - 1);
    }
    
    // Event listeners for arrow buttons
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToNext();
        });
        
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToPrev();
        });
    }
    
    // Dot navigation
    function setupDotNavigation() {
        const dots = document.querySelectorAll('.testimonial-dot');
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(dot.dataset.index);
                if (index !== currentIndex) {
                    scrollToIndex(index);
                }
            });
        });
    }
    
    // Handle keyboard navigation
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNext();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrev();
        } else if (e.key === 'Home') {
            e.preventDefault();
            scrollToIndex(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            scrollToIndex(uniqueTestimonialCount - 1);
        }
    });
    
    // Auto-scroll with proper looping
    let autoScroll = setInterval(() => {
        goToNext();
    }, 5000);
    
    // Pause auto-scroll on hover
    const pauseAutoScroll = () => {
        clearInterval(autoScroll);
    };
    
    const resumeAutoScroll = () => {
        clearInterval(autoScroll);
        autoScroll = setInterval(goToNext, 5000);
    };
    
    container.addEventListener('mouseenter', pauseAutoScroll);
    container.addEventListener('focusin', pauseAutoScroll);
    container.addEventListener('mouseleave', resumeAutoScroll);
    container.addEventListener('focusout', (e) => {
        if (!container.contains(e.relatedTarget)) {
            resumeAutoScroll();
        }
    });
    
    // Handle window resize
    let resizeTimer;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Recalculate items per view
            const newItemsPerView = getItemsPerView();
            if (newItemsPerView !== itemsPerView) {
                // Reinitialize if items per view changed
                initTestimonialCarousel();
                return;
            }
            
            // Just update position for same layout
            scrollToIndex(currentIndex, true);
        }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize
    setupDotNavigation();
    scrollToIndex(0, true);
    updateUI();
}

/**
 * Initialize hover effects for work items
 */
function initWorkItemHover() {
    // No hover effects needed - function kept for future use if needed
    return;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize work item hover effects
    initWorkItemHover();
    
    // Initialize carousels
    const initCarousels = () => {
        initBrandsCarousel();
        initTestimonialCarousel();
    };
    
    // Initialize immediately
    initCarousels();
    
    // Re-initialize after a short delay to ensure proper rendering
    setTimeout(initCarousels, 500);

    // Mouse effect for service items
    const serviceItems = document.querySelectorAll('.service-item');
    
    serviceItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            item.style.setProperty('--mouse-x', `${x}px`);
            item.style.setProperty('--mouse-y', `${y}px`);
        });
        
        // Reset position when mouse leaves
        item.addEventListener('mouseleave', () => {
            item.style.removeProperty('--mouse-x');
            item.style.removeProperty('--mouse-y');
        });
    });
    
    // Force dark theme (site is full dark only)
    document.documentElement.setAttribute('data-theme', 'dark');


    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active'); // For styling the burger icon
        });

        // Close mobile menu when a link is clicked
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = document.querySelector('.navbar').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Enhanced navigation highlighting with smooth transitions
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    const highlightNav = () => {
        let currentSectionId = null;
        const headerOffset = document.querySelector('.navbar').offsetHeight;
        const scrollPosition = window.pageYOffset + headerOffset + 100; // Better offset

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // If no section is in range (e.g., between sections/dividers), clear all actives
        if (!currentSectionId) {
            navLinks.forEach(link => link.classList.remove('active'));
            return;
        }

        const targetHref = `#${currentSectionId}`;
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === targetHref) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Throttled scroll event for better performance
    let ticking = false;
    const updateNav = () => {
        highlightNav();
        updateHeaderBackground();
        ticking = false;
    };

    const requestTick = () => {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    };

    // Sticky header background
    function updateHeaderBackground() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });
    highlightNav(); // Initial call
    updateHeaderBackground(); // Initial call
    
    // Test if header function is working
    setTimeout(() => {
        updateHeaderBackground();
    }, 1000);

    // Contact Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            console.log('Form Data:', formObject);

            // Display a success message
            const formContainer = this.parentNode;
            let successMessage = formContainer.querySelector('.success-message');
            if (!successMessage) {
                successMessage = document.createElement('p');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Thank you! Your message has been sent.';
                formContainer.insertBefore(successMessage, this.nextSibling);
            }
            
            this.reset();

            setTimeout(() => {
                if(successMessage) {
                    successMessage.remove();
                }
            }, 5000);
        });
    }

    // Simple fade-in animation on scroll
    const animatedElements = document.querySelectorAll('.service-item, .work-item, .about-content, .contact-content');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        el.classList.add('fade-in-initial');
        observer.observe(el);
    });



});

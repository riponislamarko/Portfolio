// Add RGB values for the accent color
const root = document.documentElement;
root.style.setProperty('--accent-rgb', '13, 110, 253');

// Cache DOM elements
const navbar = document.querySelector('.navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-menu .nav-link');
const sections = document.querySelectorAll('section[id]');
const contactForm = document.getElementById('contactForm');

// Optimized Brands Carousel with reduced performance impact
function initBrandsCarousel() {
    const track = document.querySelector('.brands-track');
    if (!track) return;

    const items = Array.from(track.children);
    if (items.length === 0) return;

    const itemWidth = items[0].offsetWidth + 64; // 64px is the gap (4rem)
    const totalWidth = itemWidth * (items.length / 2); // Since we duplicated items
    let currentPosition = 0;
    let animationId;
    let speed = 0.5; // Reduced speed for better performance
    let isPaused = false;
    let isVisible = true;

    // Check if element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    function animate() {
        if (isPaused || !isVisible) {
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
    });

    track.addEventListener('mouseleave', () => {
        isPaused = false;
    });

    // Pause when not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { threshold: 0.1 });

    observer.observe(track);

    // Start animation
    animationId = requestAnimationFrame(animate);

    // Handle window resize with debouncing
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
        }, 100);
    });
}

// Optimized Testimonial Carousel
function initTestimonialCarousel() {
    const container = document.querySelector('.testimonials-container');
    const track = document.querySelector('.testimonials-track');
    const items = document.querySelectorAll('.testimonial-item');
    const dotsContainer = document.querySelector('.testimonial-dots');
    const prevBtn = document.querySelector('.testimonial-nav.prev');
    const nextBtn = document.querySelector('.testimonial-nav.next');
    
    if (!container || !items.length || !prevBtn || !nextBtn) {
        return;
    }
    
    // Clear existing dots
    dotsContainer.innerHTML = '';
    
    let currentIndex = 0;
    let isAnimating = false;
    let autoScrollInterval;
    
    // Calculate how many items to show based on screen size
    function getItemsPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    }
    
    const uniqueTestimonialCount = items.length / 2;
    const itemsPerView = getItemsPerView();
    
    // Create dots
    for (let i = 0; i < uniqueTestimonialCount; i++) {
        const dot = document.createElement('button');
        dot.classList.add('testimonial-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }
    
    const dots = document.querySelectorAll('.testimonial-dot');
    
    // Update active dot and navigation state
    function updateUI() {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
            dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
        });
        
        prevBtn.disabled = isAnimating;
        nextBtn.disabled = isAnimating;
        
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }
    
    // Scroll to specific index
    function scrollToIndex(index, instant = false) {
        if (isAnimating && !instant) return;
        
        isAnimating = true;
        
        // Handle infinite loop
        if (index >= uniqueTestimonialCount) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = uniqueTestimonialCount - 1;
        } else {
            currentIndex = index;
        }
        
        const containerWidth = container.offsetWidth;
        const slideWidth = containerWidth / itemsPerView;
        const scrollPosition = currentIndex * slideWidth;
        
        track.style.transition = instant ? 'none' : 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${scrollPosition}px)`;
        
        if (!instant) {
            const onTransitionEnd = () => {
                isAnimating = false;
                track.removeEventListener('transitionend', onTransitionEnd);
            };
            track.addEventListener('transitionend', onTransitionEnd, { once: true });
            
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
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToNext();
    });
    
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToPrev();
    });
    
    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(dot.dataset.index);
            if (index !== currentIndex) {
                scrollToIndex(index);
            }
        });
    });
    
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
    
    // Auto-scroll with visibility check
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            goToNext();
        }, 5000);
    }
    
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }
    
    // Pause auto-scroll on hover/focus
    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('focusin', stopAutoScroll);
    container.addEventListener('mouseleave', startAutoScroll);
    container.addEventListener('focusout', (e) => {
        if (!container.contains(e.relatedTarget)) {
            startAutoScroll();
        }
    });
    
    // Handle window resize with debouncing
    let resizeTimer;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newItemsPerView = getItemsPerView();
            if (newItemsPerView !== itemsPerView) {
                initTestimonialCarousel();
                return;
            }
            scrollToIndex(currentIndex, true);
        }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize
    scrollToIndex(0, true);
    updateUI();
    startAutoScroll();
}

// Optimized scroll handling with throttling
let ticking = false;
let lastScrollY = window.pageYOffset;

function updateOnScroll() {
    highlightNav();
    updateHeaderBackground();
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
}

// Enhanced navigation highlighting
function highlightNav() {
    if (!navLinks.length || !sections.length) return;

    let currentSectionId = null;
    const headerOffset = navbar ? navbar.offsetHeight : 0;
    const scrollPosition = window.pageYOffset + headerOffset + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSectionId = section.getAttribute('id');
        }
    });

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
}

// Sticky header background
function updateHeaderBackground() {
    if (!navbar) return;
    
    if (window.scrollY > 50) {
        navbar.classList.add('sticky');
    } else {
        navbar.classList.remove('sticky');
    }
}

// Optimized smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement && navbar) {
                const headerOffset = navbar.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile navigation toggle
function initMobileNav() {
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });
}

// Contact form handling
function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        console.log('Form Data:', formObject);

        // Display success message
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

// Optimized intersection observer for animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-item, .work-item, .about-content, .contact-content');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        el.classList.add('fade-in-initial');
        observer.observe(el);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Force dark theme
    document.documentElement.setAttribute('data-theme', 'dark');

    // Initialize all components
    initBrandsCarousel();
    initTestimonialCarousel();
    initSmoothScrolling();
    initMobileNav();
    initContactForm();
    initScrollAnimations();

    // Initialize scroll handling
    highlightNav();
    updateHeaderBackground();

    // Add scroll event listener with throttling
    window.addEventListener('scroll', requestTick, { passive: true });

    // Re-initialize carousels after a short delay to ensure proper rendering
    setTimeout(() => {
        initBrandsCarousel();
        initTestimonialCarousel();
    }, 500);
});

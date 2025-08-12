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
    
    if (!container || !items.length) return;
    
    // Clear existing dots
    dotsContainer.innerHTML = '';
    
    let currentIndex = 0;
    let isAnimating = false;
    let itemWidth = items[0].offsetWidth + 32; // Width + gap
    
    // Create dots (only for unique testimonials, not duplicates)
    const uniqueTestimonialCount = items.length / 2; // Since we have duplicates
    for (let i = 0; i < uniqueTestimonialCount; i++) {
        const dot = document.createElement('button');
        dot.classList.add('testimonial-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }
    
    const dots = document.querySelectorAll('.testimonial-dot');
    
    // Update active dot and navigation state
    function updateUI() {
        // Calculate visible index (accounting for duplicates)
        const visibleIndex = currentIndex % uniqueTestimonialCount;
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === visibleIndex);
            dot.setAttribute('aria-current', i === visibleIndex ? 'true' : 'false');
        });
        
        // Update navigation buttons state
        prevBtn.disabled = isAnimating;
        nextBtn.disabled = isAnimating;
    }
    
    // Scroll to specific index
    function scrollToIndex(index, instant = false) {
        if (isAnimating) return;
        
        isAnimating = true;
        currentIndex = index;
        
        // Calculate scroll position
        const scrollPosition = currentIndex * itemWidth;
        
        track.style.scrollBehavior = instant ? 'auto' : 'smooth';
        track.scrollLeft = scrollPosition;
        
        // If we've scrolled to the duplicate set, instantly jump to the original
        if (!instant) {
            const onScroll = () => {
                if (currentIndex >= uniqueTestimonialCount) {
                    currentIndex = currentIndex % uniqueTestimonialCount;
                    track.removeEventListener('scroll', onScroll);
                    scrollToIndex(currentIndex, true);
                }
                isAnimating = false;
            };
            
            track.addEventListener('scroll', onScroll, { once: true });
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
        if (currentIndex <= 0) {
            scrollToIndex(uniqueTestimonialCount - 1);
        } else {
            scrollToIndex(currentIndex - 1);
        }
    }
    
    // Event listeners
    nextBtn.addEventListener('click', goToNext);
    prevBtn.addEventListener('click', goToPrev);
    
    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(dot.dataset.index);
            if (index !== currentIndex % uniqueTestimonialCount) {
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
    
    // Auto-scroll
    let autoScroll = setInterval(goToNext, 5000);
    
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
            itemWidth = items[0].offsetWidth + 32;
            scrollToIndex(currentIndex % uniqueTestimonialCount, true);
        }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize
    updateUI();
    
    // Make dots focusable for keyboard navigation
    dots.forEach(dot => {
        dot.setAttribute('tabindex', '0');
    });
}

/**
 * Initialize hover effects for work items
 */
function initWorkItemHover() {
    const workItems = document.querySelectorAll('.work-item');
    
    // Function to handle hover effect for a single item
    const setupHoverEffect = (item) => {
        const imageContainer = item.querySelector('.work-image-container, .work-image').parentElement;
        const image = item.querySelector('.work-image');
        
        if (!imageContainer || !image) return;
        
        // Make sure the image is loaded before calculating dimensions
        const img = new Image();
        img.src = image.src;
        
        img.onload = () => {
            // Calculate the scrollable height
            const scrollableHeight = img.height - imageContainer.offsetHeight;
            
            // Only add hover effect if the image is taller than its container
            if (scrollableHeight > 0) {
                // Set initial styles
                image.style.willChange = 'transform';
                image.style.transform = 'translateY(0)';
                
                // Mouse enter handler
                item.addEventListener('mouseenter', () => {
                    // Reset transform first to handle quick re-hovers
                    image.style.transition = 'none';
                    image.style.transform = 'translateY(0)';
                    
                    // Force reflow
                    void image.offsetWidth;
                    
                    // Start the scroll animation
                    image.style.transition = 'transform 8s ease-in-out';
                    image.style.transform = `translateY(calc(-${scrollableHeight}px))`;
                });
                
                // Mouse leave handler
                item.addEventListener('mouseleave', () => {
                    // Smoothly return to top
                    image.style.transition = 'transform 0.5s ease-out';
                    image.style.transform = 'translateY(0)';
                });
                
                // Reset transform after animation completes
                image.addEventListener('transitionend', (e) => {
                    if (e.propertyName === 'transform' && !item.matches(':hover')) {
                        image.style.transition = 'none';
                        image.style.transform = 'translateY(0)';
                    }
                });
            }
        };
    };
    
    // Set up hover effect for each work item
    workItems.forEach(setupHoverEffect);
    
    // Re-initialize when images are loaded (in case they load after the script runs)
    window.addEventListener('load', () => {
        workItems.forEach(setupHoverEffect);
    });
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
    
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on user preference or system setting
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Set initial button state
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', `Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`);
        
        // Toggle theme when button is clicked
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update button state
            themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'light' ? 'dark' : 'light'} mode`);
        });
    }
    
    // Listen for system theme changes (only if no theme is set in localStorage)
    const handleSystemThemeChange = (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            if (themeToggle) {
                themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'light' ? 'dark' : 'light'} mode`);
            }
        }
    };
    
    // Add event listener for system theme changes
    if (prefersDarkScheme.addEventListener) {
        prefersDarkScheme.addEventListener('change', handleSystemThemeChange);
    } else {
        // For older browsers
        prefersDarkScheme.addListener(handleSystemThemeChange);
    }


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
        }, {
            threshold: 0.5 // Trigger when 50% of the element is visible
        });

        skillBars.forEach(bar => {
            observer.observe(bar);
        });
    }

    animateSkillBars();

    // Re-run animations when navigating back to the page
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            animateSkillBars();
        }
    });

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

    // Add active class to current section in navigation on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    const highlightNav = () => {
        let current = '';
        const headerOffset = document.querySelector('.navbar').offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerOffset - 50;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', highlightNav);
    highlightNav(); // Initial call

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

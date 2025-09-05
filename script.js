// Portfolio Website JavaScript
// Modern ES6+ JavaScript with smooth animations and interactions

class PortfolioApp {
    constructor() {
        // Constants
        this.MOBILE_BREAKPOINT = 768;
        this.THROTTLE_DELAY = 16; // 60fps
        this.isMobile = false;
        
        try {
            this.init();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.setupSmoothScrolling();
            this.setupThemeToggle();
            this.setupMobileMenu();
            this.setupContactForm();
            this.setupCounterAnimation();
            this.setupParallaxEffects();
            this.setupProjectFilters();
        } catch (error) {
            console.error('Portfolio initialization failed:', error);
        }
    }

    init() {
        // Initialize the app
        this.setInitialTheme();
        this.setupNavbarScroll();
        this.preloadImages();
    }

    // Theme Management
    setInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
            
            // Add transition class instead of inline styles
            document.body.classList.add('theme-transitioning');
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, 300);
        });
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Navigation
    setupNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let lastScrollY = window.scrollY;
        
        const handleScroll = this.throttle(() => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class for styling
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, this.THROTTLE_DELAY);
        
        window.addEventListener('scroll', handleScroll);
    }

    setupMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (!hamburger || !navMenu) return;

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside (only when menu is active)
        const handleOutsideClick = (e) => {
            if (navMenu.classList.contains('active') && 
                !hamburger.contains(e.target) && 
                !navMenu.contains(e.target)) {
                this.closeMobileMenu();
            }
        };
        
        document.addEventListener('click', handleOutsideClick);
    }

    // Smooth Scrolling
    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                
                try {
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    console.warn('Invalid selector:', targetId);
                }
            });
        });
    }

    // Active Navigation Link
    setupActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const handleActiveLink = this.throttle(() => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, this.THROTTLE_DELAY);
        
        window.addEventListener('scroll', handleActiveLink);
    }

    // Intersection Observer for Animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger specific animations
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }
                    
                    if (entry.target.classList.contains('skill-item')) {
                        this.animateSkillItem(entry.target);
                    }
                    
                    if (entry.target.classList.contains('timeline-item')) {
                        this.animateTimelineItem(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(`
            .fade-in,
            .slide-in-left,
            .slide-in-right,
            .stat-number,
            .skill-item,
            .timeline-item,
            .project-card
        `);
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Counter Animation
    setupCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            counter.classList.add('fade-in');
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        let current = 0;
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            current = Math.floor(progress * target);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Skill Item Animation
    animateSkillItem(element) {
        element.style.animationDelay = `${Math.random() * 0.5}s`;
        element.classList.add('animate-pulse');
    }

    // Timeline Animation
    animateTimelineItem(element) {
        const delay = Array.from(element.parentNode.children).indexOf(element) * 0.2;
        element.style.animationDelay = `${delay}s`;
    }

    // Parallax Effects
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.gradient-orb');
        
        const handleParallax = this.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${rate * speed}px)`;
            });
        }, this.THROTTLE_DELAY);
        
        window.addEventListener('scroll', handleParallax);
    }

    // Contact Form
    setupContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
            
            try {
                // Simulate form submission (replace with actual endpoint)
                await this.simulateFormSubmission(form);
                
                // Show success message
                this.showNotification('Message sent successfully!', 'success');
                form.reset();
                
            } catch (error) {
                // Show error message
                this.showNotification('Failed to send message. Please try again.', 'error');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Form validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.classList.remove('error');
        this.removeFieldError(field);

        // Check for empty values first
        if (!value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else {
            // Field-specific validation rules
            const validationRules = {
                name: {
                    minLength: 2,
                    message: 'Name must be at least 2 characters long'
                },
                email: {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                },
                subject: {
                    minLength: 5,
                    message: 'Subject must be at least 5 characters long'
                },
                message: {
                    minLength: 10,
                    message: 'Message must be at least 10 characters long'
                }
            };
            
            const rule = validationRules[fieldName];
            if (rule) {
                if (rule.minLength && value.length < rule.minLength) {
                    isValid = false;
                    errorMessage = rule.message;
                } else if (rule.pattern && !rule.pattern.test(value)) {
                    isValid = false;
                    errorMessage = rule.message;
                }
            }
        }

        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        // Remove existing error first
        this.removeFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        // Sanitize message to prevent XSS
        errorDiv.textContent = this.sanitizeText(message);
        field.parentNode.appendChild(errorDiv);
    }

    removeFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async simulateFormSubmission(form) {
        // Validate all fields before submission
        const inputs = form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            throw new Error('Please fix validation errors before submitting');
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real application, you would send the form data to your server
        const formData = new FormData(form);
        const sanitizedData = {};
        
        // Sanitize form data before logging
        for (const [key, value] of formData.entries()) {
            sanitizedData[key] = this.sanitizeText(value.toString());
        }
        
        console.log('Form data:', sanitizedData);
        
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) { // 90% success rate
            return Promise.resolve();
        } else {
            return Promise.reject(new Error('Simulated network error'));
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${this.sanitizeText(type)}`;
        notification.textContent = this.sanitizeText(message);
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                try {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                } catch (error) {
                    console.warn('Error removing notification:', error);
                }
            }, 300);
        }, 5000);
    }

    // Event Listeners
    setupEventListeners() {
        // Window events
        window.addEventListener('load', () => {
            this.hideLoader();
        });
        
        // Setup active nav link tracking
        this.setupActiveNavLink();
        
        // Setup scroll indicator
        this.setupScrollIndicator();
        
        // Force refresh if needed
        this.checkForUpdates();
        
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
        
        // Project card interactions
        this.setupProjectInteractions();
        
        // Skill item interactions
        this.setupSkillInteractions();
    }

    setupProjectInteractions() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            this.setupHoverInteractions(card, {
                enter: 'translateY(-10px) scale(1.02)',
                leave: 'translateY(0) scale(1)'
            });
            
            // Add click handler for project details
            card.addEventListener('click', () => {
                this.showProjectModal(card);
            });
        });
    }

    setupSkillInteractions() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            this.setupHoverInteractions(item, {
                enter: 'translateY(-5px) scale(1.05)',
                leave: 'translateY(0) scale(1)'
            });
        });
    }
    
    setupHoverInteractions(element, transforms) {
        element.addEventListener('mouseenter', () => {
            element.style.transform = transforms.enter;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = transforms.leave;
        });
    }

    showProjectModal(projectCard) {
        // Create modal for project details
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        
        // Safely get and sanitize content
        const title = this.sanitizeText(projectCard.querySelector('.project-title')?.textContent || 'Project');
        const description = this.sanitizeText(projectCard.querySelector('.project-description')?.textContent || 'No description available');
        const techElement = projectCard.querySelector('.project-tech');
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="modal-tech">
                        ${techElement ? techElement.innerHTML : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Style the modal
        const style = document.createElement('style');
        style.textContent = `
            .project-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }
            .modal-overlay {
                background: rgba(0, 0, 0, 0.8);
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
            .modal-content {
                background: var(--bg-primary);
                padding: 2rem;
                border-radius: 1rem;
                max-width: 500px;
                width: 100%;
                position: relative;
                z-index: 1;
            }
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-primary);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Close modal handlers
        const closeModal = () => {
            try {
                if (modal.parentNode) modal.remove();
                if (style.parentNode) style.remove();
            } catch (error) {
                console.warn('Error closing modal:', error);
            }
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    }

    closeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
        
        if (this.isMobile) {
            this.closeMobileMenu();
        }
        
        // Only adjust animations if mobile state changed
        if (wasMobile !== this.isMobile) {
            this.adjustAnimationsForMobile();
        }
    }

    adjustAnimationsForMobile() {
        // Use CSS classes instead of direct style manipulation
        const body = document.body;
        
        if (this.isMobile) {
            body.classList.add('mobile-animations');
        } else {
            body.classList.remove('mobile-animations');
        }
    }

    hideLoader() {
        // Remove any loading screen if present
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }
    }

    preloadImages() {
        // Preload critical images for better performance
        const imageUrls = [
            // Add any critical image URLs here
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Setup scroll indicator
    setupScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                document.querySelector('#about').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    }
    
    // Setup project filters
    setupProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter projects
                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }
    
    // Check for updates and force refresh if needed
    checkForUpdates() {
        const version = '1.1';
        const storedVersion = localStorage.getItem('portfolio-version');
        
        if (storedVersion !== version) {
            localStorage.setItem('portfolio-version', version);
            if (storedVersion) {
                location.reload(true);
            }
        }
    }
    
    // Utility method to sanitize text content
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});



// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

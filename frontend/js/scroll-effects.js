// Additional scroll effects and animations
class ScrollEffects {
    constructor() {
        this.lastScrollY = 0;
        this.ticking = false;
        this.init();
    }

    init() {
        this.initScrollProgress();
        this.initParallaxElements();
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll() {
        this.lastScrollY = window.scrollY;

        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateScrollEffects();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    initScrollProgress() {
        // Create scroll progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--gradient);
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }

    updateScrollEffects() {
        // Update scroll progress
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset;
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        }

        // Update parallax elements
        this.updateParallax();
    }

    initParallaxElements() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]');
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        
        this.parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }
}

// Lazy loading for images
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            });

            this.images.forEach(img => this.observer.observe(img));
        } else {
            // Fallback for older browsers
            this.loadImagesImmediately();
        }
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        img.src = src;
        img.classList.add('loaded');
    }

    loadImagesImmediately() {
        this.images.forEach(img => this.loadImage(img));
    }
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', function() {
    new ScrollEffects();
    new LazyLoader();
});
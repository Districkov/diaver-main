// ===== ENHANCED MAIN.JS =====
class DiaverApp {
    constructor() {
        this.components = new Map();
        this.init();
    }

    async init() {
        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    }

    initializeApp() {
        this.loadTemplates();
        this.initComponents();
        this.bindEvents();
        this.initAnimations();
        this.fixHeaderOverlap();
        this.initScrollEffect();
    }

    loadTemplates() {
        this.components.set('header', this.getFallbackHeader());
        this.components.set('footer', this.getFallbackFooter());
    }

    getFallbackHeader() {
        const isIndexPage = this.isIndexPage();
        const basePath = isIndexPage ? 'pages/' : '';
        
        return `
            <nav class="navbar">
                <div class="container">
                    <div class="nav-brand">
                        <a href="${isIndexPage ? 'index.html' : '../index.html'}" class="logo">
                            <img src="${isIndexPage ? 'assets/images/logo.png' : '../assets/images/logo.png'}" 
                                 alt="ДИАВЕР" 
                                 class="logo-image">
                        </a>
                    </div>
                    <div class="nav-menu">
                        <a href="${isIndexPage ? 'index.html' : '../index.html'}" class="nav-link">Главная</a>
                        <a href="${basePath}solutions.html" class="nav-link">Решения</a>
                        <a href="${basePath}products.html" class="nav-link">Продукты</a>
                        <a href="${basePath}company.html" class="nav-link">Компания</a>
                        <a href="${basePath}contacts.html" class="nav-link">Контакты</a>
                    </div>
                    <div class="nav-actions">
                        <a href="tel:+78001234567" class="nav-phone">8 800 123-45-67</a>
                        <button class="nav-toggle" aria-label="Меню">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }

    getFallbackFooter() {
        const isIndexPage = this.isIndexPage();
        const basePath = isIndexPage ? 'pages/' : '';

        return `
             <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <div class="footer-logo">ДИАВЕР</div>
                        <p>Разработка автоматизированных информационно-аналитических систем</p>
                    </div>
                    <div class="footer-section">
                        <h4>Решения</h4>
                        <a href="${basePath}solutions.html">Бизнес-аналитика</a>
                        <a href="${basePath}solutions.html">Искусственный интеллект</a>
                        <a href="${basePath}solutions.html">Автоматизация</a>
                    </div>
                    <div class="footer-section">
                        <h4>Компания</h4>
                        <a href="${basePath}company.html">О нас</a>
                        <a href="${basePath}company.html">Команда</a>
                        <a href="${basePath}company.html">Вакансии</a>
                    </div>
                    <div class="footer-section">
                        <h4>Контакты</h4>
                        <p> 8 800 123-45-67</p>
                        <p> info@diaver.ru</p>
                        <a href="${basePath}contacts.html" class="btn btn-outline">Написать нам</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 ООО "ДИАВЕР". Все права защищены.</p>
                </div>
            </div>
        `;
    }

    isIndexPage() {
        const path = window.location.pathname;
        return path.endsWith('index.html') || 
               path.endsWith('/') ||
               (path.includes('github.io') && !path.includes('/pages/'));
    }

    initComponents() {
        const header = document.getElementById('header');
        const footer = document.getElementById('footer');
        
        if (header) {
            header.innerHTML = this.components.get('header');
            console.log('✅ Header loaded');
        }
        
        if (footer) {
            footer.innerHTML = this.components.get('footer');
            console.log('✅ Footer loaded');
        }

        // Даем время на отрисовку DOM
        setTimeout(() => {
            this.initMobileMenu();
            this.setActivePage();
        }, 100);
    }

    setActivePage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        console.log('Current page:', currentPage);
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkHref = link.getAttribute('href');
            const linkPage = linkHref.split('/').pop();
            
            console.log('Checking link:', linkHref, 'Page:', linkPage);
            
            // Убираем все активные классы сначала
            link.classList.remove('active');
            
            // Проверяем совпадение страниц
            const isActive = 
                currentPage === linkPage || 
                (currentPage === '' && linkPage === 'index.html') ||
                (currentPage.includes('github.io') && linkPage === 'index.html' && currentPath.endsWith('/')) ||
                (currentPage === 'diaver' && linkPage === 'index.html');
            
            if (isActive) {
                link.classList.add('active');
                console.log('✅ Active page:', linkPage);
            }
        });
    }

    initMobileMenu() {
        const toggle = document.querySelector('.nav-toggle');
        const menu = document.querySelector('.nav-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
                document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
            });

            // Close menu on link click
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            // Close menu on click outside
            document.addEventListener('click', (e) => {
                if (menu.classList.contains('active') && 
                    !menu.contains(e.target) && 
                    !toggle.contains(e.target)) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    initScrollEffect() {
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (header) {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });
    }

    bindEvents() {
        this.initSmoothScroll();
        this.initLazyLoading();
        this.initIntersectionObserver();
    }

    fixHeaderOverlap() {
        const main = document.querySelector('main');
        if (main) {
            if (this.isIndexPage()) {
                main.style.paddingTop = '0';
            } else {
                main.style.paddingTop = '90px';
            }
            main.style.minHeight = 'calc(100vh - 90px)';
        }

        document.querySelectorAll('section').forEach(section => {
            section.style.scrollMarginTop = '90px';
        });
    }

    initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 90;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });
    }

    initAnimations() {
        if (!document.querySelector('#app-styles')) {
            const style = document.createElement('style');
            style.id = 'app-styles';
            style.textContent = `
                /* AOS Animations */
                [data-aos] {
                    opacity: 0;
                    transition: all 0.6s ease;
                }
                
                [data-aos="fade-up"] {
                    transform: translateY(30px);
                }
                
                [data-aos="fade-down"] {
                    transform: translateY(-30px);
                }
                
                [data-aos="fade-right"] {
                    transform: translateX(-30px);
                }
                
                [data-aos="fade-left"] {
                    transform: translateX(30px);
                }
                
                [data-aos="zoom-in"] {
                    transform: scale(0.9);
                }
                
                [data-aos="flip-left"] {
                    transform: perspective(2500px) rotateY(-100deg);
                }
                
                .aos-animate {
                    opacity: 1;
                    transform: none;
                }

                /* Header overlap fixes */
                main {
                    min-height: calc(100vh - 90px);
                }
                
                .index-page main {
                    padding-top: 0;
                }
                
                .inner-page main {
                    padding-top: 90px;
                }
                
                section {
                    scroll-margin-top: 90px;
                }

                /* Mobile fixes */
                @media (max-width: 968px) {
                    main {
                        min-height: calc(100vh - 80px);
                    }
                    
                    .inner-page main {
                        padding-top: 80px;
                    }
                    
                    section {
                        scroll-margin-top: 80px;
                    }
                }

                @media (max-width: 480px) {
                    main {
                        min-height: calc(100vh - 70px);
                    }
                    
                    .inner-page main {
                        padding-top: 70px;
                    }
                    
                    section {
                        scroll-margin-top: 70px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    window.diaverApp = new DiaverApp();
});

// Handle page transitions
window.addEventListener('pageshow', function() {
    if (window.diaverApp) {
        setTimeout(() => {
            window.diaverApp.setActivePage();
        }, 100);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiaverApp;
}
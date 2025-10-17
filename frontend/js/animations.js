// Система анимаций при скролле
class ScrollAnimations {
    constructor() {
        this.elements = [];
        this.observer = null;
        this.init();
    }

    init() {
        this.createObserver();
        this.findElements();
    }

    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateIn(entry.target);
                } else {
                    this.animateOut(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    }

    findElements() {
        // Находим все элементы с data-aos
        this.elements = document.querySelectorAll('[data-aos]');
        this.elements.forEach(el => this.observer.observe(el));
    }

    animateIn(element) {
        const animation = element.getAttribute('data-aos');
        const delay = element.getAttribute('data-aos-delay') || 0;
        
        setTimeout(() => {
            element.classList.add('aos-animate');
            
            // Специфичные анимации
            switch(animation) {
                case 'typewriter':
                    this.typewriterEffect(element);
                    break;
                case 'flip-left':
                case 'flip-right':
                case 'flip-up':
                case 'flip-down':
                    this.flipEffect(element, animation);
                    break;
            }
        }, parseInt(delay));
    }

    animateOut(element) {
        element.classList.remove('aos-animate');
    }

    typewriterEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.width = '0';
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.style.width = '100%';
            }
        }, 100);
    }

    flipEffect(element, direction) {
        // Добавляем перспективу для 3D эффекта
        element.style.perspective = '1000px';
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
});

// Дополнительные анимации
const AdvancedAnimations = {
    // Параллакс эффект
    initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    },

    // Эффект наведения для карточек
    initCardHover() {
        document.querySelectorAll('.enhanced-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    },

    // Анимация появления элементов списка
    initStaggerAnimation() {
        const staggerElements = document.querySelectorAll('.stagger-grid');
        
        staggerElements.forEach(grid => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(grid);
        });
    },

    // Анимация FAQ
    initFAQ() {
        document.querySelectorAll('.faq-question-enhanced').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const isActive = item.classList.contains('active');
                
                // Закрываем все открытые FAQ
                document.querySelectorAll('.faq-item-enhanced').forEach(faq => {
                    faq.classList.remove('active');
                });
                
                // Открываем текущий, если он был закрыт
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
};

// Инициализация всех анимаций
document.addEventListener('DOMContentLoaded', () => {
    AdvancedAnimations.initCardHover();
    AdvancedAnimations.initStaggerAnimation();
    AdvancedAnimations.initFAQ();
    AdvancedAnimations.initParallax();
});
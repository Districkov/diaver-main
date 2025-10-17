console.log('🎯 presentations.js ЗАГРУЖЕН!');

// FULLSCREEN PDF Presentation System
class PDFPresentation {
    constructor() {
        this.modal = document.getElementById('pdfModal');
        this.pdfViewer = document.getElementById('pdfViewer');
        this.pdfTitle = document.getElementById('pdfModalTitle');
        this.pdfDownload = document.getElementById('pdfDownload');
        this.modalClose = document.getElementById('pdfModalClose');
        this.pdfFiles = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPresentationsFromServer();
    }

    // Загружаем презентации с сервера
    async loadPresentationsFromServer() {
        try {
            const response = await fetch('/api/presentations');
            const presentations = await response.json();
            
            // Преобразуем массив в объект для совместимости
            this.pdfFiles = {};
            presentations.forEach(presentation => {
                this.pdfFiles[presentation.id] = {
                    file: presentation.file,
                    title: presentation.title,
                    download: presentation.downloadName,
                    description: presentation.description
                };
            });
            
            console.log('✅ Презентации загружены в систему:', Object.keys(this.pdfFiles));
        } catch (error) {
            console.error('❌ Ошибка загрузки презентаций:', error);
            // Fallback на статические данные
            this.createPDFMapping();
        }
    }

    // Статический маппинг (резервный)
    createPDFMapping() {
        this.pdfFiles = {
            'ias-upravlencheskiy-uchet': {
                file: '/assets/presentations/ias-upravlencheskiy-uchet.pdf',
                title: 'ИАС «Управленческий учет»',
                download: 'ИАС-Управленческий-учет-ДИАВЕР.pdf'
            },
            'ais-kadastr': {
                file: '/assets/presentations/ais-kadastr.pdf',
                title: 'АИС «Кадастр»',
                download: 'АИС-Кадастр-ДИАВЕР.pdf'
            },
            'sistema-kontur': {
                file: '/assets/presentations/sistema-kontur.pdf',
                title: 'Система «Контур»',
                download: 'Система-Контур-ДИАВЕР.pdf'
            },
            'upravlenie-investiciyami': {
                file: '/assets/presentations/upravlenie-investiciyami.pdf',
                title: 'Система управления инвестиционной деятельностью',
                download: 'Управление-инвестициями-ДИАВЕР.pdf'
            },
            'avtomatizaciya-konkursov': {
                file: '/assets/presentations/avtomatizaciya-konkursov.pdf',
                title: 'Автоматизация конкурсных процедур',
                download: 'Автоматизация-конкурсов-ДИАВЕР.pdf'
            },
            'sistema-subsidiy': {
                file: '/assets/presentations/sistema-subsidiy.pdf',
                title: 'Система поддержки субсидий',
                download: 'Система-субсидий-ДИАВЕР.pdf'
            }
        };
    }

    bindEvents() {
        // Закрытие модального окна
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });

        // Закрытие по клику вне модального окна
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
    }

    openPresentation(solutionId) {
        const presentation = this.pdfFiles[solutionId];
        
        if (!presentation) {
            console.error('❌ Презентация не найдена для:', solutionId);
            alert('Презентация временно недоступна. Свяжитесь с нами для получения материалов.');
            return;
        }

        console.log('📖 Открываем презентацию:', presentation);

        // Устанавливаем заголовок
        if (this.pdfTitle) {
            this.pdfTitle.textContent = presentation.title;
        }

        // Устанавливаем PDF
        if (this.pdfViewer) {
            this.pdfViewer.src = presentation.file;
        }

        // Настраиваем кнопку скачивания
        if (this.pdfDownload) {
            this.pdfDownload.href = presentation.file;
            this.pdfDownload.download = presentation.download;
        }

        // Показываем модальное окно
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Блокируем скролл
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = ''; // Разблокируем скролл
        }
        
        // Очищаем PDF viewer
        if (this.pdfViewer) {
            setTimeout(() => {
                this.pdfViewer.src = '';
            }, 300);
        }
    }

    // Метод для ручного открытия презентации
    showPresentation(solutionId) {
        this.openPresentation(solutionId);
    }
}

// Инициализация системы презентаций
let pdfPresentation;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Инициализация системы презентаций...');
    pdfPresentation = new PDFPresentation();
});

// Глобальная функция для вызова из HTML
function showPresentation(solutionId) {
    console.log('🎯 Вызов showPresentation для:', solutionId);
    if (pdfPresentation) {
        pdfPresentation.showPresentation(solutionId);
    } else {
        console.error('❌ Система презентаций не инициализирована');
    }
}
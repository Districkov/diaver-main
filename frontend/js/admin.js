// Конфигурация API
const API_BASE = '/api/admin';
const PROJECTS_API = '/api/projects';

// Глобальные переменные
let projects = [];
let leads = [];
let editingProject = null;

// Инициализация админ-панели (вызывается из auth.js после успешного входа)
window.initializeAdmin = function() {
    console.log('Initializing admin panel...');
    setupAdminEventListeners();
    loadInitialData();
    showSection('projects');
};

// Настройка обработчиков событий админ-панели
function setupAdminEventListeners() {
    console.log('Setting up admin event listeners...');
    
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            showSection(section);
        });
    });
    
    // Форма проекта
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }
    
    // Закрытие модального окна
    const projectModal = document.getElementById('projectModal');
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                closeProjectModal();
            }
        });
    }
    
    // Закрытие модального окна по кнопке
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }
}

// Загрузка начальных данных
function loadInitialData() {
    console.log('Loading initial data...');
    loadProjects();
}

// Переключение секций
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Обновить навигацию
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Показать секцию
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Загрузить данные если нужно
    if (sectionName === 'projects' && projects.length === 0) {
        loadProjects();
    } else if (sectionName === 'leads' && leads.length === 0) {
        loadLeads();
    } else if (sectionName === 'stats') {
        loadStats();
    }
}

// Получить заголовки с авторизацией
function getAuthHeaders() {
    if (window.auth && window.auth.getAuthHeaders) {
        return window.auth.getAuthHeaders();
    }
    throw new Error('Auth module not available');
}

// Загрузка проектов
async function loadProjects() {
    try {
        showLoader('projectsContainer');
        
        const response = await fetch(PROJECTS_API);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        projects = await response.json();
        renderProjects();
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        showMessage('Ошибка загрузки проектов', 'error');
        // Для демо используем моковые данные
        projects = await getMockProjects();
        renderProjects();
    }
}

// Отображение проектов
function renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Проектов пока нет</h3>
                <p>Добавьте первый проект</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-actions">
                <button class="btn btn-sm btn-outline" onclick="editProject(${project.id})" title="Редактировать">
                    ✏️
                </button>
                <button class="btn btn-sm btn-outline" onclick="deleteProject(${project.id})" title="Удалить">
                    🗑️
                </button>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description?.substring(0, 100) || '')}...</p>
            <div class="tech-tags">
                ${(project.technologies || []).map(tech => `
                    <span class="tech-tag">${escapeHtml(tech)}</span>
                `).join('')}
            </div>
            <div class="project-meta">
                <small>${getCategoryName(project.category)}</small>
                <small>${project.client || 'Клиент не указан'}</small>
                ${project.featured ? '<span class="tech-tag" style="background:#dc2626;color:white;">Featured</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Загрузка заявок
async function loadLeads() {
    try {
        showLoader('leadsContainer');
        
        const response = await fetch(`${API_BASE}/leads`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        leads = await response.json();
        renderLeads();
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        showMessage('Ошибка загрузки заявок', 'error');
        // Для демо используем моковые данные
        leads = await getMockLeads();
        renderLeads();
    }
}

// Отображение заявок
function renderLeads() {
    const container = document.getElementById('leadsContainer');
    if (!container) return;
    
    if (!leads || leads.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Заявок пока нет</h3>
                <p>Новые заявки появятся здесь</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = leads.map(lead => `
        <div class="lead-card">
            <div class="lead-info">
                <h4>${escapeHtml(lead.name)}</h4>
                <div class="lead-meta">
                    <span>📧 ${escapeHtml(lead.email)}</span>
                    <span>📞 ${lead.phone || 'Не указан'}</span>
                    <span>🕒 ${new Date(lead.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <p><strong>Услуга:</strong> ${getServiceName(lead.service)}</p>
                <p>${escapeHtml(lead.message || '')}</p>
            </div>
            <span class="status-badge status-${lead.status}">${getStatusText(lead.status)}</span>
            <select onchange="updateLeadStatus(${lead.id}, this.value)" class="btn btn-sm">
                <option value="new" ${lead.status === 'new' ? 'selected' : ''}>Новая</option>
                <option value="processed" ${lead.status === 'processed' ? 'selected' : ''}>В работе</option>
                <option value="completed" ${lead.status === 'completed' ? 'selected' : ''}>Завершена</option>
            </select>
        </div>
    `).join('');
}

// Загрузка статистики
async function loadStats() {
    try {
        showLoader('statsContainer');
        
        const response = await fetch(`${API_BASE}/stats`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const stats = await response.json();
        renderStats(stats);
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        showMessage('Ошибка загрузки статистики', 'error');
        // Для демо используем моковые данные
        const stats = await getMockStats();
        renderStats(stats);
    }
}

// Отображение статистики
function renderStats(stats) {
    const container = document.getElementById('statsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.totalLeads || 0}</div>
            <div class="stat-label">Всего заявок</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.newLeads || 0}</div>
            <div class="stat-label">Новых заявок</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.totalProjects || 0}</div>
            <div class="stat-label">Проектов</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.featuredProjects || 0}</div>
            <div class="stat-label">Featured проектов</div>
        </div>
    `;
}

// Работа с проектами
function openProjectModal(project = null) {
    try {
        editingProject = project;
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('modalTitle');
        
        if (project) {
            title.textContent = 'Редактировать проект';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectTitle').value = project.title || '';
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectCategory').value = project.category || '';
            document.getElementById('projectClient').value = project.client || '';
            document.getElementById('projectDuration').value = project.duration || '';
            document.getElementById('projectTechnologies').value = (project.technologies || []).join(', ');
            document.getElementById('projectImage').value = project.image || '';
            document.getElementById('projectResults').value = (project.results || []).join('\n');
            document.getElementById('projectFeatured').checked = project.featured || false;
        } else {
            title.textContent = 'Добавить проект';
            document.getElementById('projectForm').reset();
        }
        
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Ошибка открытия модального окна:', error);
        showMessage('Ошибка открытия формы', 'error');
    }
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    editingProject = null;
}

function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (project) openProjectModal(project);
}

async function deleteProject(id) {
    if (!confirm('Удалить этот проект?')) return;
    
    try {
        const response = await fetch(`${PROJECTS_API}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            projects = projects.filter(p => p.id !== id);
            renderProjects();
            showMessage('Проект удален', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showMessage(error.message || 'Ошибка удаления проекта', 'error');
    }
}

// Обработка формы проекта
async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        category: document.getElementById('projectCategory').value,
        client: document.getElementById('projectClient').value,
        duration: document.getElementById('projectDuration').value,
        technologies: document.getElementById('projectTechnologies').value.split(',').map(t => t.trim()).filter(t => t),
        image: document.getElementById('projectImage').value,
        results: document.getElementById('projectResults').value.split('\n').filter(r => r.trim()),
        featured: document.getElementById('projectFeatured').checked
    };

    try {
        let response;
        
        if (editingProject) {
            // Обновление проекта
            response = await fetch(`${PROJECTS_API}/${editingProject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Создание проекта
            response = await fetch(PROJECTS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            const result = await response.json();
            closeProjectModal();
            loadProjects(); // Перезагружаем проекты
            showMessage(result.message || (editingProject ? 'Проект обновлен' : 'Проект создан'), 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка сохранения');
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showMessage(error.message || 'Ошибка сохранения проекта', 'error');
    }
}

// Работа со статусами заявок
async function updateLeadStatus(leadId, status) {
    try {
        const response = await fetch(`${API_BASE}/leads/${leadId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            // Обновляем локальные данные
            const lead = leads.find(l => l.id == leadId);
            if (lead) {
                lead.status = status;
            }
            showMessage('Статус обновлен', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка обновления статуса');
        }
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        showMessage(error.message || 'Ошибка обновления статуса', 'error');
    }
}

// Экспорт заявок
async function exportLeads() {
    try {
        const response = await fetch(`${API_BASE}/leads/export`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            showMessage('Заявки экспортированы', 'success');
        } else {
            throw new Error('Ошибка экспорта');
        }
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        showMessage('Ошибка экспорта заявок', 'error');
    }
}

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'new': 'Новая',
        'processed': 'В работе',
        'completed': 'Завершена'
    };
    return statusMap[status] || status;
}

function getCategoryName(category) {
    const categoryMap = {
        'ai': 'Искусственный интеллект',
        'analytics': 'Бизнес-аналитика',
        'automation': 'Автоматизация',
        'security': 'Кибербезопасность',
        'consulting': 'Консалтинг'
    };
    return categoryMap[category] || category;
}

function getServiceName(service) {
    const serviceMap = {
        'development': 'Разработка',
        'consulting': 'Консалтинг',
        'analytics': 'Аналитика',
        'support': 'Поддержка'
    };
    return serviceMap[service] || service || 'Не выбрана';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type = 'success') {
    if (window.auth && window.auth.showMessage) {
        window.auth.showMessage(message, type);
    } else {
        // Fallback если auth.js не загружен
        alert(`${type === 'error' ? '❌' : '✅'} ${message}`);
    }
}

function showLoader(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="loader"></div>
                <p>Загрузка...</p>
            </div>
        `;
    }
}

// Моковые данные для демонстрации (используются при ошибках API)
async function getMockProjects() {
    return [
        {
            id: 1,
            title: "Система бизнес-аналитики",
            description: "Разработка комплексной системы аналитики для крупного ритейлера с использованием современных технологий обработки данных и визуализации.",
            category: "analytics",
            client: "Торговая сеть 'Прогресс'",
            duration: "6 месяцев",
            technologies: ["Python", "React", "PostgreSQL", "D3.js"],
            image: "/assets/images/project1.jpg",
            results: ["Увеличили эффективность на 40%", "Сократили затраты на 25%"],
            featured: true
        }
    ];
}

async function getMockLeads() {
    return [
        {
            id: 1,
            name: "Иван Петров",
            company: "ООО 'ТехноПро'",
            email: "ivan@techpro.ru",
            phone: "+7 (999) 123-45-67",
            service: "development",
            message: "Интересует разработка CRM-системы для нашего бизнеса.",
            status: "new",
            date: "2024-01-15T10:30:00Z"
        }
    ];
}

async function getMockStats() {
    return {
        totalLeads: 15,
        newLeads: 3,
        totalProjects: 8,
        featuredProjects: 2
    };
}
// Управление презентациями
class PresentationsManager {
    constructor() {
        this.presentations = [];
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadPresentations();
        await this.loadCategories();
        this.renderPresentationsList();
        this.bindEvents();
    }

    async loadPresentations() {
        try {
            const response = await fetch('/api/presentations');
            this.presentations = await response.json();
        } catch (error) {
            console.error('Error loading presentations:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/presentations/categories');
            this.categories = await response.json();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderPresentationsList() {
        const container = document.getElementById('presentationsList');
        if (!container) return;

        container.innerHTML = this.presentations.map(presentation => `
            <div class="presentation-item" data-id="${presentation.id}">
                <div class="presentation-info">
                    <h4>${presentation.title}</h4>
                    <p>${presentation.description}</p>
                    <div class="presentation-meta">
                        <span class="category">${presentation.category}</span>
                        <span class="duration">${presentation.duration}</span>
                        <span class="demo-requests">${presentation.demoRequests} запросов</span>
                    </div>
                </div>
                <div class="presentation-actions">
                    <button class="btn-edit" onclick="presentationsManager.editPresentation('${presentation.id}')">
                        Редактировать
                    </button>
                    <button class="btn-delete" onclick="presentationsManager.deletePresentation('${presentation.id}')">
                        Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    async createPresentation(formData) {
        try {
            const response = await fetch('/api/presentations', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                await this.loadPresentations();
                this.renderPresentationsList();
                this.closeModal();
                alert('Презентация успешно создана!');
            } else {
                alert('Ошибка: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating presentation:', error);
            alert('Ошибка при создании презентации');
        }
    }

    async editPresentation(id) {
        const presentation = this.presentations.find(p => p.id === id);
        if (!presentation) return;

        // Открываем модальное окно редактирования
        this.openEditModal(presentation);
    }

    async updatePresentation(id, formData) {
        try {
            const response = await fetch(`/api/presentations/${id}`, {
                method: 'PUT',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                await this.loadPresentations();
                this.renderPresentationsList();
                this.closeModal();
                alert('Презентация успешно обновлена!');
            } else {
                alert('Ошибка: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating presentation:', error);
            alert('Ошибка при обновлении презентации');
        }
    }

    async deletePresentation(id) {
        if (!confirm('Удалить эту презентацию?')) return;

        try {
            const response = await fetch(`/api/presentations/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                await this.loadPresentations();
                this.renderPresentationsList();
                alert('Презентация удалена!');
            } else {
                alert('Ошибка: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting presentation:', error);
            alert('Ошибка при удалении презентации');
        }
    }

    openCreateModal() {
        // Код для открытия модального окна создания
        const modal = document.getElementById('presentationModal');
        modal.style.display = 'block';
        
        const form = document.getElementById('presentationForm');
        form.reset();
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        };
    }

    openEditModal(presentation) {
        // Код для открытия модального окна редактирования
        const modal = document.getElementById('presentationModal');
        modal.style.display = 'block';
        
        const form = document.getElementById('presentationForm');
        form.reset();
        
        // Заполняем форму данными
        document.getElementById('presentationTitle').value = presentation.title;
        document.getElementById('presentationDescription').value = presentation.description;
        document.getElementById('presentationCategory').value = presentation.category;
        document.getElementById('presentationDuration').value = presentation.duration;
        document.getElementById('presentationFeatured').checked = presentation.featured;

        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleFormSubmit(presentation.id);
        };
    }

    closeModal() {
        const modal = document.getElementById('presentationModal');
        modal.style.display = 'none';
    }

    async handleFormSubmit(editId = null) {
        const form = document.getElementById('presentationForm');
        const formData = new FormData(form);

        if (editId) {
            await this.updatePresentation(editId, formData);
        } else {
            await this.createPresentation(formData);
        }
    }

    bindEvents() {
        // Биндим события для кнопок управления презентациями
        const btnAddPresentation = document.getElementById('btnAddPresentation');
        if (btnAddPresentation) {
            btnAddPresentation.addEventListener('click', () => this.openCreateModal());
        }

        // Закрытие модального окна
        const modal = document.getElementById('presentationModal');
        const span = modal.querySelector('.close');
        if (span) {
            span.addEventListener('click', () => this.closeModal());
        }
    }
}

// Инициализация менеджера презентаций
let presentationsManager;

document.addEventListener('DOMContentLoaded', () => {
    presentationsManager = new PresentationsManager();
});

// Глобальные функции для вызова из HTML
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.updateLeadStatus = updateLeadStatus;
window.exportLeads = exportLeads;
window.showSection = showSection;

console.log('Admin module loaded');
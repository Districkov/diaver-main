// Конфигурация API
const API_BASE = '/api/admin';
const PROJECTS_API = '/api/projects';

// Глобальные переменные
let projects = [];
let leads = [];
let editingProject = null;
let presentationsManager = null;

// Инициализация админ-панели
window.initializeAdmin = function() {
    console.log('🚀 Initializing admin panel...');
    
    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupAdmin();
        });
    } else {
        setupAdmin();
    }
};

function setupAdmin() {
    console.log('🔧 Setting up admin panel...');
    
    try {
        setupAdminEventListeners();
        loadInitialData();
        showSection('projects');
        
        // Инициализируем менеджер презентаций если есть секция
        if (document.getElementById('presentationsSection')) {
            presentationsManager = new PresentationsManager();
        }
        
        console.log('✅ Admin panel initialized successfully');
    } catch (error) {
        console.error('❌ Admin panel initialization failed:', error);
    }
}

// Настройка обработчиков событий
function setupAdminEventListeners() {
    console.log('🎯 Setting up admin event listeners...');
    
    // Навигация
    const navButtons = document.querySelectorAll('.nav-btn');
    if (navButtons.length === 0) {
        console.warn('⚠️ Nav buttons not found');
        return;
    }
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            console.log(`📁 Switching to section: ${section}`);
            showSection(section);
        });
    });
    
    // Форма проекта
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }
    
    // Модальное окно проекта
    setupProjectModal();
    
    // Кнопка добавления проекта
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => openProjectModal());
    }
}

function setupProjectModal() {
    const projectModal = document.getElementById('projectModal');
    if (!projectModal) return;
    
    // Закрытие по клику вне модального окна
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });
    
    // Закрытие по кнопке
    const closeBtn = projectModal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !projectModal.classList.contains('hidden')) {
            closeProjectModal();
        }
    });
}

// Загрузка начальных данных
function loadInitialData() {
    console.log('📥 Loading initial data...');
    loadProjects();
}

// Переключение секций
function showSection(sectionName) {
    console.log(`👁️ Showing section: ${sectionName}`);
    
    // Обновить навигацию
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeNavBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    // Скрыть все секции
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Показать целевую секцию
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Загрузить данные если нужно
    switch(sectionName) {
        case 'projects':
            if (projects.length === 0) loadProjects();
            break;
        case 'leads':
            if (leads.length === 0) loadLeads();
            break;
        case 'stats':
            loadStats();
            break;
        case 'presentations':
            if (presentationsManager) presentationsManager.loadPresentations();
            break;
    }
}

// Получить заголовки с авторизацией
function getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    
    if (window.auth && window.auth.getAuthHeaders) {
        return window.auth.getAuthHeaders();
    }
    
    console.warn('⚠️ No auth token available');
    return { 'Content-Type': 'application/json' };
}

// ===== ПРОЕКТЫ =====
async function loadProjects() {
    try {
        showLoader('projectsContainer');
        
        console.log('📡 Loading projects from API...');
        const response = await fetch(PROJECTS_API);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        projects = await response.json();
        console.log(`✅ Loaded ${projects.length} projects`);
        renderProjects();
        
    } catch (error) {
        console.error('❌ Error loading projects:', error);
        showMessage('Ошибка загрузки проектов', 'error');
        
        // Используем демо данные
        projects = await getDemoProjects();
        renderProjects();
    }
}

function renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) {
        console.warn('⚠️ projectsContainer not found');
        return;
    }
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📝 Проектов пока нет</h3>
                <p>Добавьте первый проект</p>
                <button class="btn btn-primary" onclick="openProjectModal()">
                    ➕ Добавить проект
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-actions">
                <button class="btn btn-sm btn-outline" onclick="editProject(${project.id})" title="Редактировать">
                    ✏️
                </button>
                <button class="btn btn-sm btn-outline btn-danger" onclick="deleteProject(${project.id})" title="Удалить">
                    🗑️
                </button>
            </div>
            
            <div class="project-image">
                ${project.image ? `
                    <img src="${project.image}" alt="${project.title}" onerror="this.style.display='none'">
                ` : `
                    <div class="project-image-placeholder">
                        ${getProjectIcon(project.category)}
                    </div>
                `}
            </div>
            
            <div class="project-content">
                <h3>${escapeHtml(project.title)}</h3>
                <p class="project-description">
                    ${escapeHtml(project.description?.substring(0, 150) || '')}...
                </p>
                
                <div class="tech-tags">
                    ${(project.technologies || []).map(tech => `
                        <span class="tech-tag">${escapeHtml(tech)}</span>
                    `).join('')}
                </div>
                
                <div class="project-meta">
                    <div class="meta-item">
                        <span class="meta-label">Категория:</span>
                        <span class="meta-value">${getCategoryName(project.category)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Клиент:</span>
                        <span class="meta-value">${project.client || 'Не указан'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Срок:</span>
                        <span class="meta-value">${project.duration || 'Не указан'}</span>
                    </div>
                </div>
                
                ${project.featured ? `
                    <div class="featured-badge">
                        ⭐ Featured
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function openProjectModal(project = null) {
    try {
        editingProject = project;
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('modalTitle');
        
        if (!modal) {
            console.error('❌ Project modal not found');
            return;
        }
        
        if (project) {
            title.textContent = '✏️ Редактировать проект';
            populateProjectForm(project);
        } else {
            title.textContent = '➕ Добавить проект';
            document.getElementById('projectForm').reset();
        }
        
        modal.classList.remove('hidden');
        console.log(`📋 ${project ? 'Edit' : 'Add'} project modal opened`);
        
    } catch (error) {
        console.error('❌ Error opening project modal:', error);
        showMessage('Ошибка открытия формы', 'error');
    }
}

function populateProjectForm(project) {
    document.getElementById('projectId').value = project.id || '';
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectCategory').value = project.category || '';
    document.getElementById('projectClient').value = project.client || '';
    document.getElementById('projectDuration').value = project.duration || '';
    document.getElementById('projectTechnologies').value = (project.technologies || []).join(', ');
    document.getElementById('projectImage').value = project.image || '';
    document.getElementById('projectResults').value = (project.results || []).join('\n');
    document.getElementById('projectFeatured').checked = project.featured || false;
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    editingProject = null;
    console.log('📋 Project modal closed');
}

function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (project) {
        console.log(`✏️ Editing project: ${project.title}`);
        openProjectModal(project);
    } else {
        console.error(`❌ Project not found: ${id}`);
        showMessage('Проект не найден', 'error');
    }
}

async function deleteProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) {
        showMessage('Проект не найден', 'error');
        return;
    }
    
    if (!confirm(`Удалить проект "${project.title}"?`)) {
        return;
    }
    
    try {
        console.log(`🗑️ Deleting project: ${project.title}`);
        
        const response = await fetch(`${PROJECTS_API}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            projects = projects.filter(p => p.id !== id);
            renderProjects();
            showMessage('✅ Проект удален', 'success');
            console.log(`✅ Project deleted: ${project.title}`);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('❌ Error deleting project:', error);
        showMessage(error.message || 'Ошибка удаления проекта', 'error');
    }
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = getProjectFormData();
    if (!validateProjectForm(formData)) {
        return;
    }
    
    try {
        console.log(`💾 ${editingProject ? 'Updating' : 'Creating'} project...`);
        
        const response = await saveProject(formData);
        
        if (response.ok) {
            const result = await response.json();
            closeProjectModal();
            await loadProjects(); // Перезагружаем проекты
            showMessage(result.message || (editingProject ? '✅ Проект обновлен' : '✅ Проект создан'), 'success');
            console.log(`✅ Project ${editingProject ? 'updated' : 'created'} successfully`);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка сохранения');
        }
    } catch (error) {
        console.error('❌ Error saving project:', error);
        showMessage(error.message || 'Ошибка сохранения проекта', 'error');
    }
}

function getProjectFormData() {
    return {
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        category: document.getElementById('projectCategory').value,
        client: document.getElementById('projectClient').value.trim(),
        duration: document.getElementById('projectDuration').value.trim(),
        technologies: document.getElementById('projectTechnologies').value.split(',').map(t => t.trim()).filter(t => t),
        image: document.getElementById('projectImage').value.trim(),
        results: document.getElementById('projectResults').value.split('\n').filter(r => r.trim()),
        featured: document.getElementById('projectFeatured').checked
    };
}

function validateProjectForm(formData) {
    if (!formData.title) {
        showMessage('Введите название проекта', 'error');
        return false;
    }
    if (!formData.description) {
        showMessage('Введите описание проекта', 'error');
        return false;
    }
    if (!formData.category) {
        showMessage('Выберите категорию проекта', 'error');
        return false;
    }
    return true;
}

async function saveProject(formData) {
    const url = editingProject ? `${PROJECTS_API}/${editingProject.id}` : PROJECTS_API;
    const method = editingProject ? 'PUT' : 'POST';
    
    return await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
    });
}

// ===== ЗАЯВКИ =====
async function loadLeads() {
    try {
        showLoader('leadsContainer');
        
        console.log('📡 Loading leads...');
        const response = await fetch(`${API_BASE}/leads`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        leads = await response.json();
        console.log(`✅ Loaded ${leads.length} leads`);
        renderLeads();
        
    } catch (error) {
        console.error('❌ Error loading leads:', error);
        showMessage('Ошибка загрузки заявок', 'error');
        
        // Используем демо данные
        leads = await getDemoLeads();
        renderLeads();
    }
}

function renderLeads() {
    const container = document.getElementById('leadsContainer');
    if (!container) return;
    
    if (!leads || leads.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📨 Заявок пока нет</h3>
                <p>Новые заявки появятся здесь</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = leads.map(lead => `
        <div class="lead-card status-${lead.status}">
            <div class="lead-header">
                <div class="lead-info">
                    <h4>${escapeHtml(lead.name)}</h4>
                    <div class="lead-meta">
                        <span>📧 ${escapeHtml(lead.email)}</span>
                        <span>📞 ${lead.phone || 'Не указан'}</span>
                        <span>🕒 ${formatDate(lead.date)}</span>
                    </div>
                </div>
                <span class="status-badge status-${lead.status}">
                    ${getStatusText(lead.status)}
                </span>
            </div>
            
            <div class="lead-content">
                <p><strong>📋 Услуга:</strong> ${getServiceName(lead.service)}</p>
                <p><strong>🏢 Компания:</strong> ${lead.company || 'Не указана'}</p>
                ${lead.message ? `
                    <div class="lead-message">
                        <strong>💬 Сообщение:</strong>
                        <p>${escapeHtml(lead.message)}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="lead-actions">
                <select onchange="updateLeadStatus(${lead.id}, this.value)" class="status-select">
                    <option value="new" ${lead.status === 'new' ? 'selected' : ''}>🆕 Новая</option>
                    <option value="processed" ${lead.status === 'processed' ? 'selected' : ''}>🔄 В работе</option>
                    <option value="completed" ${lead.status === 'completed' ? 'selected' : ''}>✅ Завершена</option>
                </select>
                
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="viewLead(${lead.id})" title="Просмотр">
                        👁️
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="contactLead(${lead.id})" title="Связаться">
                        📞
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function updateLeadStatus(leadId, status) {
    try {
        console.log(`🔄 Updating lead ${leadId} status to: ${status}`);
        
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
            showMessage('✅ Статус обновлен', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка обновления статуса');
        }
    } catch (error) {
        console.error('❌ Error updating lead status:', error);
        showMessage(error.message || 'Ошибка обновления статуса', 'error');
    }
}

function viewLead(leadId) {
    const lead = leads.find(l => l.id == leadId);
    if (lead) {
        alert(`
Детали заявки:

👤 Имя: ${lead.name}
📧 Email: ${lead.email}
📞 Телефон: ${lead.phone || 'Не указан'}
🏢 Компания: ${lead.company || 'Не указана'}
📋 Услуга: ${getServiceName(lead.service)}
💬 Сообщение: ${lead.message || 'Нет сообщения'}
🕒 Дата: ${formatDate(lead.date)}
📊 Статус: ${getStatusText(lead.status)}
        `);
    }
}

function contactLead(leadId) {
    const lead = leads.find(l => l.id == leadId);
    if (lead) {
        if (lead.phone) {
            window.open(`tel:${lead.phone}`, '_self');
        } else if (lead.email) {
            window.open(`mailto:${lead.email}`, '_self');
        } else {
            showMessage('Нет контактных данных для связи', 'warning');
        }
    }
}

// ===== СТАТИСТИКА =====
async function loadStats() {
    try {
        showLoader('statsContainer');
        
        console.log('📡 Loading stats...');
        const response = await fetch(`${API_BASE}/stats`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        console.log('✅ Stats loaded');
        renderStats(stats);
        
    } catch (error) {
        console.error('❌ Error loading stats:', error);
        showMessage('Ошибка загрузки статистики', 'error');
        
        // Используем демо данные
        const stats = await getDemoStats();
        renderStats(stats);
    }
}

function renderStats(stats) {
    const container = document.getElementById('statsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-number">${stats.totalLeads || 0}</div>
                <div class="stat-label">Всего заявок</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">🆕</div>
                <div class="stat-number">${stats.newLeads || 0}</div>
                <div class="stat-label">Новых заявок</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">🚀</div>
                <div class="stat-number">${stats.totalProjects || 0}</div>
                <div class="stat-label">Проектов</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-number">${stats.featuredProjects || 0}</div>
                <div class="stat-label">Featured проектов</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-number">${stats.conversionRate || '0%'}</div>
                <div class="stat-label">Конверсия</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-number">${stats.avgResponseTime || '0ч'}</div>
                <div class="stat-label">Среднее время ответа</div>
            </div>
        </div>
    `;
}

// ===== ПРЕЗЕНТАЦИИ =====
class PresentationsManager {
    constructor() {
        this.presentations = [];
        this.categories = [];
        console.log('🎬 PresentationsManager initialized');
        this.init();
    }

    async init() {
        try {
            await this.loadCategories();
            await this.loadPresentations();
            this.bindEvents();
            this.renderPresentationsList();
        } catch (error) {
            console.error('❌ Error initializing PresentationsManager:', error);
        }
    }

    async loadPresentations() {
        try {
            console.log('📡 Loading presentations...');
            // Используем мок данные
            this.presentations = await this.getDemoPresentations();
            console.log(`✅ Loaded ${this.presentations.length} presentations`);
        } catch (error) {
            console.error('❌ Error loading presentations:', error);
            this.presentations = await this.getDemoPresentations();
        }
    }

    async loadCategories() {
        this.categories = [
            { id: 'business', name: 'Бизнес-презентации' },
            { id: 'technical', name: 'Технические презентации' },
            { id: 'marketing', name: 'Маркетинговые презентации' }
        ];
    }

    renderPresentationsList() {
        const container = document.getElementById('presentationsList');
        if (!container) {
            console.warn('⚠️ presentationsList container not found');
            return;
        }

        if (this.presentations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📊 Презентаций пока нет</h3>
                    <p>Добавьте первую презентацию</p>
                    <button class="btn btn-primary" onclick="presentationsManager.openCreateModal()">
                        ➕ Добавить презентацию
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.presentations.map(presentation => `
            <div class="presentation-item">
                <div class="presentation-info">
                    <h4>${this.escapeHtml(presentation.title)}</h4>
                    <p>${this.escapeHtml(presentation.description)}</p>
                    <div class="presentation-meta">
                        <span class="category">${this.escapeHtml(presentation.category)}</span>
                        <span class="duration">⏱️ ${this.escapeHtml(presentation.duration)}</span>
                        <span class="demo-requests">👥 ${presentation.demoRequests || 0} запросов</span>
                    </div>
                </div>
                <div class="presentation-actions">
                    <button class="btn btn-sm btn-outline" onclick="presentationsManager.editPresentation('${presentation.id}')">
                        ✏️ Редактировать
                    </button>
                    <button class="btn btn-sm btn-outline btn-danger" onclick="presentationsManager.deletePresentation('${presentation.id}')">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    openCreateModal() {
        console.log('➕ Opening create presentation modal');
        // Реализация модального окна
        alert('Функция добавления презентации в разработке');
    }

    editPresentation(id) {
        console.log(`✏️ Editing presentation: ${id}`);
        // Реализация редактирования
        alert('Функция редактирования презентации в разработке');
    }

    async deletePresentation(id) {
        if (!confirm('Удалить эту презентацию?')) return;

        try {
            console.log(`🗑️ Deleting presentation: ${id}`);
            this.presentations = this.presentations.filter(p => p.id !== id);
            this.renderPresentationsList();
            showMessage('✅ Презентация удалена!', 'success');
        } catch (error) {
            console.error('❌ Error deleting presentation:', error);
            showMessage('Ошибка при удалении презентации', 'error');
        }
    }

    bindEvents() {
        console.log('🎯 Binding presentation events...');
        const btnAddPresentation = document.getElementById('btnAddPresentation');
        if (btnAddPresentation) {
            btnAddPresentation.addEventListener('click', () => this.openCreateModal());
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async getDemoPresentations() {
        return [
            {
                id: '1',
                title: 'Бизнес-аналитика для ритейла',
                description: 'Презентация решений для розничной торговли',
                category: 'Бизнес-презентации',
                duration: '45 мин',
                demoRequests: 12
            },
            {
                id: '2',
                title: 'Техническая архитектура AI-систем',
                description: 'Обзор технических решений для искусственного интеллекта',
                category: 'Технические презентации',
                duration: '60 мин',
                demoRequests: 8
            }
        ];
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getStatusText(status) {
    const statusMap = {
        'new': '🆕 Новая',
        'processed': '🔄 В работе',
        'completed': '✅ Завершена'
    };
    return statusMap[status] || status;
}

function getCategoryName(category) {
    const categoryMap = {
        'ai': '🤖 Искусственный интеллект',
        'analytics': '📊 Бизнес-аналитика',
        'automation': '⚙️ Автоматизация',
        'security': '🛡️ Кибербезопасность',
        'consulting': '💼 Консалтинг',
        'development': '💻 Разработка'
    };
    return categoryMap[category] || category;
}

function getServiceName(service) {
    const serviceMap = {
        'development': '💻 Разработка',
        'consulting': '💼 Консалтинг',
        'analytics': '📊 Аналитика',
        'support': '🔧 Поддержка',
        'ai': '🤖 Искусственный интеллект'
    };
    return serviceMap[service] || service || 'Не выбрана';
}

function getProjectIcon(category) {
    const icons = {
        'ai': '🤖',
        'analytics': '📊',
        'automation': '⚙️',
        'security': '🛡️',
        'consulting': '💼',
        'development': '💻',
        'default': '🚀'
    };
    return icons[category] || icons.default;
}

function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    try {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
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
        // Fallback уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'error' ? '❌' : '✅'}</span>
            <span class="notification-text">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
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

// ===== ДЕМО ДАННЫЕ =====
async function getDemoProjects() {
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
        },
        {
            id: 2,
            title: "AI-платформа для кибербезопасности",
            description: "Интеллектуальная система обнаружения и предотвращения кибератак с использованием машинного обучения.",
            category: "ai",
            client: "Банк 'Стандарт'",
            duration: "8 месяцев",
            technologies: ["Python", "TensorFlow", "Kafka", "React"],
            featured: true
        }
    ];
}

async function getDemoLeads() {
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
            date: new Date().toISOString()
        },
        {
            id: 2,
            name: "Мария Сидорова",
            company: "АО 'ПромИнвест'",
            email: "sidorova@prominvest.ru",
            phone: "+7 (495) 765-43-21",
            service: "consulting",
            message: "Нужна консультация по внедрению системы бизнес-аналитики.",
            status: "processed",
            date: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

async function getDemoStats() {
    return {
        totalLeads: 15,
        newLeads: 3,
        totalProjects: 8,
        featuredProjects: 2,
        conversionRate: '24%',
        avgResponseTime: '2ч 15м'
    };
}

// ===== ЭКСПОРТ =====
async function exportLeads() {
    try {
        console.log('📤 Exporting leads...');
        
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
            showMessage('✅ Заявки экспортированы', 'success');
        } else {
            throw new Error('Ошибка экспорта');
        }
    } catch (error) {
        console.error('❌ Error exporting leads:', error);
        showMessage('Ошибка экспорта заявок', 'error');
    }
}

// Глобальные функции
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.updateLeadStatus = updateLeadStatus;
window.exportLeads = exportLeads;
window.showSection = showSection;
window.viewLead = viewLead;
window.contactLead = contactLead;

console.log('✅ Admin module loaded successfully');
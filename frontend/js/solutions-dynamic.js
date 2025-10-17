console.log('🎯 solutions-dynamic.js ЗАГРУЖЕН!');

let allPresentations = [];

// Загрузка презентаций с сервера
async function loadPresentations() {
    try {
        console.log('🔄 Запрос к /api/presentations...');
        const response = await fetch('/api/presentations');
        
        console.log('📡 Статус ответа презентаций:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allPresentations = await response.json();
        console.log('✅ Презентации получены:', allPresentations);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки презентаций:', error);
        allPresentations = [];
    }
}

// Загрузка проектов из API
async function loadProjects() {
    try {
        await loadPresentations(); // Сначала загружаем презентации
        
        console.log('🔄 Запрос к /api/projects...');
        const response = await fetch('/api/projects');
        
        console.log('📡 Статус ответа проектов:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        console.log('✅ Проекты получены:', projects);
        
        // Обновляем счетчик проектов
        updateProjectsCounter(projects.length);
        
        displayFeaturedProjects(projects);
        displayAllProjects(projects);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки проектов:', error);
        showErrorMessage();
    }
}

// Обновляем счетчик проектов
function updateProjectsCounter(count) {
    const counter = document.getElementById('total-projects');
    if (counter) {
        counter.textContent = count + '+';
    }
}

// Находим презентацию для проекта
function findPresentationForProject(project) {
    if (!allPresentations || allPresentations.length === 0) return null;
    
    // Пытаемся найти по ID проекта
    let presentation = allPresentations.find(p => p.id === project.id?.toString());
    
    // Если не нашли, ищем по названию
    if (!presentation && project.title) {
        const projectId = generatePresentationId(project.title);
        presentation = allPresentations.find(p => p.id === projectId);
    }
    
    return presentation;
}

// Генерируем ID презентации на основе названия
function generatePresentationId(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9а-яё]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Показываем featured проекты
function displayFeaturedProjects(projects) {
    const container = document.getElementById('featured-projects-container');
    if (!container) {
        console.error('❌ Контейнер featured-projects-container не найден');
        return;
    }
    
    const featuredProjects = projects.filter(project => project.featured === true);
    console.log('⭐ Featured проекты:', featuredProjects);
    
    if (featuredProjects.length === 0) {
        container.innerHTML = `
            <div class="error-message">
                <h3>Нет избранных проектов</h3>
                <p>В базе данных нет проектов с пометкой "featured"</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = featuredProjects.map((project, index) => {
        const presentation = findPresentationForProject(project);
        console.log(`📊 Для проекта "${project.title}" найдена презентация:`, presentation);
        
        return `
        <div class="solution-detailed-card" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="solution-main-content">
                <div class="solution-header-detailed">
                    <div class="solution-icon-detailed">
                        <span>${project.icon || '💼'}</span>
                        <div class="icon-glow-detailed"></div>
                    </div>
                    <div class="solution-title-section">
                        <h3>${project.title || 'Название проекта'}</h3>
                        <div class="solution-meta">
                            <span class="solution-year">${project.year || '2023'}</span>
                            <span class="solution-status status-${project.status || 'implemented'}">${getStatusText(project.status)}</span>
                            <span class="solution-clients">${project.clients || 'Клиенты'}</span>
                        </div>
                    </div>
                </div>
                <p class="solution-description-detailed">${project.description || 'Описание проекта'}</p>
                ${project.features ? `
                <div class="solution-features-detailed">
                    <div class="feature-column">
                        <h4>Основные функции:</h4>
                        <ul>
                            ${(project.features.main || []).slice(0, 4).map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="feature-column">
                        <h4>Преимущества:</h4>
                        <ul>
                            ${(project.features.advantages || []).slice(0, 4).map(advantage => `<li>${advantage}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="solution-results">
                ${project.metrics ? `
                <div class="result-metrics">
                    ${project.metrics.slice(0, 3).map(metric => `
                        <div class="result-metric">
                            <div class="metric-value">${metric.value || '0'}</div>
                            <div class="metric-label">${metric.label || 'Показатель'}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                <div class="solution-actions-detailed">
                    ${presentation ? `
                    <button class="btn btn-primary btn-small btn-view-pdf" 
                            data-solution="${presentation.id}" 
                            onclick="showPresentation('${presentation.id}')">
                        <span>Смотреть презентацию</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                            <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    ` : `
                    <button class="btn btn-outline btn-small" disabled>
                        <span>Презентация скоро будет</span>
                    </button>
                    `}
                </div>
            </div>
        </div>
    `}).join('');
    
    console.log('✅ Featured проекты отображены');
}

// Показываем все проекты в компактном виде
function displayAllProjects(projects) {
    const container = document.getElementById('all-projects-container');
    if (!container) {
        console.error('❌ Контейнер all-projects-container не найден');
        return;
    }
    
    container.innerHTML = projects.map((project, index) => {
        const presentation = findPresentationForProject(project);
        
        return `
        <div class="solution-compact-card" data-aos="fade-up" data-aos-delay="${index * 50}">
            <div class="compact-icon">${project.icon || '💼'}</div>
            <div class="compact-content">
                <h4>${project.title || 'Название проекта'}</h4>
                <p>${project.shortDescription || project.description || 'Краткое описание проекта'}</p>
                <div class="compact-meta">
                    <span class="year">${project.year || '2023'}</span>
                    <span class="status status-${project.status || 'implemented'}">${getStatusText(project.status)}</span>
                    ${presentation ? `
                    <button class="btn-pdf-mini" onclick="showPresentation('${presentation.id}')" 
                            title="Смотреть презентацию">
                        📊
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `}).join('');
    
    console.log('✅ Все проекты отображены');
}

// Показываем сообщение об ошибке
function showErrorMessage() {
    const featuredContainer = document.getElementById('featured-projects-container');
    const allContainer = document.getElementById('all-projects-container');
    
    const errorHTML = `
        <div class="error-message">
            <h3>Ошибка загрузки проектов</h3>
            <p>Не удалось загрузить данные с сервера. Пожалуйста, попробуйте позже.</p>
            <button class="btn btn-outline btn-small" onclick="location.reload()">Попробовать снова</button>
        </div>
    `;
    
    if (featuredContainer) featuredContainer.innerHTML = errorHTML;
    if (allContainer) allContainer.innerHTML = errorHTML;
}

// Вспомогательная функция для статуса
function getStatusText(status) {
    const statusMap = {
        'implemented': 'Внедрена',
        'development': 'В разработке', 
        'prototype': 'Прототип',
        'planned': 'Запланирована'
    };
    return statusMap[status] || 'Внедрена';
}

// Запускаем загрузку
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM загружен, запускаем загрузку проектов');
    loadProjects();
});
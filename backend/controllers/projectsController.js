const fs = require('fs');
const path = require('path');

const projectsFile = path.join(__dirname, '../data/projects.json');

// Получить все проекты
const getProjects = (req, res) => {
    try {
        if (!fs.existsSync(projectsFile)) {
            return res.json([]);
        }
        
        const data = fs.readFileSync(projectsFile, 'utf8');
        const projects = JSON.parse(data);
        res.json(projects);
    } catch (error) {
        console.error('Ошибка чтения проектов:', error);
        res.status(500).json({ error: 'Ошибка чтения проектов' });
    }
};

// Получить проект по ID
const getProjectById = (req, res) => {
    try {
        const { id } = req.params;
        
        if (!fs.existsSync(projectsFile)) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        
        const data = fs.readFileSync(projectsFile, 'utf8');
        const projects = JSON.parse(data);
        const project = projects.find(p => p.id == id);
        
        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        
        res.json(project);
    } catch (error) {
        console.error('Ошибка чтения проекта:', error);
        res.status(500).json({ error: 'Ошибка чтения проекта' });
    }
};

// Создать новый проект
const createProject = (req, res) => {
    try {
        const project = req.body;
        
        // Валидация
        if (!project.title || !project.description || !project.category) {
            return res.status(400).json({ error: 'Заполните обязательные поля: название, описание, категория' });
        }
        
        let projects = [];
        if (fs.existsSync(projectsFile)) {
            const data = fs.readFileSync(projectsFile, 'utf8');
            projects = JSON.parse(data);
        }
        
        // Генерируем ID
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        
        const newProject = {
            id: newId,
            title: project.title,
            description: project.description,
            category: project.category,
            client: project.client || '',
            duration: project.duration || '',
            technologies: project.technologies || [],
            image: project.image || '',
            results: project.results || [],
            featured: project.featured || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        projects.push(newProject);
        fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
        
        res.status(201).json({ 
            success: true, 
            message: 'Проект создан',
            project: newProject 
        });
    } catch (error) {
        console.error('Ошибка создания проекта:', error);
        res.status(500).json({ error: 'Ошибка создания проекта' });
    }
};

// Обновить проект
const updateProject = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (!fs.existsSync(projectsFile)) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        
        const data = fs.readFileSync(projectsFile, 'utf8');
        let projects = JSON.parse(data);
        
        const projectIndex = projects.findIndex(p => p.id == id);
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        
        // Обновляем проект
        projects[projectIndex] = {
            ...projects[projectIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Проект обновлен',
            project: projects[projectIndex] 
        });
    } catch (error) {
        console.error('Ошибка обновления проекта:', error);
        res.status(500).json({ error: 'Ошибка обновления проекта' });
    }
};

// Удалить проект
const deleteProject = (req, res) => {
    try {
        const { id } = req.params;
        
        if (!fs.existsSync(projectsFile)) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        
        const data = fs.readFileSync(projectsFile, 'utf8');
        let projects = JSON.parse(data);
        
        const projectIndex = projects.findIndex(p => p.id == id);
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        
        const deletedProject = projects.splice(projectIndex, 1)[0];
        fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Проект удален',
            project: deletedProject 
        });
    } catch (error) {
        console.error('Ошибка удаления проекта:', error);
        res.status(500).json({ error: 'Ошибка удаления проекта' });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};
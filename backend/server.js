const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Определяем корневую директорию в зависимости от среды
const isProduction = process.env.NODE_ENV === 'production';
const rootDir = isProduction ? __dirname : path.join(__dirname, '..');
const FRONTEND_DIR = path.join(rootDir, 'frontend');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_DIR));

// Пути к файлам данных (адаптированные для продакшена)
const DATA_DIR = path.join(rootDir, 'backend/data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const PRESENTATIONS_FILE = path.join(DATA_DIR, 'presentations.json');
const PRESENTATIONS_DIR = path.join(FRONTEND_DIR, 'assets/presentations');

// Создаем необходимые директории при запуске
function initializeDirectories() {
  const dirs = [DATA_DIR, PRESENTATIONS_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// Инициализация файлов данных
function initializeDataFiles() {
  const files = [
    { path: PROJECTS_FILE, default: '[]' },
    { path: LEADS_FILE, default: '[]' },
    { 
      path: PRESENTATIONS_FILE, 
      default: JSON.stringify({
        presentations: {},
        categories: ["accounting", "government", "business", "finance", "education"],
        settings: {
          uploadPath: "/assets/presentations/",
          allowedFormats: [".pdf", ".pptx", ".ppt"]
        }
      }, null, 2)
    }
  ];

  files.forEach(({ path: filePath, default: defaultData }) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, defaultData);
      console.log(`✅ Created data file: ${filePath}`);
    }
  });
}

// Вызываем инициализацию при запуске
initializeDirectories();
initializeDataFiles();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(PRESENTATIONS_DIR)) {
      fs.mkdirSync(PRESENTATIONS_DIR, { recursive: true });
    }
    cb(null, PRESENTATIONS_DIR);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['.pdf', '.pptx', '.ppt'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedFormats.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только PDF, PPTX и PPT файлы'));
    }
  }
});

// Функции для работы с данными
const readProjects = () => {
  try {
    const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
};

const writeProjects = (projects) => {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error('Error writing projects:', error);
    throw error;
  }
};

const readLeads = () => {
  try {
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading leads:', error);
    return [];
  }
};

const writeLeads = (leads) => {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error('Error writing leads:', error);
    throw error;
  }
};

const readPresentations = () => {
  try {
    const data = fs.readFileSync(PRESENTATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading presentations:', error);
    return { presentations: {}, categories: [], settings: {} };
  }
};

const writePresentations = (data) => {
  try {
    fs.writeFileSync(PRESENTATIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing presentations:', error);
    throw error;
  }
};

// ==================== API ДЛЯ ПРЕЗЕНТАЦИЙ ====================

// Получить все презентации
app.get('/api/presentations', (req, res) => {
  try {
    const data = readPresentations();
    const presentations = Object.values(data.presentations);
    res.json(presentations);
  } catch (error) {
    console.error('Error getting presentations:', error);
    res.status(500).json({ error: 'Ошибка при получении презентаций' });
  }
});

// Получить презентацию по ID
app.get('/api/presentations/:id', (req, res) => {
  try {
    const data = readPresentations();
    const presentation = data.presentations[req.params.id];
    
    if (!presentation) {
      return res.status(404).json({ error: 'Презентация не найдена' });
    }
    
    res.json(presentation);
  } catch (error) {
    console.error('Error getting presentation:', error);
    res.status(500).json({ error: 'Ошибка при получении презентации' });
  }
});

// Создать новую презентацию
app.post('/api/presentations', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл презентации обязателен' });
    }

    const { title, description, category, duration, featured } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Название и категория обязательны' });
    }

    const data = readPresentations();
    const presentationId = generateId(title);
    
    const presentation = {
      id: presentationId,
      title: title,
      description: description || '',
      file: `/assets/presentations/${req.file.filename}`,
      fileName: req.file.filename,
      downloadName: `${title}-ДИАВЕР.pdf`,
      category: category,
      duration: duration || '30 минут',
      featured: featured === 'true',
      demoRequests: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.presentations[presentationId] = presentation;
    
    // Добавляем новую категорию если её нет
    if (!data.categories.includes(category)) {
      data.categories.push(category);
    }
    
    writePresentations(data);

    res.json({ 
      success: true, 
      message: 'Презентация успешно создана',
      presentation 
    });
  } catch (error) {
    console.error('Error creating presentation:', error);
    res.status(500).json({ error: 'Ошибка при создании презентации' });
  }
});

// Обновить презентацию
app.put('/api/presentations/:id', upload.single('file'), (req, res) => {
  try {
    const data = readPresentations();
    const presentation = data.presentations[req.params.id];
    
    if (!presentation) {
      return res.status(404).json({ error: 'Презентация не найдена' });
    }

    const { title, description, category, duration, featured } = req.body;
    
    // Обновляем данные
    presentation.title = title || presentation.title;
    presentation.description = description || presentation.description;
    presentation.category = category || presentation.category;
    presentation.duration = duration || presentation.duration;
    presentation.featured = featured === 'true';
    presentation.updatedAt = new Date().toISOString();

    // Если загружен новый файл
    if (req.file) {
      // Удаляем старый файл
      const oldFilePath = path.join(PRESENTATIONS_DIR, presentation.fileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      
      presentation.file = `/assets/presentations/${req.file.filename}`;
      presentation.fileName = req.file.filename;
    }

    data.presentations[req.params.id] = presentation;
    writePresentations(data);

    res.json({ 
      success: true, 
      message: 'Презентация успешно обновлена',
      presentation 
    });
  } catch (error) {
    console.error('Error updating presentation:', error);
    res.status(500).json({ error: 'Ошибка при обновлении презентации' });
  }
});

// Удалить презентацию
app.delete('/api/presentations/:id', (req, res) => {
  try {
    const data = readPresentations();
    const presentation = data.presentations[req.params.id];
    
    if (!presentation) {
      return res.status(404).json({ error: 'Презентация не найдена' });
    }

    // Удаляем файл
    const filePath = path.join(PRESENTATIONS_DIR, presentation.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Удаляем из данных
    delete data.presentations[req.params.id];
    writePresentations(data);

    res.json({ 
      success: true, 
      message: 'Презентация успешно удалена' 
    });
  } catch (error) {
    console.error('Error deleting presentation:', error);
    res.status(500).json({ error: 'Ошибка при удалении презентации' });
  }
});

// Получить категории презентаций
app.get('/api/presentations/categories', (req, res) => {
  try {
    const data = readPresentations();
    res.json(data.categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

// Вспомогательная функция для генерации ID
function generateId(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9а-яё]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ==================== СУЩЕСТВУЮЩИЕ API ====================

// API для проектов
app.get('/api/projects', (req, res) => {
  try {
    let projects = readProjects();
    const category = req.query.category;
    
    if (category) {
      projects = projects.filter(p => p.category === category);
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const projects = readProjects();
    const project = projects.find(p => p.id == req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Ошибка при получении проекта' });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const projects = readProjects();
    const project = {
      id: Date.now(),
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'project',
      technologies: req.body.technologies || [],
      image: req.body.image || '/assets/images/default.jpg',
      client: req.body.client || '',
      duration: req.body.duration || '',
      results: req.body.results || [],
      featured: req.body.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(project);
    writeProjects(projects);
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Ошибка при создании проекта' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const projects = readProjects();
    const index = projects.findIndex(p => p.id == req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    projects[index] = {
      ...projects[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    writeProjects(projects);
    res.json({ success: true, project: projects[index] });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Ошибка при обновлении проекта' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const projects = readProjects();
    const filteredProjects = projects.filter(p => p.id != req.params.id);
    
    if (projects.length === filteredProjects.length) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    writeProjects(filteredProjects);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Ошибка при удалении проекта' });
  }
});

// Админка API
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // В продакшене используйте переменные окружения!
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin';
    
    if (username === adminUser && password === adminPass) {
      res.json({ 
        success: true, 
        message: 'Успешный вход',
        token: 'admin-token-' + Date.now()
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Неверный логин или пароль' 
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Ошибка при входе в админку' });
  }
});

app.get('/api/admin/leads', (req, res) => {
  try {
    const leads = readLeads();
    res.json(leads);
  } catch (error) {
    console.error('Error getting leads:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Обработка формы контактов
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, company, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Заполните обязательные поля: имя, email и сообщение' 
      });
    }

    const leads = readLeads();
    const lead = {
      id: Date.now(),
      name, email, phone, company, service, message,
      date: new Date().toISOString(),
      status: 'new'
    };

    leads.push(lead);
    writeLeads(leads);

    res.json({ 
      success: true, 
      message: 'Заявка успешно отправлена!' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка отправки заявки' 
    });
  }
});

// Статические маршруты для страниц
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get('/contacts', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'pages/contacts.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'pages/products.html'));
});

app.get('/solutions', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'pages/solutions.html'));
});

app.get('/company', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'pages/company.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'pages/admin.html'));
});

// Обработка ошибок multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой. Максимальный размер: 50MB' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Обработка 404 для API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found: ' + req.originalUrl });
});

// Обработка 404 для страниц
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(FRONTEND_DIR, 'pages/404.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📁 Корневая директория: ${rootDir}`);
  console.log(`🌐 Режим: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`📁 Статические файлы: ${FRONTEND_DIR}`);
  console.log(`💾 Данные: ${DATA_DIR}`);
  console.log(`📊 Презентации: ${PRESENTATIONS_DIR}`);
  console.log(`🌐 Главная: http://localhost:${PORT}`);
  console.log(`🔧 Админка: http://localhost:${PORT}/admin`);
  console.log(`💡 Решения: http://localhost:${PORT}/solutions`);
});
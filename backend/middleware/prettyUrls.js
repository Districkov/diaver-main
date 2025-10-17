const path = require('path');
const fs = require('fs');

const prettyUrls = (req, res, next) => {
    // Пропускаем API маршруты
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Пропускаем статические файлы
    if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/assets/')) {
        return next();
    }
    
    // Убираем расширения .html из URL
    if (req.path.endsWith('.html')) {
        const newPath = req.path.replace(/\.html$/, '');
        return res.redirect(301, newPath);
    }
    
    // Для корневого пути
    if (req.path === '/') {
        return next();
    }
    
    // Для известных маршрутов добавляем .html если файл существует
    const knownRoutes = ['/admin', '/contacts', '/products', '/solutions', '/company'];
    if (knownRoutes.includes(req.path)) {
        const filePath = path.join(__dirname, '../../frontend', `pages${req.path}.html`);
        
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }
    
    next();
};

module.exports = prettyUrls;
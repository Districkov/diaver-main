// Конфигурация аутентификации
const AUTH_CONFIG = {
    username: 'admin',
    password: 'Diaver',
    tokenKey: 'adminAuthToken',
    apiBase: '/api/admin'
};

// Глобальные переменные
let isAuthenticated = false;
let authToken = null;

// Инициализация аутентификации
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

// Инициализация системы аутентификации
function initializeAuth() {
    checkAuthStatus();
    setupAuthEventListeners();
}

// Проверка статуса аутентификации
async function checkAuthStatus() {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    
    if (token) {
        authToken = token;
        const isValid = await verifyToken();
        
        if (isValid) {
            isAuthenticated = true;
            showAuthenticatedUI();
        } else {
            logout();
        }
    } else {
        showLoginUI();
    }
}

// Проверка валидности токена
async function verifyToken() {
    try {
        const response = await fetch(`${AUTH_CONFIG.apiBase}/leads`, {
            headers: getAuthHeaders()
        });
        
        return response.ok;
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        return false;
    }
}

// Настройка обработчиков событий аутентификации
function setupAuthEventListeners() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Обработка входа
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${AUTH_CONFIG.apiBase}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Сохраняем токен аутентификации
            const token = btoa(`${username}:${password}`);
            localStorage.setItem(AUTH_CONFIG.tokenKey, token);
            authToken = token;
            isAuthenticated = true;
            
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            showAuthenticatedUI();
            showMessage('Успешный вход', 'success');
        } else {
            errorDiv.textContent = data.error || 'Ошибка авторизации';
            errorDiv.style.display = 'block';
            document.getElementById('password').value = '';
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        errorDiv.textContent = 'Ошибка соединения с сервером';
        errorDiv.style.display = 'block';
        document.getElementById('password').value = '';
    }
}

// Выход из системы
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        authToken = null;
        isAuthenticated = false;
        
        showLoginUI();
        showMessage('Вы вышли из системы', 'info');
    }
}

// Принудительный выход (при ошибках аутентификации)
function forceLogout(message = 'Сессия истекла') {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    authToken = null;
    isAuthenticated = false;
    
    showLoginUI();
    showMessage(message, 'error');
}

// Получить заголовки с авторизацией
function getAuthHeaders() {
    if (!authToken) {
        throw new Error('Not authenticated');
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`
    };
}

// Проверить авторизацию перед запросом
function requireAuth() {
    if (!isAuthenticated) {
        throw new Error('Authentication required');
    }
    return getAuthHeaders();
}

// Показать интерфейс входа
function showLoginUI() {
    const loginSection = document.getElementById('loginSection');
    const adminContent = document.getElementById('adminContent');
    
    if (loginSection) loginSection.classList.remove('hidden');
    if (adminContent) adminContent.classList.add('hidden');
    
    // Сбрасываем форму входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }
}

// Показать интерфейс после авторизации
function showAuthenticatedUI() {
    const loginSection = document.getElementById('loginSection');
    const adminContent = document.getElementById('adminContent');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');
    
    // Инициализируем админ-панель
    if (typeof window.initializeAdmin === 'function') {
        window.initializeAdmin();
    }
}

// Показать сообщение
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.textContent = message;
    
    // Стили для сообщений
    if (!document.querySelector('#auth-message-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-message-styles';
        style.textContent = `
            .auth-message {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                font-weight: 500;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            .auth-message-success {
                background: #10b981;
                color: white;
            }
            .auth-message-error {
                background: #ef4444;
                color: white;
            }
            .auth-message-info {
                background: #3b82f6;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Экспорт функций для использования в других модулях
window.auth = {
    login: handleLogin,
    logout,
    getAuthHeaders,
    isAuthenticated: () => isAuthenticated,
    requireAuth
};

// Глобальные функции для вызова из HTML
window.logout = logout;

console.log('Auth module loaded');
async function login(username, password) {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    // Проверяем content-type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned HTML instead of JSON: ${text.substring(0, 100)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
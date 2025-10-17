// form-validator.js
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form-enhanced[data-validate]');
    
    if (contactForm) {
        initFormValidation(contactForm);
    }
});

function initFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Добавляем обработчики событий
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
    
    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Валидация всех полей
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });
        
        if (isValid) {
            submitForm(form, submitBtn);
        }
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    clearError(field);
    
    // Проверка обязательных полей
    if (isRequired && !value) {
        showError(field, 'Это поле обязательно для заполнения');
        return false;
    }
    
    // Специфические проверки
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showError(field, 'Введите корректный email адрес');
            return false;
        }
    }
    
    if (field.type === 'tel' && value) {
        const phoneRegex = /^(\+7|8)[\s(-]?\d{3}[\s)-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
        if (!phoneRegex.test(value)) {
            showError(field, 'Введите корректный номер телефона');
            return false;
        }
    }
    
    return true;
}

function showError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ff4444;
        font-size: 0.875rem;
        margin-top: 5px;
    `;
    
    field.parentNode.appendChild(errorElement);
}

function clearError(e) {
    const field = e.target || e;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function submitForm(form, submitBtn) {
    const originalText = submitBtn.querySelector('span').textContent;
    const submitText = submitBtn.querySelector('span');
    
    // Показываем состояние загрузки
    submitText.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    // Имитация отправки (замените на реальный AJAX запрос)
    setTimeout(() => {
        // Успешная отправка
        showSuccessMessage(form, 'Сообщение успешно отправлено! Мы свяжемся с вами в течение 1 часа.');
        
        // Восстанавливаем кнопку
        submitText.textContent = originalText;
        submitBtn.disabled = false;
        
        // Очищаем форму
        form.reset();
        
    }, 2000);
}

function showSuccessMessage(form, message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        margin-top: 20px;
        text-align: center;
    `;
    
    form.appendChild(successElement);
    
    // Удаляем сообщение через 5 секунд
    setTimeout(() => {
        successElement.remove();
    }, 5000);
}
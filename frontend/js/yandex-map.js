// yandex-map.js - исправленная версия с улучшенной обработкой ошибок
console.log('🔄 Загрузка Яндекс.Карт...');

function initYandexMap() {
    console.log('📍 Инициализация Яндекс.Карт...');
    
    const mapContainer = document.getElementById('yandex-map');
    if (!mapContainer) {
        console.error('❌ Контейнер для карты не найден');
        return;
    }

    console.log('✅ Контейнер карты найден');

    // Проверяем загружен ли API
    if (typeof ymaps === 'undefined') {
        console.error('❌ Yandex Maps API не загружено');
        showMapError(mapContainer, 'Библиотека карт не загружена');
        return;
    }

    console.log('✅ Yandex Maps API загружено, версия:', ymaps.v);

    ymaps.ready(() => {
        console.log('✅ Yandex Maps API готово к использованию');
        
        try {
            const mapCenter = [55.731455, 37.669367];
            console.log('📍 Центр карты:', mapCenter);
            
            // Создаем карту
            const myMap = new ymaps.Map("yandex-map", {
                center: mapCenter,
                zoom: 15,
                controls: ['zoomControl', 'fullscreenControl', 'typeSelector'],
                behaviors: ['default', 'scrollZoom']
            });

            console.log('✅ Карта создана успешно');

            // Создаем метку
            const myPlacemark = new ymaps.Placemark(mapCenter, {
                balloonContentHeader: '<div style="font-size: 16px; font-weight: bold; color: #ebb625ff;">ООО "ДИАВЕР"</div>',
                balloonContentBody: `
                    <div style="color: #000000ff;">
                        <strong>Адрес:</strong> Москва, ул. Волгоградский проспект, д. 2<br>
                        <strong>Телефон:</strong> +7 (495) 123-45-67<br>
                        <strong>Email:</strong> info@diaver.ru
                    </div>
                `,
                balloonContentFooter: '<div style="color: #94a3b8; font-style: italic;">Ждем вас в нашем офисе!</div>',
                hintContent: 'Наш офис - ООО "ДИАВЕР"'
            }, {
                preset: 'islands#blueBusinessIcon',
                iconColor: '#2563eb',
                balloonCloseButton: true,
                hideIconOnBalloonOpen: false
            });

            console.log('✅ Метка создана');

            // Добавляем метку на карту
            myMap.geoObjects.add(myPlacemark);
            console.log('✅ Метка добавлена на карту');

            // Настройка поведения карты
            myMap.behaviors.disable('scrollZoom');
            myMap.behaviors.enable('multiTouch');
            
            // Включаем скролл зум по Shift
            myMap.behaviors.enable('scrollZoom');

            // Открываем баллун при клике на метку
            myPlacemark.events.add('click', function() {
                myPlacemark.balloon.open();
                console.log('🎈 Баллун открыт');
            });

            // Обработчики событий карты
            myMap.events.add('boundschange', function() {
                console.log('🗺️ Границы карты изменены');
            });

            // Убираем индикатор загрузки
            setTimeout(() => {
                mapContainer.classList.add('loaded');
                console.log('✅ Индикатор загрузки скрыт');
            }, 500);

            console.log('🎉 Карта полностью инициализирована');

        } catch (error) {
            console.error('❌ Ошибка создания карты:', error);
            showMapError(mapContainer, 'Ошибка загрузки карты: ' + error.message);
        }
    }).catch(error => {
        console.error('❌ Ошибка в ymaps.ready:', error);
        showMapError(mapContainer, 'Ошибка инициализации карты');
    });
}

function showMapError(container, message) {
    console.log('🔄 Показываем сообщение об ошибке:', message);
    
    container.innerHTML = `
        <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100%; 
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            flex-direction: column;
            gap: 1rem;
            padding: 2rem;
            text-align: center;
            color: var(--gray);
            border: 2px dashed rgba(255, 255, 255, 0.2);
        ">
            <div style="font-size: 3rem;">🗺️</div>
            <div style="font-size: 1.1rem; font-weight: 500; color: var(--light);">${message}</div>
            <div style="font-size: 0.9rem; color: var(--gray-light);">
                Москва, ул. Примерная, д. 123<br>
                Бизнес-центр "ТехноПарк"
            </div>
            <a href="https://yandex.ru/maps/?text=Москва, ул. Примерная, д. 123" 
               target="_blank" 
               rel="noopener noreferrer"
               style="
                    background: var(--primary);
                    color: white;
                    padding: 0.7rem 1.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin-top: 1rem;
                    transition: all 0.3s ease;
                    border: 1px solid var(--primary);
               "
               onmouseover="this.style.background='var(--primary-dark)'; this.style.transform='translateY(-2px)';"
               onmouseout="this.style.background='var(--primary)'; this.style.transform='translateY(0)';">
                📍 Открыть в Яндекс.Картах
            </a>
        </div>
    `;
    container.classList.add('loaded');
}

// Проверяем состояние загрузки API
function checkAPIStatus() {
    console.log('🔍 Проверка статуса API Яндекс.Карт...');
    
    if (typeof ymaps !== 'undefined') {
        console.log('✅ API Яндекс.Карт доступно');
        return true;
    } else {
        console.log('❌ API Яндекс.Карт недоступно');
        return false;
    }
}

// Основная инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM полностью загружен');
    
    // Даем время на загрузку других ресурсов
    setTimeout(() => {
        if (checkAPIStatus()) {
            initYandexMap();
        } else {
            // Если API не загрузилось, пробуем еще раз через 2 секунды
            setTimeout(() => {
                if (checkAPIStatus()) {
                    initYandexMap();
                } else {
                    const mapContainer = document.getElementById('yandex-map');
                    if (mapContainer) {
                        showMapError(mapContainer, 'Не удалось загрузить карты');
                    }
                }
            }, 2000);
        }
    }, 100);
});

// Резервная инициализация на случай если DOM уже загружен
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('⚡ Быстрая инициализация (DOM уже готов)');
    setTimeout(initYandexMap, 500);
}

// Глобальная обработка ошибок
window.addEventListener('error', function(e) {
    console.error('🚨 Глобальная ошибка:', e.error);
});

console.log('✅ yandex-map.js загружен');

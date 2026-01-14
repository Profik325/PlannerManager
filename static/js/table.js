document.addEventListener('DOMContentLoaded', function() {
    window.currentWeekStart = getMonday(new Date());

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'calendar' && pathParts[1]) {
        window.currentTableId = parseInt(pathParts[1]) || 1;
    }

    // загружаем имя через API
    const tableId = window.currentTableId;
    const meth = 'get-name';

    fetch(`/api/tables?id=${tableId}&method=${meth}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('tableName').textContent = data.title;
        });


    const dayHeaders = document.querySelectorAll('.day-header');
    const dateRangeElement = document.querySelector('.date-range');
    dayHeaders.forEach(header => {
        header.addEventListener('click', function() {

            const date = this.dataset.date;
            const dayIndex = this.querySelector('.day-index');
            const dayName = this.querySelector('.day-name').textContent;
            const dayDate = this.querySelector('.day-date').textContent;

            dayHeaders.forEach(h => {
                h.classList.remove('selected', 'active');
                h.style.backgroundColor = '';
                h.style.boxShadow = '';
            });

            this.classList.add('selected', 'active');
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            this.style.boxShadow = 'inset 0 0 15px var(--color_2_theme_rgba)';

            ChosenDayIndex = this.dataset.dayindex;
        });

        /*header.addEventListener('dblclick', function() {
            const date = this.dataset.date;
            openEventModalForDate(date);
        });*/
    });

    const weekDates = getWeekDates(window.currentWeekStart);
    updateCalendarHeader(weekDates);

    loadEventsForWeek();

    document.querySelector('.prev-week').addEventListener('click', function() {
        navigateWeek(-1);
    });

    document.querySelector('.next-week').addEventListener('click', function() {
        navigateWeek(1);
    });

    document.querySelector('.btn-today').addEventListener('click', function() {
        window.currentWeekStart = getMonday(new Date());
        const weekDates = getWeekDates(window.currentWeekStart);
        updateCalendarHeader(weekDates);
        checkNavigationLimits();
    });

    document.querySelectorAll('.add-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const date = this.dataset.date;
            const hour = this.dataset.hour;
            openEventModal(date, hour);
        });
    });

    document.querySelector('.btn-cancel').addEventListener('click', closeEventModal);
    document.querySelector('.modal').addEventListener('click', function(e) {
        if (e.target === this) closeEventModal();
    });

    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
    });

    highlightCurrentTime();
    setInterval(highlightCurrentTime, 60000);
    setInterval(loadEventsForWeek, 100); // temporary backup just to avoid visual issues with rendering events; gotta fix later
});

// Функция для навигации по неделям
function navigateWeek(direction) {
    checkNavigationLimits();

    if (!window.currentWeekStart) {
        window.currentWeekStart = getMonday(new Date());
    }

    const today = new Date();
    const todayMonday = getMonday(today);

    const newDate = new Date(window.currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));

    const weeksBackLimit = getMonday(new Date(todayMonday));
    weeksBackLimit.setDate(weeksBackLimit.getDate() - 7);

    const weeksForwardLimit = getMonday(new Date(todayMonday));
    weeksForwardLimit.setDate(weeksForwardLimit.getDate() + (2 * 7));

    if (direction < 0 && newDate < weeksBackLimit + 1) {
        return;
    }

    if (direction > 0 && newDate > weeksForwardLimit + 1) {
        return;
    }

    // Если лимиты не превышены, обновляем глобальную переменную с новой датой
    window.currentWeekStart = newDate;

    // Получаем массив дат для новой недели (от понедельника до воскресенья)
    const weekDates = getWeekDates(newDate);

    updateCalendarHeader(weekDates);

    console.log('Переключились на неделю с', formatDate(weekDates[0]), 'по', formatDate(weekDates[6]));
    checkNavigationLimits();
}

function checkNavigationLimits() {
    const today = new Date();
    const todayMonday = getMonday(today);

    const weeksBackLimit = getMonday(new Date(todayMonday));
    weeksBackLimit.setDate(weeksBackLimit.getDate() - 7);

    const weeksForwardLimit = getMonday(new Date(todayMonday));
    weeksForwardLimit.setDate(weeksForwardLimit.getDate() + (2 * 7));

    const prevBtn = document.querySelector('.prev-week');
    const nextBtn = document.querySelector('.next-week');

    // Блокируем кнопку "назад" если достигли лимита
    if (window.currentWeekStart <= weeksBackLimit) {
        prevBtn.classList.add('disabled');
        prevBtn.disabled = true;
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.disabled = false;
    }

    // Блокируем кнопку "вперед" если достигли лимита
    if (window.currentWeekStart >= weeksForwardLimit) {
        nextBtn.classList.add('disabled');
        nextBtn.disabled = true;
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.disabled = false;
    }

    loadEventsForWeek();
}

// Вспомогательная функция: получить понедельник для любой даты
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

// Вспомогательная функция: получить все дни недели
function getWeekDates(startDate) {
    const monday = getMonday(startDate);
    const week = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(date.getDate() + i);
        week.push(date);
    }

    return week;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Вспомогательная функция: форматирование даты
function formatDate(date) {
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDate4Header(date, date2=undefined) {
    const month = date.toLocaleDateString('ru-RU', {month: 'long'});
    const year = date.getFullYear();

    if (date2 === undefined) {
            // Только одна дата
            return `${capitalizeFirstLetter(month)} ${year}`;
    }
    else {
        const month2 = date2.toLocaleDateString('ru-RU', {month: 'long'});

        return `${capitalizeFirstLetter(month)} - ${capitalizeFirstLetter(month2)} ${year}`;
    }
}

// Функция обновления заголовка календаря
function updateCalendarHeader(weekDates) {
    const dateRangeElement = document.querySelector('.date-range');
    if (dateRangeElement) {
        const start = formatDate(weekDates[0]);
        const end = formatDate(weekDates[6]);
        const start_split = start.split(' ');
        if (start_split[1] !== end.split(' ')[1]) {
            dateRangeElement.textContent = formatDate4Header(weekDates[0], weekDates[6]);
        } else {
            dateRangeElement.textContent = formatDate4Header(weekDates[0]); // заголовок с рейнджом дат
        }
    }

    // Обновляем заголовки дней
    const dayHeaders = document.querySelectorAll('.day-header');
    dayHeaders.forEach((header, index) => {
        const dayNumber = weekDates[index].getDate();
        const monthName = weekDates[index].toLocaleDateString('ru-RU', { month: 'short' });

        // Обновляем дату
        const dateElement = header.querySelector('.day-date');
        if (dateElement) {
            dateElement.textContent = dayNumber;
        }

        // Обновляем data-атрибуты
        const dateStr = weekDates[index].toISOString().split('T')[0]; // YYYY-MM-DD
        header.dataset.date = dateStr;
        header.dataset.fullDate = `${dayNumber}.${weekDates[index].getMonth() + 1}.${weekDates[index].getFullYear()}`;

        // Подсвечиваем сегодняшний день
        const today = new Date();
        if (weekDates[index].toDateString() === today.toDateString()) {
            header.classList.add('today');
        } else {
            header.classList.remove('today');
        }
    });
}

/* Функция загрузки событий для недели
function loadEventsForWeek(startDate, endDate) {
    // Здесь AJAX запрос к серверу
    const tableId = window.currentTableId; // Текущая выбранная таблица
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    fetch(`/api/tables/${tableId}/events?start=${startStr}&end=${endStr}`)
        .then(response => response.json())
        .then(events => {
            renderEvents(events);
        })
        .catch(error => {
            console.error('Ошибка загрузки событий:', error);
        });
}*/

function navigateToToday() {
    window.location.href = '/calendar?date=today';
}

function openEventModal(date, hour) {
    const modal = document.getElementById('eventModal');
    document.getElementById('eventDate').value = date;
    document.getElementById('eventHour').value = hour;
    document.getElementById('eventStartTime').value = `${hour.toString().padStart(2, '0')}:00`;

    modal.style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('eventForm').reset();
}

function saveEvent() {
    const weekDates = getWeekDates(window.currentWeekStart);
    const startStr = weekDates[0].toISOString().split('T')[0]; // понедельник
    const endStr = weekDates[6].toISOString().split('T')[0];
    console.log(startStr + ' - ' + endStr);

    const eventData = {
        date: document.getElementById('eventDate').value,
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        startTime: document.getElementById('eventStartTime').value,
        dateRange: startStr + ' - ' + endStr,
        duration: document.getElementById('eventDuration').value,
        table_id: window.currentTableId,
        color: document.getElementById('eventColor').value,
    };

    // Отправка данных на сервер
    fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeEventModal();
            loadEventsForWeek();
            }
        })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Ошибка сохранения: ' + error.message);
    });

}

function loadEventsForWeek() {
    if (!window.currentTableId) return;

    const weekDates = getWeekDates(window.currentWeekStart);
    const dateRange = weekDates[0].toISOString().split('T')[0] + ' - ' + weekDates[6].toISOString().split('T')[0];
    const meth = 'get-week-events';

    // получение событий
    fetch(`/api/events?id=${window.currentTableId}&method=${meth}&dateRange=${dateRange}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderEvents(data.events);
            } else {
                // console.error('Ошибка загрузки событий: ', data.error); // только 404 так что не надо лог
                renderEvents(null);
            }
        })
        .catch(error => {
            console.error('Ошибка сети:', error);
        });
}

function renderEvents(events) {
    document.querySelectorAll('.add-event-btn').forEach(btn => {
        btn.style.display = 'flex'});

    document.querySelectorAll('.event-card').forEach(card => card.remove());

    if (!events) {
        const temp = document.querySelectorAll('.event-card')
        if (temp) {temp.forEach(card => card.style.display = 'none')}; // backup, but it still doesnt work lol
        return;
    }

    events.forEach(event => {
        const startTime = new Date(event.start_time);
        const eventDate = startTime.toLocaleDateString('sv-SE');
        const eventHour = startTime.getHours();

        // Ищем слот для этого события
        const slot = document.querySelector(
            `.time-slot[data-date="${eventDate}"][data-hour="${eventHour}"]`
        );

        if (slot) {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.style.backgroundColor = event.color || '#4CAF50';
            eventCard.dataset.eventId = event.id;

            // Форматируем время события
            const startStr = startTime.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const endTime = new Date(event.end_time);
            const endStr = endTime.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });

            eventCard.innerHTML = `
                <div class="event-title">${event.title || 'Без названия'}</div>
                <div class="event-time">${startStr} - ${endStr}</div>
            `;

            eventCard.addEventListener('click', function(e) {
                e.stopPropagation();
                // Функция для просмотра деталей события
                alert(`Событие: ${event.title}\nОписание: ${event.description || 'Нет описания'}`);
            });

            slot.appendChild(eventCard);

            // Скрываем кнопку добавления в этом слоте
            const addBtn = slot.querySelector('.add-event-btn');
            if (addBtn) {
                addBtn.style.display = 'none';
            }
        }
    });
}

function highlightCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = now.toISOString().split('T')[0];

    // Отмечаем сегодняшний день
    document.querySelectorAll('.day-header.today').forEach(el => {
        el.classList.remove('today');
    });

    const todayHeader = document.querySelector(
        `.day-header[data-date="${currentDate}"]`
    );

    if (todayHeader) {
        todayHeader.classList.add('today');
    }
}

let ChosenDayIndex = null;

// Функция обновления отображаемой даты
function updateSelectedDate(date, dayName, dayDate) {
    if (dateRangeElement) {
        const formattedDate = formatDate(new Date(date));
        dateRangeElement.textContent = `${dayName}, ${formattedDate}`;
    }
};

   // Подсветка ячеек выбранного дня
   //function highlightDayCells(date) {
   //    const dayColumns = document.querySelectorAll('.day-column');
   //    const selectedIndex = parseInt(ChosenDayIndex);
   //    dayColumns.forEach((column, index) => {
   //        if (index === ChosenDayIndex) {
   //            column.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
   //            column.style.boxShadow = 'inset 0 0 10px rgba(255, 255, 255, 0.1)';
   //            column.classList.add('highlighted');
   //        } else {
   //            column.style.backgroundColor = '';
   //            column.style.boxShadow = '';
   //        }
   //    });
   //}
   // Открытие модального окна для создания события в выбранный день

function openEventModalForDate(date) {
    const modal = document.getElementById('eventModal');
    const dateInput = document.getElementById('eventDate');
    if (modal && dateInput) {
        dateInput.value = date;
        modal.style.display = 'flex';
    }
};

// Вспомогательные функции
function formatDate(date) {
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
document.addEventListener('DOMContentLoaded', function() {
    // Навигация по неделям
    document.querySelector('.prev-week').addEventListener('click', function() {
        navigateWeek(-1);
    });

    document.querySelector('.next-week').addEventListener('click', function() {
        navigateWeek(1);
    });

    document.querySelector('.btn-today').addEventListener('click', function() {
        navigateToToday();
    });

    // Открытие модального окна
    document.querySelectorAll('.add-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const date = this.dataset.date;
            const hour = this.dataset.hour;
            openEventModal(date, hour);
        });
    });

    // Закрытие модального окна
    document.querySelector('.btn-cancel').addEventListener('click', closeEventModal);
    document.querySelector('.modal').addEventListener('click', function(e) {
        if (e.target === this) closeEventModal();
    });

    // Сохранение события
    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
    });

    // Отметка текущего времени
    highlightCurrentTime();
    setInterval(highlightCurrentTime, 60000); // Обновлять каждую минуту
});

function navigateWeek(direction) {
    // Здесь будет логика переключения недель
    console.log('Navigate week:', direction);
}

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
    const eventData = {
        date: document.getElementById('eventDate').value,
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        startTime: document.getElementById('eventStartTime').value,
        duration: document.getElementById('eventDuration').value,
        color: document.getElementById('eventColor').value
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
            location.reload(); // Перезагрузить страницу для отображения события
        }
    });
}

function highlightCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = now.toISOString().split('T')[0];

    // Убираем предыдущую подсветку
    document.querySelectorAll('.time-slot.current-time').forEach(el => {
        el.classList.remove('current-time');
    });

    // Находим текущий таймслот
    const currentSlot = document.querySelector(
        `.time-slot[data-date="${currentDate}"][data-hour="${currentHour}"]`
    );

    if (currentSlot) {
        currentSlot.classList.add('current-time');
    }

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
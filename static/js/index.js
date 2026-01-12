document.addEventListener('DOMContentLoaded', function() {
    const userId = getCurrentUserId();

    const tableSquares = document.querySelectorAll('.table-card');
    tableSquares.forEach(square => {
        square.addEventListener('click', function() {
            const id = square.dataset.tableId
            window.location.href = `/calendar/${id}`;
        });

    });

    const createBtn = document.querySelector('.btn-create-table');
    if (createBtn) {
        createBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openTableModal();
        });
    }

    // Закрытие модалки по кнопке oтмена и клику вне окна
    const cancelBtn = document.querySelector('#tableModal .btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeTableModal);
    }
    const modal = document.getElementById('tableModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeTableModal();
            }
        });
    }
    document.addEventListener('keydown', function(e) {  // закрытие по клавише ESC
        if (e.key === 'Escape') {
            closeTableModal();
        }
    });

    const form = document.getElementById('tableForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            createTable();
        });
    }
});

// Открытие модального окна
function openTableModal() {
    const modal = document.getElementById('tableModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('tableForm').reset();
        document.getElementById('tableTitle').focus();
    }
}

// Закрытие модального окна
function closeTableModal() {
    const modal = document.getElementById('tableModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Функция создания таблицы
function createTable() {

    const formData = {
        title: document.getElementById('tableTitle').value.trim(),
        description: document.getElementById('tableDescription').value.trim(), // У тебя eventDescription, а не tableDescription!
        is_private: document.getElementById('privacyToggle').checked
    };

    // Валидация
    if (!formData.title) {
        document.getElementById('tableTitle').focus();
        return;
    }

    // Отправка на сервер
    fetch('/api/tables', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {

        // console.log('Статус ответа:', response.status);
        if (!response.ok) {
            location.reload()
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            closeTableModal();

            // Перенаправляем в календарь новой таблицы
            window.location.href = `/calendar/${data.table_id}`;

        } else {
            console.error('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'));
        }
    })
    .catch(error => {
        console.error('Ошибка запроса:', error);
    });
}

function getCurrentUserId() {
    return window.current_user_id || localStorage.getItem('user_id');

    // Или из data-атрибута:
    // const userElement = document.querySelector('[data-user-id]');
    // return userElement ? userElement.dataset.userId : null;
}
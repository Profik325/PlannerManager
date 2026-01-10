function moveSun(position) {
    const authContainer = document.querySelector('.auth.nav-links');
    authContainer.classList.remove('sun-top', 'sun-bottom');
    authContainer.classList.add(`sun-${position}`);
}

// На главной странице
function openCalendar(tableId) {
    // Переходим на страницу календаря с параметром
    // window.location.href = `/calendar?table_id=${tableId}`;
    // или
    window.location.href = `/calendar/${tableId}`;
}
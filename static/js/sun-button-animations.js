document.addEventListener('DOMContentLoaded', function() {
    const authContainer = document.querySelector('.auth.nav-links');
    const loginBtn = document.getElementById('loginBtn');
    const regBtn = document.getElementById('regBtn');

    // Для hover эффектов
    loginBtn.addEventListener('mouseenter', function() {
        authContainer.classList.remove('sun-bottom');
        authContainer.classList.add('sun-top');
    });

    regBtn.addEventListener('mouseenter', function() {
        authContainer.classList.remove('sun-top');
        authContainer.classList.add('sun-bottom');
    });

    authContainer.addEventListener('mouseleave', function() {
        authContainer.classList.remove('sun-top', 'sun-bottom');
    });

    // Функция для анимации нажатия с задержкой перехода
    function handleButtonClick(event, activeBtn, oppositeBtn) {
        // Отменяем стандартное поведение (мгновенный переход)
        event.preventDefault();

        // Запускаем анимацию
        activeBtn.classList.add('button-active');
        oppositeBtn.classList.add('button-dark');
        authContainer.classList.add('sun-hide');

        // Ждем завершения анимации и затем переходим по ссылке
        setTimeout(function() {
            window.location.href = activeBtn.href;
        }, 300); // Время должно совпадать с длительностью анимации
    }

    // Обработчики для кнопки "Войти"
    loginBtn.addEventListener('click', function(event) {
        handleButtonClick(event, loginBtn, regBtn);
    });

    // Обработчики для кнопки "Зарегистрироваться"
    regBtn.addEventListener('click', function(event) {
        handleButtonClick(event, regBtn, loginBtn);
    });

    // Обработчики отпускания кнопки (на случай отмены)
    loginBtn.addEventListener('mouseup', function() {
        loginBtn.classList.remove('button-active');
        regBtn.classList.remove('button-dark');
        authContainer.classList.remove('sun-hide');
    });

    regBtn.addEventListener('mouseup', function() {
        regBtn.classList.remove('button-active');
        loginBtn.classList.remove('button-dark');
        authContainer.classList.remove('sun-hide');
    });

    loginBtn.addEventListener('mouseleave', function() {
        loginBtn.classList.remove('button-active');
        regBtn.classList.remove('button-dark');
        authContainer.classList.remove('sun-hide');
    });

    regBtn.addEventListener('mouseleave', function() {
        regBtn.classList.remove('button-active');
        loginBtn.classList.remove('button-dark');
        authContainer.classList.remove('sun-hide');
    });
});
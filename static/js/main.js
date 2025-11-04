function moveSun(position) {
    const authContainer = document.querySelector('.auth.nav-links');
    authContainer.classList.remove('sun-top', 'sun-bottom');
    authContainer.classList.add(`sun-${position}`);
}
// theme-switcher.js
class ThemeSwitcher {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        this.themeToggle.checked = savedTheme === 'dark';

        this.themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            this.setTheme(theme);
            this.saveTheme(theme);

            // Отправляем кастомное событие
            this.dispatchThemeChange(theme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
});
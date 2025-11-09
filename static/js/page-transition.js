class PageTransition {
    constructor() {
        this.transitionElement = document.getElementById('page-transition');
        this.isTransitioning = false;
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.shouldInterceptClick(link)) {
                e.preventDefault();

                // Получаем позицию клика для круговой заливки
                const rect = link.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                this.startTransition(link.href, centerX, centerY);
            }
        });
    }

    shouldInterceptClick(link) {
        return link.href &&
               !link.href.includes('javascript:') &&
               link.target !== '_blank' &&
               !link.hasAttribute('download') &&
               link.href.startsWith(window.location.origin);
    }

    startTransition(url, centerX, centerY) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Скрываем пассивные листья
        this.hideBackgroundElements();

        // Создаем элемент для заливки
        this.createFillElement(centerX, centerY);

        // Запускаем анимацию заливки
        setTimeout(() => {
            this.animateFill(() => {
                // Переход после завершения заливки
                setTimeout(() => {
                    window.location.href = url;
                }, 200);
            });
        }, 300);
    }

    hideBackgroundElements() {
        const passiveLeaves = document.querySelectorAll('#leaves-container .leaf');
        passiveLeaves.forEach(leaf => {
            leaf.style.display = 'none';
        });
    }

    createFillElement(centerX, centerY) {
        // Создаем элемент заливки
        const fillElement = document.createElement('div');
        fillElement.className = 'color-fill';

        // Позиционируем в центре клика
        fillElement.style.position = 'fixed';
        fillElement.style.left = `${centerX}px`;
        fillElement.style.top = `${centerY}px`;
        fillElement.style.transform = 'translate(-50%, -50%)';
        fillElement.style.width = '0px';
        fillElement.style.height = '0px';
        fillElement.style.borderRadius = '50%';
        fillElement.style.background = this.getFillColor();
        fillElement.style.zIndex = '10001';
        fillElement.style.transition = 'all 0.8s ease-out';

        this.transitionElement.appendChild(fillElement);
        this.fillElement = fillElement;

        // Показываем overlay
        this.transitionElement.classList.add('active');
    }

    animateFill(callback) {
        if (!this.fillElement) return;

        // Рассчитываем размер для заполнения всего экрана
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const maxDimension = Math.max(screenWidth, screenHeight) * 1.5; // С запасом

        // Анимируем увеличение круга
        requestAnimationFrame(() => {
            this.fillElement.style.width = `${maxDimension}px`;
            this.fillElement.style.height = `${maxDimension}px`;

            // Вызываем callback после завершения анимации
            setTimeout(callback, 800);
        });
    }

    getFillColor() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        if (currentTheme === 'light') {
            return 'linear-gradient(135deg, #8B00FF, #FF0066)';
        } else {
            return 'linear-gradient(135deg, #FF4500, #FFD700)';
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new PageTransition();
});
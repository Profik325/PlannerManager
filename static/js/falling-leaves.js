// falling-leaves.js
class LeavesAnimation {
    constructor() {
        this.container = document.getElementById('leaves-container');
        this.leaves = [];
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.maxLeaves = 20; // Максимальное количество листьев
        this.leavesPerSecond = 1; // Листьев в секунду
        this.creationInterval = null;
        this.init();
    }

    init() {
        this.startAnimation();
        this.setupThemeListener();
    }

    setupThemeListener() {
        // Следим за изменениями темы
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme');
                    this.onThemeChange(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    onThemeChange(newTheme) {
        console.log(`🎨 Theme changed to: ${newTheme}`);

        // Анимация сдувания текущих листьев
        this.blowAwayLeaves();

        // Меняем тему листьев
        this.currentTheme = newTheme;

        // Перезапускаем анимацию через 1 секунду
        setTimeout(() => {
            this.restartAnimation();
        }, 1000);
    }

    blowAwayLeaves() {
        this.leaves.forEach(leaf => {
            // Случайное направление сдувания
            const direction = Math.random() > 0.5 ? 1 : -1;
            const blowDistance = 100 + Math.random() * 200;

            leaf.style.animation = 'none';
            leaf.style.transition = 'all 0.8s ease-out';
            leaf.style.transform = `translateX(${direction * blowDistance}px) translateY(-100px) rotate(${direction * 360}deg)`;
            leaf.style.opacity = '0';

            // Удаляем после анимации
            setTimeout(() => {
                if (leaf.parentNode) {
                    leaf.remove();
                }
            }, 800);
        });

        this.leaves = [];
    }

    getLeafColors() {
        if (this.currentTheme === 'light') {
            // Светлая тема - фиолетово-красные листья
            return [
                ['#8B00FF', '#FF0066'], // Фиолетовый -> Ярко-красный
                ['#6A0DAD', '#FF1493'], // Темно-фиолетовый -> Глубокий розовый
                ['#4B0082', '#DC143C'], // Индиго -> Малиновый
                ['#9400D3', '#FF69B4'], // Фиолетовый -> Горячий розовый
                ['#8A2BE2', '#FF4500'], // Сине-фиолетовый -> Красно-оранжевый
                ['#9932CC', '#FF6347']  // Темно-орхидея -> Томатный
            ];
        } else {
            // Темная тема - красно-желтые и оранжевые листья
            return [
                ['#FF4500', '#FFD700'], // Красно-оранжевый -> Золотой
                ['#FF6347', '#FFA500'], // Томатный -> Оранжевый
                ['#DC143C', '#FF8C00'], // Малиновый -> Темно-оранжевый
                ['#FF0000', '#FFD700'], // Красный -> Золотой
                ['#FF8C00', '#FFEC8B'], // Темно-оранжевый -> Светло-золотой
                ['#FF69B4', '#FFA500']  // Горячий розовый -> Оранжевый
            ];
        }
    }

    createLeaf() {
        // Проверяем, не превышен ли лимит листьев
        if (this.leaves.length >= this.maxLeaves) {
            return;
        }

        const leaf = document.createElement('div');
        const type = Math.floor(Math.random() * 6);
        const colors = this.getLeafColors();
        const [color1, color2] = colors[type];

        leaf.className = `leaf type${type + 1}`;

        // Динамически устанавливаем градиент
        leaf.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;

        // Случайная позиция по горизонтали
        const left = Math.random() * 100;

        // Анимация - 10-18 секунд, гарантируем что лист долетит до конца
        const duration = 12 + Math.random() * 6; // 12-18 секунд
        const delay = Math.random() * 2;

        leaf.style.left = `${left}vw`;

        // Случайный размер
        const scale = 0.5 + Math.random() * 0.7;
        leaf.style.transform = `scale(${scale})`;

        this.container.appendChild(leaf);
        this.leaves.push(leaf);

        // Устанавливаем анимацию после добавления в DOM
        setTimeout(() => {
            leaf.style.animation = `falling-leaf ${duration}s linear ${delay}s forwards`;
        }, 10);

        // Удаляем после завершения анимации
        setTimeout(() => {
            if (leaf.parentNode) {
                leaf.remove();
                this.leaves = this.leaves.filter(l => l !== leaf);
            }
        }, (duration + delay) * 1000);
    }

    startAnimation() {
        // Начинаем с нескольких листьев
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.createLeaf(), i * 500);
        }

        // Постоянно добавляем новые листья с ограничением
        this.creationInterval = setInterval(() => {
            if (this.leaves.length < this.maxLeaves) {
                this.createLeaf();
            }
        }, 1000 / this.leavesPerSecond); // Интервал для контроля количества в секунду
    }

    restartAnimation() {
        // Останавливаем текущую анимацию
        if (this.creationInterval) {
            clearInterval(this.creationInterval);
        }

        // Запускаем заново
        this.startAnimation();
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    new LeavesAnimation();
});
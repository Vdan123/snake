import { Game } from './core/Game.js';

let game = null;

window.onload = () => {
    // 计算适合的游戏区域大小
    const margin = 100; // 留出边距
    const maxWidth = window.innerWidth - margin;
    const maxHeight = window.innerHeight - margin;
    
    // 确保宽度和高度是网格大小的整数倍
    const gridSize = 20;
    const width = Math.floor(maxWidth / gridSize) * gridSize;
    const height = Math.floor(maxHeight / gridSize) * gridSize;
    
    // 默认速度设为10
    const defaultSpeed = 10;
    
    const config = {
        width,
        height,
        initialSnakeLength: 3,
        speed: 20,
        gridSize: 20,
        fps: defaultSpeed
    };
    
    // 创建速度控制UI
    createSpeedControls(defaultSpeed);
    
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
        if (game) {
            // 清理旧游戏
            game.destroy();
            game = null;
            
            // 重置分数显示
            document.getElementById('score').textContent = '分数: 0';
        }
        
        // 创建新游戏
        game = new Game(config);
        game.start();
        startButton.textContent = '重新开始';
    });
    
    // 添加速度控制事件监听
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        if (game) {
            game.setSpeed(speed);
        } else {
            config.fps = speed;
            document.getElementById('speedDisplay').textContent = `速度: ${speed}`;
        }
    });
};

// 创建速度控制UI
function createSpeedControls(defaultSpeed) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex items-center space-x-2 mt-2';
    
    // 速度显示
    const speedDisplay = document.createElement('div');
    speedDisplay.id = 'speedDisplay';
    speedDisplay.className = 'text-sm font-medium';
    speedDisplay.textContent = `速度: ${defaultSpeed}`;
    
    // 速度滑块
    const speedSlider = document.createElement('input');
    speedSlider.id = 'speedSlider';
    speedSlider.type = 'range';
    speedSlider.min = '3';
    speedSlider.max = '30';
    speedSlider.value = defaultSpeed;
    speedSlider.className = 'w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer';
    
    // 添加到控制区域
    controlsContainer.appendChild(speedDisplay);
    controlsContainer.appendChild(speedSlider);
    
    // 找到控制区域并添加速度控制
    const controlsArea = document.querySelector('.controls') || document.body;
    controlsArea.appendChild(controlsContainer);
} 
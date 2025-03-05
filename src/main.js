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
    
    const config = {
        width,
        height,
        initialSnakeLength: 3,
        speed: 20,
        gridSize: 20,
        fps: 10
    };
    
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
}; 
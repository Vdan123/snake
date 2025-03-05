import * as PIXI from 'pixi.js';
import { Snake } from './Snake.js';
import { Food } from '../items/Food.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { Renderer } from '../graphics/Renderer.js';
import Matter from 'matter-js';

export class Game {
    constructor(config) {
        this.config = config;
        this.snake = null;
        this.food = null;
        this.physicsWorld = null;
        this.renderer = null;
        this.gameState = {
            score: 0,
            isGameOver: false,
            isPaused: false
        };
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / config.fps; // 控制更新频率
        
        this.init();
    }
    
    init() {
        // 初始化 PIXI 应用
        this.app = new PIXI.Application({
            width: this.config.width,
            height: this.config.height,
            backgroundColor: 0xffffff,
            view: document.getElementById('gameCanvas')
        });
        
        // 初始化游戏元素，传递配置对象
        this.snake = new Snake(this.config);
        this.food = new Food(this.config);
        
        // 初始化物理引擎
        this.physicsWorld = new PhysicsWorld(this.config);
        
        // 将食物添加到物理世界
        this.physicsWorld.addBody(this.food.body);
        
        // 初始化渲染器
        this.renderer = new Renderer(this.app);
        
        // 设置键盘控制
        this.setupControls();
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (this.gameState.isGameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.snake.setDirection('up');
                    break;
                case 'ArrowDown':
                    this.snake.setDirection('down');
                    break;
                case 'ArrowLeft':
                    this.snake.setDirection('left');
                    break;
                case 'ArrowRight':
                    this.snake.setDirection('right');
                    break;
                case ' ':
                    this.gameState.isPaused = !this.gameState.isPaused;
                    break;
            }
        });
    }
    
    checkCollisions() {
        const head = this.snake.segments[0];
        
        // 检查是否吃到食物（使用更宽松的碰撞检测）
        const dx = head.x - this.food.position.x;
        const dy = head.y - this.food.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.gridSize) {
            this.gameState.score += 10;
            document.getElementById('score').textContent = `分数: ${this.gameState.score}`;
            this.snake.grow();
            
            // 从物理世界移除旧食物
            this.physicsWorld.removeBody(this.food.body);
            this.food.respawn();
            // 添加新食物到物理世界
            this.physicsWorld.addBody(this.food.body);
        }
        
        // 检查是否撞到自己
        for (let i = 1; i < this.snake.segments.length; i++) {
            if (this.isColliding(head, this.snake.segments[i])) {
                this.gameOver();
                return;
            }
        }
        
        // 检查是否撞到边界
        if (head.x < 0 || head.x >= this.config.width ||
            head.y < 0 || head.y >= this.config.height) {
            this.gameOver();
        }
    }
    
    isColliding(pos1, pos2) {
        // 使用严格相等进行网格位置比较
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    
    destroy() {
        // 停止游戏循环
        this.gameState.isGameOver = true;
        
        // 清理物理引擎
        if (this.physicsWorld) {
            Matter.World.clear(this.physicsWorld.engine.world);
            Matter.Engine.clear(this.physicsWorld.engine);
            this.physicsWorld = null;
        }
        
        // 清理渲染器
        if (this.renderer) {
            this.renderer.destroy();
            this.renderer = null;
        }
        
        // 清理 PIXI 应用
        if (this.app) {
            this.app.destroy(true, {
                children: true,
                texture: true,
                baseTexture: true
            });
            this.app = null;
        }
        
        // 清理其他引用
        this.snake = null;
        this.food = null;
    }
    
    gameOver() {
        this.gameState.isGameOver = true;
        const startButton = document.getElementById('startButton');
        startButton.textContent = '重新开始';
    }
    
    update() {
        if (this.gameState.isGameOver || this.gameState.isPaused) return;
        
        this.snake.update();
        this.physicsWorld.update();
        this.food.update();  // 更新食物位置
        this.checkCollisions();
    }
    
    render() {
        if (!this.renderer || !this.app) return;  // 添加检查
        this.renderer.clear();
        this.renderer.renderSnake(this.snake);
        this.renderer.renderFood(this.food);
    }
    
    gameLoop = (currentTime) => {
        if (this.gameState.isGameOver) return;  // 如果游戏结束，停止循环
        
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.timeStep) {
            this.update();
            this.accumulator -= this.timeStep;
        }
        
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
    
    start() {
        this.lastTime = 0;
        this.accumulator = 0;
        requestAnimationFrame(this.gameLoop);
    }
} 
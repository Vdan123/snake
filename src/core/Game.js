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
        
        // 设置暂停按钮
        this.setupPauseButton();
        
        // 初始化语音识别
        this.recognition = null;
        this.setupSpeechRecognition();
    }
    
    setupPauseButton() {
        const pauseButton = document.getElementById('pauseButton');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                if (!this.gameState.isGameOver) {
                    this.gameState.isPaused = !this.gameState.isPaused;
                    pauseButton.textContent = this.gameState.isPaused ? '继续' : '暂停';
                }
            });
        }
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
                // 添加数字键1-9调节速度
                case '1': case '2': case '3': case '4': case '5': 
                case '6': case '7': case '8': case '9':
                    const speed = parseInt(e.key) * 3; // 速度范围3-27
                    this.setSpeed(speed);
                    break;
            }
        });
    }
    
    setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('浏览器不支持语音识别');
            return;
        }
        
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false;  // 改为非连续模式
        this.recognition.interimResults = false;  // 关闭中间结果
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 5;  // 增加备选结果数量
        
        // 添加旋转状态变量
        this.rotationActive = false;
        this.rotationDirection = 'clockwise'; // 'clockwise' 或 'counterclockwise'
        this.rotationTimer = null;
        
        this.recognition.onresult = (event) => {
            const results = event.results[0];
            let commandFound = false;
            
            // 检查所有可能的结果
            for (let i = 0; i < results.length && !commandFound; i++) {
                const command = results[i].transcript.trim().toLowerCase();
                console.log(`识别结果 ${i+1}:`, command, `(置信度: ${results[i].confidence.toFixed(2)})`);
                
                // 检测包含字母"o"的输入 - 顺时针旋转
                if (command.includes('o')) {
                    this.rotationDirection = 'clockwise';
                    this.startRotation();
                    console.log('识别到"o"，开始顺时针旋转');
                    commandFound = true;
                } 
                // 检测包含字母"e"的输入 - 逆时针旋转
                else if (command.includes('e')) {
                    this.rotationDirection = 'counterclockwise';
                    this.startRotation();
                    console.log('识别到"e"，开始逆时针旋转');
                    commandFound = true;
                }
                // 检测包含字母"s"的输入 - 停止旋转
                else if (command.includes('s')) {
                    this.stopRotation();
                    console.log('识别到"s"，停止旋转');
                    commandFound = true;
                }
                // 检测包含字母"i"的输入 - 加速
                else if (command.includes('i')) {
                    const newSpeed = Math.min(30, this.config.fps + 3);
                    this.setSpeed(newSpeed);
                    console.log('识别到"i"，执行加速命令');
                    commandFound = true;
                }
                // 检测包含字母"d"的输入 - 减速
                else if (command.includes('d')) {
                    const newSpeed = Math.max(3, this.config.fps - 3);
                    this.setSpeed(newSpeed);
                    console.log('识别到"d"，执行减速命令');
                    commandFound = true;
                }
                // 暂停/继续游戏
                else if (command.includes('p')) {
                    this.gameState.isPaused = !this.gameState.isPaused;
                    console.log(`识别到"p"，${this.gameState.isPaused ? '暂停' : '继续'}游戏`);
                    commandFound = true;
                }
            }
            
            // 立即重启识别
            setTimeout(() => {
                try {
                    this.recognition.start();
                } catch (e) {
                    console.error('重启语音识别失败:', e);
                }
            }, 100);
        };
        
        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            // 错误后尝试重启
            setTimeout(() => {
                try {
                    this.recognition.start();
                } catch (e) {
                    console.error('重启语音识别失败:', e);
                }
            }, 1000);
        };
        
        // 自动重启语音识别
        this.recognition.onend = () => {
            if (!this.gameState.isGameOver) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.error('重启语音识别失败:', e);
                    }
                }, 100);  // 减少延迟
            }
        };
    }
    
    // 添加设置速度的方法
    setSpeed(speed) {
        this.config.fps = speed;
        this.timeStep = 1000 / speed;
        
        // 更新速度显示
        const speedDisplay = document.getElementById('speedDisplay');
        if (speedDisplay) {
            speedDisplay.textContent = `速度: ${speed}`;
        }
    }
    
    checkCollisions() {
        const head = this.snake.segments[0];
        
        // 检查是否吃到食物
        const dx = head.x - this.food.position.x;
        const dy = head.y - this.food.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.gridSize) {
            if (this.food.type === '💣') {
                // 炸弹效果
                this.renderer.createExplosion(this.food.position.x, this.food.position.y, 'bomb');
                this.snake.shrink();
                this.renderer.createRainingPoop();  // 创建满屏幕掉落的粑粑
            } else {
                // 普通食物效果
                this.renderer.createExplosion(this.food.position.x, this.food.position.y, 'small');
                this.gameState.score += 10;
                this.snake.grow();
            }
            
            document.getElementById('score').textContent = `分数: ${this.gameState.score}`;
            
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
            // 在蛇头位置创建大爆炸
            this.snake.segments.forEach((segment, index) => {
                setTimeout(() => {
                    this.renderer.createExplosion(segment.x, segment.y, 'big');
                }, index * 50); // 延迟爆炸，创造连锁效果
            });
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameState.isGameOver = true;
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.textContent = '重新开始';
        }
    }
    
    isColliding(pos1, pos2) {
        // 使用严格相等进行网格位置比较
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    
    update() {
        if (this.gameState.isGameOver || this.gameState.isPaused) return;
        
        this.snake.update();
        this.snake.updateBlinking();  // 更新闪烁状态
        this.physicsWorld.update();
        this.food.update();
        this.checkCollisions();
    }
    
    render() {
        if (!this.renderer || !this.app) return;
        this.renderer.clear();
        this.renderer.renderSnake(this.snake);
        this.renderer.renderFood(this.food);
        this.renderer.render();  // 更新粒子效果
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
        
        // 启动语音识别
        if (this.recognition) {
            try {
                this.recognition.start();
                console.log('语音识别已启动');
            } catch (e) {
                console.error('启动语音识别失败:', e);
            }
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    destroy() {
        // 停止游戏循环
        this.gameState.isGameOver = true;
        
        // 停止旋转
        this.stopRotation();
        
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
        
        // 停止语音识别
        if (this.recognition) {
            try {
                this.recognition.stop();
                this.recognition = null;
                console.log('语音识别已停止');
            } catch (e) {
                console.error('停止语音识别失败:', e);
            }
        }
    }
    
    // 添加控制旋转的方法
    toggleRotation() {
        if (this.rotationActive) {
            // 如果已经在旋转，则停止
            this.stopRotation();
        } else {
            // 如果没有旋转，则开始旋转
            this.startRotation();
        }
    }
    
    startRotation() {
        if (this.rotationActive) return;
        
        this.rotationActive = true;
        console.log(`开始${this.rotationDirection === 'clockwise' ? '顺时针' : '逆时针'}旋转`);
        
        // 设置旋转定时器
        this.rotationTimer = setInterval(() => {
            if (this.gameState.isPaused || this.gameState.isGameOver) return;
            
            const directions = ['up', 'right', 'down', 'left'];
            const currentIndex = directions.indexOf(this.snake.direction);
            
            let nextIndex;
            if (this.rotationDirection === 'clockwise') {
                // 顺时针旋转: up -> right -> down -> left -> up
                nextIndex = (currentIndex + 1) % 4;
            } else {
                // 逆时针旋转: up -> left -> down -> right -> up
                nextIndex = (currentIndex - 1 + 4) % 4;
            }
            
            this.snake.setDirection(directions[nextIndex]);
        }, 500); // 每500毫秒改变一次方向
    }
    
    stopRotation() {
        if (!this.rotationActive) return;
        
        this.rotationActive = false;
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        }
        console.log('停止旋转');
    }
}
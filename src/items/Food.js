import * as Matter from 'matter-js';

export class Food {
    constructor(config) {
        this.config = config;
        this.size = config.gridSize; // 使用网格大小
        this.position = this.getRandomPosition();
        this.type = '💩';  // 使用粑粑 emoji
        
        // 创建物理体
        this.body = Matter.Bodies.circle(
            this.position.x + this.size/2,
            this.position.y + this.size/2,
            this.size/2,
            {
                restitution: 0.6,  // 弹性
                friction: 0.005,    // 摩擦力
                density: 0.001,     // 密度
                label: 'food'       // 标签，用于碰撞检测
            }
        );
    }

    getRandomPosition() {
        // 保持一定边距，确保食物完全可见
        const margin = this.size;
        const cols = Math.floor((this.config.width - 2 * margin) / this.size);
        const rows = Math.floor((this.config.height - 2 * margin) / this.size);
        
        // 确保食物位置对齐网格
        return {
            x: margin + Math.floor(Math.random() * cols) * this.size,
            y: margin + Math.floor(Math.random() * rows) * this.size
        };
    }

    respawn() {
        const newPos = this.getRandomPosition();
        this.position = newPos;
        
        // 更新物理体位置
        Matter.Body.setPosition(this.body, {
            x: newPos.x + this.size/2,
            y: newPos.y + this.size/2
        });
        
        // 给食物一个随机的初始速度
        Matter.Body.setVelocity(this.body, {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5
        });
    }

    update() {
        // 更新位置以匹配物理引擎
        this.position.x = this.body.position.x - this.size/2;
        this.position.y = this.body.position.y - this.size/2;
    }
} 
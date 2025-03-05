import * as PIXI from 'pixi.js';

export class Renderer {
    constructor(app) {
        this.app = app;
        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
        
        // 创建文本样式
        this.foodStyle = new PIXI.TextStyle({
            fontSize: 52,
            align: 'center',
            fill: '#8B4513'  // 添加棕色
        });
        
        this.isDestroyed = false;
        this.particles = [];  // 添加粒子数组
    }
    
    clear() {
        if (this.isDestroyed) return;  // 如果已销毁则直接返回
        
        if (this.graphics) {
            this.graphics.clear();
        }
        
        // 清理除了 graphics 之外的所有子元素
        while(this.app.stage.children.length > 1) {
            this.app.stage.removeChildAt(1);
        }
    }
    
    createRainingPoop() {
        for (let i = 0; i < 20; i++) {
            const poop = new PIXI.Text('💩', this.foodStyle);
            poop.x = Math.random() * this.app.screen.width;
            poop.y = -50;
            poop.velocity = 2 + Math.random() * 3;
            this.app.stage.addChild(poop);
            this.particles.push({
                sprite: poop,
                life: 1,
                type: 'poop'
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (particle.type === 'poop') {
                particle.sprite.y += particle.sprite.velocity;
                if (particle.sprite.y > this.app.screen.height) {
                    this.app.stage.removeChild(particle.sprite);
                    this.particles.splice(i, 1);
                }
            } else {
                particle.sprite.x += particle.sprite.velocity.x;
                particle.sprite.y += particle.sprite.velocity.y;
                particle.life -= particle.type === 'small' ? 0.02 : 0.01;
                particle.sprite.alpha = particle.life;
                
                if (particle.type === 'big') {
                    particle.sprite.scale.set(particle.life * 0.5 + 0.5);
                }
                
                if (particle.life <= 0) {
                    this.app.stage.removeChild(particle.sprite);
                    this.particles.splice(i, 1);
                }
            }
        }
    }
    
    renderSnake(snake) {
        if (this.isDestroyed) return;
        
        snake.segments.forEach((segment, index) => {
            if (snake.isBlinking && snake.blinkCount % 2 === 0) {
                return; // 闪烁效果：跳过渲染
            }
            
            if (index === 0) {
                this.graphics.beginFill(0x22c55e);
            } else {
                this.graphics.beginFill(0x4ade80);
            }
            this.graphics.drawRoundedRect(segment.x, segment.y, 18, 18, 4);
            this.graphics.endFill();
        });
    }
    
    renderFood(food) {
        if (this.isDestroyed) return;  // 如果已销毁则直接返回
        
        // 创建 emoji 文本
        const emoji = new PIXI.Text(food.type, this.foodStyle);
        emoji.x = food.position.x;
        emoji.y = food.position.y;
        emoji.anchor.set(0.5);
        
        // 根据物理引擎的旋转角度旋转 emoji
        emoji.rotation = food.body.angle;
        
        this.app.stage.addChild(emoji);
    }
    
    createExplosion(x, y, type = 'small') {
        const particleCount = type === 'small' ? 20 : 100;
        const particleSize = type === 'small' ? 3 : 4;
        const maxSpeed = type === 'small' ? 4 : 8;
        const color = type === 'small' ? 0x8B4513 : 0x4ade80;

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(color);
            particle.drawCircle(0, 0, particleSize);
            particle.endFill();
            particle.x = x;
            particle.y = y;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * maxSpeed) + 2;
            particle.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            particle.alpha = 1;
            particle.scale.set(1);
            
            this.app.stage.addChild(particle);
            this.particles.push({
                sprite: particle,
                life: 1,
                type
            });
        }
    }

    render() {
        if (this.isDestroyed) return;
        this.updateParticles();
    }
    
    destroy() {
        this.isDestroyed = true;
        this.clear();
        
        // 清理所有粒子
        this.particles.forEach(particle => {
            this.app.stage.removeChild(particle.sprite);
        });
        this.particles = [];
        
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
        
        if (this.foodStyle) {
            this.foodStyle = null;
        }
    }
}

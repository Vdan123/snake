import * as PIXI from 'pixi.js';

export class Renderer {
    constructor(app) {
        this.app = app;
        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
        
        // 创建文本样式
        this.foodStyle = new PIXI.TextStyle({
            fontSize: 20,
            align: 'center'
        });
        
        this.isDestroyed = false;  // 添加标志
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
    
    renderSnake(snake) {
        if (this.isDestroyed) return;  // 如果已销毁则直接返回
        
        snake.segments.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头使用深绿色
                this.graphics.beginFill(0x22c55e);
            } else {
                // 蛇身使用浅绿色
                this.graphics.beginFill(0x4ade80);
            }
            // 增加圆角效果
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
    
    destroy() {
        this.isDestroyed = true;  // 设置销毁标志
        this.clear();
        
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;  // 清除引用
        }
        
        if (this.foodStyle) {
            this.foodStyle = null;
        }
    }
}

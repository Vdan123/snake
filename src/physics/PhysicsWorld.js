import * as Matter from 'matter-js';

export class PhysicsWorld {
    constructor(config) {
        this.engine = Matter.Engine.create({
            enableSleeping: false
        });
        
        // 创建边界墙
        const walls = [
            Matter.Bodies.rectangle(config.width/2, -10, config.width, 20, { isStatic: true }), // 上
            Matter.Bodies.rectangle(config.width/2, config.height+10, config.width, 20, { isStatic: true }), // 下
            Matter.Bodies.rectangle(-10, config.height/2, 20, config.height, { isStatic: true }), // 左
            Matter.Bodies.rectangle(config.width+10, config.height/2, 20, config.height, { isStatic: true }) // 右
        ];
        
        Matter.World.add(this.engine.world, walls);
    }
    
    addBody(body) {
        Matter.World.add(this.engine.world, body);
    }
    
    removeBody(body) {
        Matter.World.remove(this.engine.world, body);
    }
    
    update() {
        Matter.Engine.update(this.engine, 1000/60);
    }

    destroy() {
        Matter.World.clear(this.engine.world);
        Matter.Engine.clear(this.engine);
    }
}

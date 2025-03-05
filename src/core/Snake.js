export class Snake {
    constructor(config) {
        this.config = config;  // 保存配置对象
        this.segments = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gridSize = config.gridSize;
        
        this.init(config.initialSnakeLength);
        this.moveTimer = 0;
    }
    
    init(length) {
        // 使用保存的 config 对象
        const startX = Math.floor(this.config.width / 2);
        const startY = Math.floor(this.config.height / 2);
        
        // 确保蛇的初始位置对齐网格
        const gridX = Math.floor(startX / this.gridSize) * this.gridSize;
        const gridY = Math.floor(startY / this.gridSize) * this.gridSize;
        
        for (let i = 0; i < length; i++) {
            this.segments.push({
                x: gridX - (i * this.gridSize),
                y: gridY
            });
        }
    }
    
    setDirection(direction) {
        // 防止直接反向
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        if (opposites[direction] !== this.direction) {
            this.nextDirection = direction;
        }
    }
    
    grow() {
        // 在尾部添加新段
        const tail = this.segments[this.segments.length - 1];
        this.segments.push({ ...tail });
    }
    
    update() {
        // 更新方向
        this.direction = this.nextDirection;
        
        // 移动蛇
        const head = { ...this.segments[0] };
        
        // 按网格移动
        switch (this.direction) {
            case 'up':
                head.y -= this.gridSize;
                break;
            case 'down':
                head.y += this.gridSize;
                break;
            case 'left':
                head.x -= this.gridSize;
                break;
            case 'right':
                head.x += this.gridSize;
                break;
        }
        
        this.segments.unshift(head);
        this.segments.pop();
    }
} 
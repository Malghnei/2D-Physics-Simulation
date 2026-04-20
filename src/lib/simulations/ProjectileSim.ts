import { BaseSimulation } from './BaseSimulation';

export class ProjectileSim extends BaseSimulation {
    initialVelocity = 100;
    startHeight = 100;
    angle = 45;

    g = 9.8 * 10; // Scale gravity visually
    
    position = {x: 0, y: 0};
    velocity = {x: 0, y: 0};
    
    groundY = 500;

    onStart() {
        this.refresh();
    }

    refresh() {
        this.groundY = this.canvas.clientHeight - 20; 
        const startY = this.groundY - this.startHeight;
        this.position = { x: 50, y: startY };
        const rad = this.angle * (Math.PI / 180);
        this.velocity = {
            x: this.initialVelocity * Math.cos(rad),
            y: -this.initialVelocity * Math.sin(rad)
        };
    }

    update() {
        const dt = 0.016; 
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.velocity.y += this.g * dt;

        if (this.position.y >= this.groundY) {
            this.position.y = this.groundY;
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Output text
        this.ctx.fillStyle = "black";
        this.ctx.font = "16px sans-serif";
        this.ctx.fillText(`Velocity X: ${this.velocity.x.toFixed(2)}`, 20, 30);
        this.ctx.fillText(`Velocity Y: ${this.velocity.y.toFixed(2)}`, 20, 50);

        // ground
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY + 10);
        this.ctx.lineTo(this.canvas.clientWidth, this.groundY + 10);
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();

        // projectile
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI);
        this.ctx.fillStyle = "red";
        this.ctx.fill();
        this.ctx.stroke();
    }
}

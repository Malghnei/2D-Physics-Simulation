import { BaseSimulation } from './BaseSimulation';

export class BoxSlopeSim extends BaseSimulation {
    angle = 30; // degrees
    frictionCoefficient = 0.2;
    g = 9.8 * 50; // Scaling for visual display

    position = { x: 0, y: 0 };
    velocity = { x: 0, y: 0 };

    onStart() {
        this.refresh();
    }

    refresh() {
        const rad = this.angle * (Math.PI / 180);
        const length = 800;
        this.position = {
            x: length * Math.cos(rad) - 50 * Math.cos(rad),
            y: this.canvas.clientHeight - length * Math.sin(rad) + 50 * Math.sin(rad)
        };
        this.velocity = { x: 0, y: 0 };
    }

    update() {
        const dt = 0.016;
        const rad = this.angle * (Math.PI / 180);
        
        let gravityAccel = this.g * Math.sin(rad);
        let frictionForce = this.frictionCoefficient * this.g * Math.cos(rad);

        let netAccel = gravityAccel - frictionForce;
        if (netAccel < 0) netAccel = 0; // Friction holds it in place

        this.velocity.y += netAccel * Math.sin(rad) * dt;
        this.velocity.x -= netAccel * Math.cos(rad) * dt;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        if (this.position.y >= this.canvas.clientHeight) {
            this.position.y = this.canvas.clientHeight;
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        const rad = this.angle * (Math.PI / 180);
        const length = 800;
        const baseH = this.canvas.clientHeight;

        // Incline
        this.ctx.beginPath();
        this.ctx.moveTo(0, baseH);
        this.ctx.lineTo(length * Math.cos(rad), baseH - length * Math.sin(rad));
        this.ctx.lineTo(length * Math.cos(rad), baseH);
        this.ctx.fillStyle = "#8d8d8d";
        this.ctx.fill();

        // Box
        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(-rad);
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(-50, -50, 50, 50); 
        this.ctx.restore();
    }
}

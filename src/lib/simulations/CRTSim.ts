import { BaseSimulation } from './BaseSimulation';

export class CRTSim extends BaseSimulation {
    length = 10; // cm
    distanceBetween = 10; // cm
    potentialDifference = 500; // V
    initialSpeed = 1000000; // m/s

    electronMass = 9.11e-31;
    electronCharge = 1.602e-19;
    
    particles: {x: number, y: number}[] = [];

    onStart() {
        this.refresh();
    }

    refresh() {
        this.particles = [];
        this.computePath();
    }

    update() {
        // Path is pre-computed in this simulation mode since it's an instantaneous ray trace
        // But we can update it if variables change in realtime.
        this.computePath();
    }

    computePath() {
        const accel = (this.electronCharge * (this.potentialDifference / (this.distanceBetween / 10000)) / this.electronMass);
        
        let path = [];
        let x = 0;
        let y = this.canvas.clientHeight / 2;
        let middle = y;
        let vy = 0;
        let t = 0;

        let plength = this.length * 20; 
        let pdistance = this.distanceBetween * 20;

        while (y > 0 && y < this.canvas.clientHeight && x < this.canvas.clientWidth) {
            path.push({x, y});

            if (x > 20 && x <= plength + 20) {
                vy += accel * t / 1e13; 
            }

            x += this.initialSpeed * t / 1e9;
            y -= vy * t / 1e9;

            t += 1e-5;
            
            // collision with plates
            if (x > 20 && x <= plength + 20) {
                if (y < middle - pdistance/2 || y > middle + pdistance/2) {
                    break;
                }
            }
        }
        this.particles = path;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        let middle = this.canvas.clientHeight / 2;
        let plength = this.length * 20;
        let pdistance = this.distanceBetween * 20;

        // Draw plates
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(20, middle - pdistance/2 - 5, plength, 5); // Top plate
        this.ctx.fillRect(20, middle + pdistance/2, plength, 5); // Bottom plate

        // Draw path
        for (let p of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = "blue";
            this.ctx.fill();
        }
    }
}

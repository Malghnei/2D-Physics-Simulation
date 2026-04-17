import { BaseSimulation } from './BaseSimulation';

export class DiffractionSim extends BaseSimulation {
    wavelength = 500; // nm
    spacing = 20; // nm
    distance = 0.1; // m

    onStart() {}
    update() {}

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        const wl = this.wavelength * 1e-9;
        const sp = this.spacing * 1e-6;
        const dist = this.distance;
        
        let x = (wl / dist) * sp * 1e12; 

        let middle = this.canvas.clientWidth / 2;
        let yStart = 50;
        let height = 500;

        let i = 1;

        while (true) {
            this.drawGradient(middle + x * (i - 1), yStart, x, height, "white", "black");
            this.drawGradient(middle + x * i, yStart, x, height, "black", "white");
            
            this.drawGradient(middle - x * i, yStart, x, height, "black", "white");
            this.drawGradient(middle - x * (i + 1), yStart, x, height, "white", "black");

            i += 2;
            if ((middle + x * i) > this.canvas.clientWidth) {
                break;
            }
            if (i > 100) break; // Sanity limit
        }
    }

    drawGradient(startX: number, y: number, w: number, h: number, color1: string, color2: string) {
        if (w <= 0) return;
        let gradient = this.ctx.createLinearGradient(startX, 0, startX + w, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(startX, y, w, h);
    }
}

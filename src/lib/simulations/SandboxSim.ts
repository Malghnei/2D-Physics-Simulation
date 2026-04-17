import { BaseSimulation } from './BaseSimulation';
import { EngineState } from '../engine/EngineState';
import { Body, Ball, Capsule, Box, Star, Wall } from '../engine/Body';
import { CollData, sat } from '../engine/Collision';
import { Vector } from '../engine/Vector';

export class SandboxSim extends BaseSimulation {
    bodies: Body[] = [];
    collisions: CollData[] = [];
    collCounter = 0;

    // Sandbox settings
    shapeAmount = 11;
    playerSpeed = 0.5;
    playerMass = 1;

    onStart() {
        this.generateSimulation();
    }

    refresh() {
        this.generateSimulation();
    }

    generateSimulation() {
        this.bodies = [];
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;

        this.bodies.push(new Wall(0, 0, w, 0));
        this.bodies.push(new Wall(w, 0, w, h));
        this.bodies.push(new Wall(w, h, 0, h));
        this.bodies.push(new Wall(0, h, 0, 0));

        const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

        for (let i = 0; i < this.shapeAmount; i++) {
            let x0 = randInt(100, w - 100);
            let y0 = randInt(100, h - 100);
            let x1 = x0 + randInt(-100, 100);
            let y1 = y0 + randInt(-100, 100);
            let r = randInt(25, 50);
            let m = randInt(0, 10);

            if (i % 4 === 0) this.bodies.push(new Capsule(x0, y0, x1, y1, r, m));
            if (i % 4 === 1) this.bodies.push(new Box(x0, y0, x1, y1, r, m));
            if (i % 4 === 2) this.bodies.push(new Ball(x0, y0, r, m));
            if (i % 4 === 3) this.bodies.push(new Star(x0, y0, r, m));
        }

        let playerBall = new Ball(w / 2, h / 2, 50, this.playerMass);
        playerBall.player = true;
        playerBall.acceleration = this.playerSpeed;
        this.bodies.push(playerBall);
    }

    update() {
        let p = this.bodies.find(b => b.player);
        if (p) {
            p.acceleration = this.playerSpeed;
            p.m = this.playerMass;
            p.inv_m = this.playerMass === 0 ? 0 : 1 / this.playerMass;
        }

        this.collisions = [];
        this.collCounter = 0;

        this.bodies.forEach((b) => {
            if (b.player) {
                b.keyControl();
            }
            b.reposition();
        });

        this.bodies.forEach((b, index) => {
            for (let bodyPair = index + 1; bodyPair < this.bodies.length; bodyPair++) {
                if (this.bodies[index].m === 0 && this.bodies[bodyPair].m === 0) continue;

                let bestSat = {
                    pen: <number | null>null,
                    axis: <Vector | null>null,
                    vertex: <Vector | null>null
                };

                for (let o1comp = 0; o1comp < this.bodies[index].comp.length; o1comp++) {
                    for (let o2comp = 0; o2comp < this.bodies[bodyPair].comp.length; o2comp++) {
                        let result = sat(this.bodies[index].comp[o1comp], this.bodies[bodyPair].comp[o2comp]);
                        if (result.pen !== null && (bestSat.pen === null || result.pen > bestSat.pen)) {
                            bestSat = result;
                        }
                    }
                }

                if (bestSat.pen !== null && bestSat.axis && bestSat.vertex) {
                    this.collisions.push(new CollData(this.bodies[index], this.bodies[bodyPair], bestSat.axis, bestSat.pen, bestSat.vertex));
                    this.collCounter++;
                }
            }
        });

        this.collisions.forEach((c) => {
            c.penRes();
            c.collRes();
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        this.bodies.forEach((b) => {
            b.draw(this.ctx);
            b.display();
        });

        this.ctx.fillStyle = "black";
        this.ctx.font = "16px sans-serif";
        this.ctx.fillText("Collision: " + this.collCounter, 50, 50);
    }
}

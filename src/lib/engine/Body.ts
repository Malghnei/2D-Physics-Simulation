import { Vector } from './Vector';
import { Shape, Circle, Rectangle, Triangle, Line } from './Shape';
import { EngineState } from './EngineState';

export class Body {
    comp: Shape[];
    pos: Vector;
    m: number;
    inv_m: number;
    inertia: number;
    inv_inertia: number;
    elasticity: number;
    vel: Vector;
    acc: Vector;
    acceleration: number;
    angVel: number;
    player: boolean;
    
    constructor(x: number, y: number) {
        this.comp = [];
        this.pos = new Vector(x, y);
        this.m = 0;
        this.inv_m = 0;
        this.inertia = 0;
        this.inv_inertia = 0;
        this.elasticity = 1;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.acceleration = 0.5;
        this.angVel = 0;
        this.player = false;
    }

    draw(ctx: CanvasRenderingContext2D) {}

    display() {}
    
    reposition() {}
    
    keyControl() {}
}

export class Ball extends Body {
    constructor(x: number, y: number, r: number, m: number) {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Circle(x, y, r)];
        this.m = m
        if (this.m === 0) {
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.comp[0].draw(ctx);
        if (this.player) {
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.fillStyle = "black";
        }
    }

    reposition() {
        this.acc = this.acc.unit().multiply(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.multiply(1 - EngineState.friction);
        this.pos = this.pos.add(this.vel);
        this.comp[0].pos = this.pos;
    }

    keyControl() {
        if (EngineState.inputState.UP) {
            this.acc.y = -this.acceleration;
        }
        if (EngineState.inputState.DOWN) {
            this.acc.y = this.acceleration;
        }
        if (EngineState.inputState.LEFT) {
            this.acc.x = -this.acceleration;
        }
        if (EngineState.inputState.RIGHT) {
            this.acc.x = this.acceleration;
        }
        if (!EngineState.inputState.UP && !EngineState.inputState.DOWN) {
            this.acc.y = 0;
        }
        if (!EngineState.inputState.RIGHT && !EngineState.inputState.LEFT) {
            this.acc.x = 0;
        }
    }
}

export class Capsule extends Body {
    constructor(x1: number, y1: number, x2: number, y2: number, r: number, m: number) {
        super(x1, y1);
        this.comp = [new Circle(x1, y1, r), new Circle(x2, y2, r)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtract(this.comp[0].pos).unit().normal().multiply(r));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtract(this.comp[0].pos).unit().normal().multiply(r));
        this.comp.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2 * r));
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }

        // Moment of inertia of a rectangular plate.
        let rect = this.comp[0] as Rectangle;
        this.inertia = this.m * ((2 * rect.width) ** 2 + (rect.length + 2 * rect.width) ** 2) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.comp[0].draw(ctx);
        this.comp[1].draw(ctx);
        this.comp[2].draw(ctx);
    }

    keyControl() {
        let rect = this.comp[0] as Rectangle;
        if (EngineState.inputState.UP) {
            this.acc = rect.dir.multiply(-this.acceleration);
        }
        if (EngineState.inputState.DOWN) {
            this.acc = rect.dir.multiply(this.acceleration);
        }
        if (EngineState.inputState.LEFT) {
            this.angVel = -0.03;
        }
        if (EngineState.inputState.RIGHT) {
            this.angVel = 0.03;
        }
        if (!EngineState.inputState.UP && !EngineState.inputState.DOWN) {
            this.acc.set(0, 0);
        }
    }

    reposition() {
        let rect = this.comp[0] as Rectangle;
        this.acc = this.acc.unit().multiply(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.multiply(1 - EngineState.friction);
        rect.pos = rect.pos.add(this.vel);
        this.angVel *= 1 - EngineState.friction;
        rect.angle += this.angVel;
        rect.getVertices();
        this.comp[1].pos = this.comp[0].pos.add(rect.dir.multiply(-rect.length / 2));
        this.comp[2].pos = this.comp[0].pos.add(rect.dir.multiply(rect.length / 2));

    }
}

export class Box extends Body {
    constructor(x1: number, y1: number, x2: number, y2: number, w: number, m: number) {
        super(x1, y1);
        this.comp = [new Rectangle(x1, y1, x2, y2, w)];
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }

        // Moment of inertia of a rectangular plate.
        let rect = this.comp[0] as Rectangle
        this.inertia = this.m * ((2 * rect.width) ** 2 + (rect.length + 2 * rect.width) ** 2) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.comp[0].draw(ctx);
    }

    keyControl() {
        let rect = this.comp[0] as Rectangle;

        if (EngineState.inputState.UP) {
            this.acc = rect.dir.multiply(-this.acceleration);
        }
        if (EngineState.inputState.DOWN) {
            this.acc = rect.dir.multiply(this.acceleration);
        }
        if (EngineState.inputState.LEFT) {
            this.angVel = -0.03;
        }
        if (EngineState.inputState.RIGHT) {
            this.angVel = 0.03;
        }
        if (!EngineState.inputState.UP && !EngineState.inputState.DOWN) {
            this.acc.set(0, 0);
        }
    }

    reposition() {
        let rect = this.comp[0] as Rectangle;
        this.acc = this.acc.unit().multiply(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.multiply(1 - EngineState.friction);
        this.comp[0].pos = this.comp[0].pos.add(this.vel);
        this.angVel *= 1 - EngineState.friction;
        rect.angle += this.angVel;
        rect.getVertices();
    }
}

export class Star extends Body {
        constructor(x1: number, y1: number, r: number, m: number) {
        super(x1, y1);
        this.comp = [];
        let center = new Vector(x1, y1);
        let upDir = new Vector(0, -1);
        let p1 = center.add(upDir.multiply(r));
        let p2 = center.add(upDir.multiply(-r / 2)).add(upDir.normal().multiply(-r * Math.sqrt(3) / 2));
        let p3 = center.add(upDir.multiply(-r / 2)).add(upDir.normal().multiply(r * Math.sqrt(3) / 2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        
        p1 = center.add(upDir.multiply(-r));
        p2 = center.add(upDir.multiply(r / 2)).add(upDir.normal().multiply(-r * Math.sqrt(3) / 2));
        p3 = center.add(upDir.multiply(r / 2)).add(upDir.normal().multiply(r * Math.sqrt(3) / 2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }

        // Moment of inertia
        this.inertia = this.m * ((2 * r) ** 2) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.comp[0].draw(ctx);
        this.comp[1].draw(ctx);
    }

    keyControl() {
        let rect = this.comp[0] as Triangle;
        if (EngineState.inputState.UP) {
            this.acc = rect.dir.multiply(-this.acceleration);
        }
        if (EngineState.inputState.DOWN) {
            this.acc = rect.dir.multiply(this.acceleration);
        }
        if (EngineState.inputState.LEFT) {
            this.angVel = -0.03;
        }
        if (EngineState.inputState.RIGHT) {
            this.angVel = 0.03;
        }
        if (!EngineState.inputState.UP && !EngineState.inputState.DOWN) {
            this.acc.set(0, 0);
        }
    }

    reposition() {
        let tri1 = this.comp[0] as Triangle;
        let tri2 = this.comp[1] as Triangle;
        this.acc = this.acc.unit().multiply(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.multiply(1 - EngineState.friction);
        this.angVel *= 1 - EngineState.friction;
        tri1.pos = this.comp[0].pos.add(this.vel);
        tri1.angle += this.angVel;
        tri1.getVertices();
        tri2.pos = this.comp[0].pos;
        tri2.angle += this.angVel;
        tri2.getVertices();
    }
}

export class Wall extends Body {
    constructor(x1: number, y1: number, x2: number, y2: number) {
        super(0, 0);
        this.comp = [new Line(x1, y1, x2, y2)];
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.comp[0].draw(ctx);
    }
}

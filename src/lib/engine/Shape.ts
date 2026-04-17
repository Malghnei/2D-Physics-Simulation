import { Vector } from './Vector';
import { Matrix } from './Matrix';

export interface Shape {
    vertex: Vector[];
    pos: Vector;
    dir?: Vector;
    draw(ctx: CanvasRenderingContext2D): void;
    getVertices?(): void;
    r?: number;
    length?: number;
    width?: number;
    angle?: number;
}

export class Line implements Shape {
    vertex: Vector[];
    dir: Vector;
    mag: number;
    pos: Vector;

    constructor(x0: number, y0: number, x1: number, y1: number) {
        this.vertex = [];
        this.vertex[0] = new Vector(x0, y0);
        this.vertex[1] = new Vector(x1, y1);
        this.dir = this.vertex[1].subtract(this.vertex[0]).unit();
        this.mag = this.vertex[1].subtract(this.vertex[0]).magnitude();
        this.pos = new Vector((this.vertex[0].x + this.vertex[1].x) / 2, (this.vertex[0].y + this.vertex[1].y) / 2);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }
}

export class Circle implements Shape {
    vertex: Vector[];
    pos: Vector;
    r: number;

    constructor(x: number, y: number, r: number) {
        this.vertex = [];
        this.pos = new Vector(x, y);
        this.r = r;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "red";
        //ctx.fill();
        ctx.closePath();
    }
}

export class Rectangle implements Shape {
    vertex: Vector[];
    dir: Vector;
    refDir: Vector;
    length: number;
    width: number;
    pos: Vector;
    angle: number;
    rotMat: Matrix;

    constructor(x1: number, y1: number, x2: number, y2: number, w: number) {
        this.vertex = [];
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.dir = this.vertex[1].subtract(this.vertex[0]).unit();
        this.refDir = this.vertex[1].subtract(this.vertex[0]).unit();
        this.length = this.vertex[1].subtract(this.vertex[0]).magnitude();
        this.width = w;
        this.vertex[2] = this.vertex[1].add(this.dir.normal().multiply(this.width));
        this.vertex[3] = this.vertex[2].add(this.dir.normal().multiply(-this.length));
        this.pos = this.vertex[0].add(this.dir.multiply(this.length / 2)).add(this.dir.normal().multiply(this.width / 2));
        this.angle = 0;
        this.rotMat = new Matrix(2, 2);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[3].x, this.vertex[3].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    getVertices() {
        this.rotMat.rotMx22(this.angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.dir.multiply(-this.length / 2)).add(this.dir.normal().multiply(this.width / 2));
        this.vertex[1] = this.pos.add(this.dir.multiply(-this.length / 2)).add(this.dir.normal().multiply(-this.width / 2));
        this.vertex[2] = this.pos.add(this.dir.multiply(this.length / 2)).add(this.dir.normal().multiply(-this.width / 2));
        this.vertex[3] = this.pos.add(this.dir.multiply(this.length / 2)).add(this.dir.normal().multiply(this.width / 2));
    }
}

export class Triangle implements Shape {
    vertex: Vector[];
    pos: Vector;
    dir: Vector;
    refDir: Vector;
    refDiam: Vector[];
    angle: number;
    rotMat: Matrix;

    constructor(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        this.vertex = [];
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.vertex[2] = new Vector(x3, y3);
        this.pos = new Vector((this.vertex[0].x + this.vertex[1].x + this.vertex[2].x) / 3, (this.vertex[0].y + this.vertex[1].y + this.vertex[2].y) / 3);

        this.dir = this.vertex[0].subtract(this.pos).unit();
        this.refDir = this.dir;
        this.refDiam = [];
        this.refDiam[0] = this.vertex[0].subtract(this.pos);
        this.refDiam[1] = this.vertex[1].subtract(this.pos);
        this.refDiam[2] = this.vertex[2].subtract(this.pos);
        this.angle = 0;
        this.rotMat = new Matrix(2, 2);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    getVertices() {
        this.rotMat.rotMx22(this.angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[0]));
        this.vertex[1] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[1]));
        this.vertex[2] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[2]));
    }
}

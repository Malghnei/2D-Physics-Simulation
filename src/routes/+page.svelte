<script lang="ts">
    import { onMount } from "svelte";

    let canvas: HTMLCanvasElement;
	let friction = 0.1;
	let bodies: Body[] = [];
	let collisions: CollData[] = [];
	let collCounter = 0;
	let inputState = { LEFT: false, UP: false, RIGHT: false, DOWN: false };


    // --- Interfaces & Types ---

	interface SatResult {
		pen: number | null;
		axis: Vector | null;
		vertex: Vector | null;
	}

    // -- Classes ---

    class Vector {
        x: number;
        y: number;

        constructor(x: number,y: number) {
            this.x = x;
            this.y = y;
        }


        add(v: Vector) {
            return new Vector(this.x + v.x, this.y + v.y);
        }

        subtract(v: Vector) {
            return new Vector(this.x - v.x, this.y - v.y);
        }

        multiply(n: number) {
            return new Vector(this.x * n, this.y * n);
        }

        magnitude() {
            return Math.sqrt(this.x ** 2 + this.y ** 2);
        }

        unit() {
            if(this.magnitude() === 0) {
                return new Vector(0, 0);
            }
            else {
                return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
            }
        }

        normal() {
            return new Vector(-this.y, this.x).unit();
        }

        static dot(v1: Vector, v2: Vector) {
            return v1.x * v2.x + v1.y * v2.y;
        }

        static cross(v1: Vector, v2: Vector) {
            return v1.x * v2.y - v1.y * v2.x;
        }

        drawVector(ctx: CanvasRenderingContext2D, start_x: number, start_y: number, n: number, color: string) {
            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        set(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    class Matrix {
        rows: number;
        cols: number;
        data: number[][]

        constructor(rows: number, cols: number) {
            this.rows = rows;
            this.cols = cols;
            this.data = [];

            for (let i = 0; i < this.rows; i++)  {
                this.data[i] = [];
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] = 0;
                }
            }
        }

        multiplyVec(vec: Vector) {
            let result = new Vector(0,0);
            result.x = this.data[0][0] * vec.x + this.data[0][1] * vec.y;
            result.y = this.data[1][0] * vec.x + this.data[1][1] * vec.y;
            return result;
        }

        rotMx22(angle: number) {
            this.data[0][0] = Math.cos(angle);
            this.data[0][1] = -Math.sin(angle);
            this.data[1][0] = Math.sin(angle);
            this.data[1][1] = Math.cos(angle);
        }
    }

	interface Shape {
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

    class Line implements Shape {
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

    class Circle implements Shape {
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

    class Rectangle implements Shape {
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

    class Triangle implements Shape {
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

    class Body {
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
			this.acceleration = 1;
			this.angVel = 0;
			this.player = false;
		}

		draw(ctx: CanvasRenderingContext2D) {}

		display() {}
		
        reposition() {}
		
        keyControl() {}
	}

    class Ball extends Body{
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
            this.vel = this.vel.multiply(1 - friction);
            this.pos = this.pos.add(this.vel);
            this.comp[0].pos = this.pos;
        }

        keyControl() {
            if (inputState.UP) {
                this.acc.y = -this.acceleration;
            }
            if (inputState.DOWN) {
                this.acc.y = this.acceleration;
            }
            if (inputState.LEFT) {
                this.acc.x = -this.acceleration;
            }
            if (inputState.RIGHT) {
                this.acc.x = this.acceleration;
            }
            if (!inputState.UP && !inputState.DOWN) {
                this.acc.y = 0;
            }
            if (!inputState.RIGHT && !inputState.LEFT) {
                this.acc.x = 0;
            }
        }
    }

    class Capsule extends Body {
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
            if (inputState.UP) {
                this.acc = rect.dir.multiply(-this.acceleration);
            }
            if (inputState.DOWN) {
                this.acc = rect.dir.multiply(this.acceleration);
            }
            if (inputState.LEFT) {
                this.angVel = -0.03;
            }
            if (inputState.RIGHT) {
                this.angVel = 0.03;
            }
            if (!inputState.UP && !inputState.DOWN) {
                this.acc.set(0, 0);
            }
        }

        reposition() {
            let rect = this.comp[0] as Rectangle;
            this.acc = this.acc.unit().multiply(this.acceleration);
            this.vel = this.vel.add(this.acc);
            this.vel = this.vel.multiply(1 - friction);
            rect.pos = rect.pos.add(this.vel);
            this.angVel *= 1;
            rect.angle += this.angVel;
            rect.getVertices();
            this.comp[1].pos = this.comp[0].pos.add(rect.dir.multiply(-rect.length / 2));
            this.comp[2].pos = this.comp[0].pos.add(rect.dir.multiply(rect.length / 2));

        }
    }

    class Box extends Body {
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

            if (inputState.UP) {
                this.acc = rect.dir.multiply(-this.acceleration);
            }
            if (inputState.DOWN) {
                this.acc = rect.dir.multiply(this.acceleration);
            }
            if (inputState.LEFT) {
                this.angVel = -0.03;
            }
            if (inputState.RIGHT) {
                this.angVel = 0.03;
            }
            if (!inputState.UP && !inputState.DOWN) {
                this.acc.set(0, 0);
            }
        }

        reposition() {
            let rect = this.comp[0] as Rectangle;
            this.acc = this.acc.unit().multiply(this.acceleration);
            this.vel = this.vel.add(this.acc);
            this.vel = this.vel.multiply(1 - friction);
            this.comp[0].pos = this.comp[0].pos.add(this.vel);
            this.angVel *= 1;
            rect.angle += this.angVel;
            rect.getVertices();
        }
    }

    class Star extends Body {
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
            let rect = this.comp[0] as Rectangle;
            if (inputState.UP) {
                this.acc = rect.dir.multiply(-this.acceleration);
            }
            if (inputState.DOWN) {
                this.acc = rect.dir.multiply(this.acceleration);
            }
            if (inputState.LEFT) {
                this.angVel = -0.03;
            }
            if (inputState.RIGHT) {
                this.angVel = 0.03;
            }
            if (!inputState.UP && !inputState.DOWN) {
                this.acc.set(0, 0);
            }
        }

        reposition() {
            let tri1 = this.comp[0] as Triangle;
            let tri2 = this.comp[1] as Triangle;
            this.acc = this.acc.unit().multiply(this.acceleration);
            this.vel = this.vel.add(this.acc);
            this.vel = this.vel.multiply(1 - friction);
            this.angVel *= 1;
            tri1.pos = this.comp[0].pos.add(this.vel);
            tri1.angle += this.angVel;
            tri1.getVertices();
            tri2.pos = this.comp[0].pos;
            tri2.angle += this.angVel;
            tri2.getVertices();
        }
    }

    class Wall extends Body {
        constructor(x1: number, y1: number, x2: number, y2: number) {
            super(0, 0);
            this.comp = [new Line(x1, y1, x2, y2)];
        }

        draw(ctx: CanvasRenderingContext2D) {
            this.comp[0].draw(ctx);
        }
    }

    class CollData {
        o1: Body;
		o2: Body;
		normal: Vector;
		pen: number;
		cp: Vector;

        constructor(o1: Body, o2: Body, normal: Vector, pen: number, cp: Vector) {
            this.o1 = o1;
            this.o2 = o2;
            this.normal = normal;
            this.pen = pen;
            this.cp = cp;
        }

        penRes() {
            let penResolution = this.normal.multiply(this.pen / (this.o1.inv_m + this.o2.inv_m));
            this.o1.pos = this.o1.pos.add(penResolution.multiply(this.o1.inv_m));
            this.o2.pos = this.o2.pos.add(penResolution.multiply(-this.o2.inv_m));
        }

        collRes() {
            // Closing velocity

            let collArm1 = this.cp.subtract(this.o1.comp[0].pos);
            let rotVel1 = new Vector(-this.o1.angVel * collArm1.y, this.o1.angVel * collArm1.x);
            let closVel1 = this.o1.vel.add(rotVel1);
            let collArm2 = this.cp.subtract(this.o2.comp[0].pos);
            let rotVel2 = new Vector(-this.o2.angVel * collArm2.y, this.o2.angVel * collArm2.x);
            let closVel2 = this.o2.vel.add(rotVel2);

            // Impulse Augmentation

            let impAug1 = Vector.cross(collArm1, this.normal);
            impAug1 = impAug1 * this.o1.inv_inertia * impAug1;
            let impAug2 = Vector.cross(collArm2, this.normal);
            impAug2 = impAug2 * this.o2.inv_inertia * impAug2;

            let relVel = closVel1.subtract(closVel2);
            let sepVel = Vector.dot(relVel, this.normal);
            let new_sepVel = -sepVel * Math.min(this.o1.elasticity, this.o2.elasticity);
            let vsep_diff = new_sepVel - sepVel;

            if ((this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2) === 0) return;
            let impulse = vsep_diff / (this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2);
            let impulseVec = this.normal.multiply(impulse);
            

            //
            
            this.o1.vel = this.o1.vel.add(impulseVec.multiply(this.o1.inv_m));
            this.o2.vel = this.o2.vel.add(impulseVec.multiply(-this.o2.inv_m));
            
            this.o1.angVel += this.o1.inv_inertia * Vector.cross(collArm1, impulseVec);
            this.o2.angVel -= this.o2.inv_inertia * Vector.cross(collArm2, impulseVec);
        }
    }

    function userInput() {
        canvas.addEventListener('keydown',function(e) {
            if(e.key == 'ArrowUp') {
                inputState.UP = true;
            }
            if(e.key == 'ArrowDown') {
                inputState.DOWN = true;
            }
            if(e.key == 'ArrowLeft') {
                inputState.LEFT = true;
            }
            if(e.key == 'ArrowRight') {
                inputState.RIGHT = true;
            }
        })
        
        canvas.addEventListener('keyup',function(e) {
            if(e.key == 'ArrowUp') {
                inputState.UP = false;
            }
            if(e.key == 'ArrowDown') {
                inputState.DOWN = false;
            }
            if(e.key == 'ArrowLeft') {
                inputState.LEFT = false;
            }
            if(e.key == 'ArrowRight') {
                inputState.RIGHT = false;
            }
        })
    }

    function randInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function round(number: number, precision: number) {
        let factor = 10**precision

        return Math.round(number * factor) / factor;
    }

    function testCircle(ctx: CanvasRenderingContext2D, x: number, y: number, color = "black") {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    function closestPointOnLS(p: Vector, w1: Line) {
        let ballToWallStart = w1.vertex[0].subtract(p);
        if (Vector.dot(w1.dir, ballToWallStart) > 0) {
            return w1.vertex[0];
        }

        let wallEndToBall = p.subtract(w1.vertex[1]);
        if (Vector.dot(w1.dir, wallEndToBall) > 0) {
            return w1.vertex[1];
        }
        let closestDist = Vector.dot(w1.dir, ballToWallStart);
        let closestVect = w1.dir.multiply(closestDist);
        return w1.vertex[0].subtract(closestVect);
    }
    /**
    function closestPointsBetweenLS(ctx: CanvasRenderingContext2D, c1: Line, c2: Line) {
        let shortestDist = closestPointOnLS(c1.vertex[0], c2).subtract(c1.vertex[0]).magnitude();
        let closestPoints = [c1.vertex[0], closestPointOnLS(c1.vertex[0], c2)];

        if (closestPointOnLS(c1.vertex[1], c2).subtract(c1.vertex[1]).magnitude() < shortestDist) {
            shortestDist = closestPointOnLS(c1.vertex[1], c2).subtract(c1.vertex[1]).magnitude();
            closestPoints = [c1.vertex[1], closestPointOnLS(c1.vertex[1], c2)];
        }

        if (closestPointOnLS(c2.vertex[0], c1).subtract(c2.vertex[0]).magnitude() < shortestDist) {
            shortestDist = closestPointOnLS(c2.vertex[0], c1).subtract(c2.vertex[0]).magnitude();
            closestPoints = [closestPointOnLS(c2.vertex[0], c1), c2.vertex[0]];
        }

        if (closestPointOnLS(c2.vertex[1], c1).subtract(c2.vertex[1]).magnitude() < shortestDist) {
            shortestDist = closestPointOnLS(c2.vertex[1], c1).subtract(c2.vertex[1]).magnitude();
            closestPoints = [closestPointOnLS(c2.vertex[1], c1), c2.vertex[1]];
        }

        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(closestPoints[0].x, closestPoints[0].y);
        ctx.lineTo(closestPoints[1].x, closestPoints[1].y);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(closestPoints[0].x, closestPoints[0].y, c1.r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(closestPoints[1].x, closestPoints[1].y, c2.r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        return closestPoints;
    }
    */


    // Seperating Axis Theorem
    function sat(o1: Shape, o2: Shape): SatResult {
        let minOverlap: number | null = null;
		let smallestAxis: Vector | null = null;
		let vertexObj: Shape | null = null;

		let axes = findAxes(o1, o2);
		let proj1, proj2;
		let firstShapeAxis = getShapeAxis(o1);

        for (let i = 0; i < axes.length; i++) {
            proj1 = projShapeOntoAxis(axes[i], o1);
            proj2 = projShapeOntoAxis(axes[i], o2);
            let overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
            
            if (overlap < 0) {
                return { pen: null, axis: null, vertex: null };
            }

            if ((proj1.max > proj2.max && proj1.min < proj2.min) ||
                (proj1.max < proj2.max && proj1.min > proj2.min)) {
                let mins = Math.abs(proj1.min - proj2.min);
                let maxs = Math.abs(proj1.max - proj2.max);

                if (mins < maxs) {
                    overlap += mins;
                } else {
                    overlap += maxs;
                    axes[i] = axes[i].multiply(-1);
                }
            }

            if (minOverlap === null || overlap < minOverlap) {
                minOverlap = overlap;
                smallestAxis = axes[i];
                if (i < firstShapeAxis) {
                    vertexObj = o2;
                    if (proj1.max > proj2.max) {
                        smallestAxis = axes[i].multiply(-1);
                    }
                } else {
                    vertexObj = o1;
                    if (proj1.max < proj2.max) {
                        smallestAxis = axes[i].multiply(-1);
                    }
                }
            }
        }

        let contactVertex = projShapeOntoAxis(smallestAxis!, vertexObj!).collVertex;
        // smallestAxis.drawVector(contactVertex.x, contactVertex.y, minOverlap, "blue");

        if (vertexObj === o2) {
            smallestAxis = smallestAxis!.multiply(-1);
        }

        return {
            pen: minOverlap,
            axis: smallestAxis,
            vertex: contactVertex
        };
    }

    function projShapeOntoAxis(axis: Vector, obj: Shape) {
        setBallVerticeAlongAxis(obj, axis);
        let min = Vector.dot(axis, obj.vertex[0]);
        let max = min;
        let collVertex = obj.vertex[0];

        for (let i = 0; i < obj.vertex.length; i++) {
            let p = Vector.dot(axis, obj.vertex[i]);

            if (p < min) {
                min = p;
                collVertex = obj.vertex[i];
            }
            if (p > max) {
                max = p;
            }
        }

        return {
            min: min,
            max: max,
            collVertex: collVertex
        };
    }

    function findAxes(o1: Shape, o2: Shape): Vector[] {
        let axes: Vector[] = [];

        if (o1 instanceof Circle && o2 instanceof Circle) {
            axes.push(o2.pos.subtract(o1.pos).unit());
            
            return axes;
        }

        if (o1 instanceof Circle) {
            axes.push(closestVertexToPoint(o2, o1.pos).subtract(o1.pos).unit());
        }

        if (o1 instanceof Line) {
            axes.push(o1.dir.normal());
        }

        if (o1 instanceof Rectangle) {
            axes.push(o1.dir.normal());
            axes.push(o1.dir);
        }

        if (o1 instanceof Triangle) {
            axes.push(o1.vertex[1].subtract(o1.vertex[0]).normal());
            axes.push(o1.vertex[2].subtract(o1.vertex[1]).normal());
            axes.push(o1.vertex[0].subtract(o1.vertex[2]).normal());
        }

        if (o2 instanceof Circle) {
            axes.push(closestVertexToPoint(o1, o2.pos).subtract(o2.pos).unit());
        }

        if (o2 instanceof Line) {
            axes.push(o2.dir.normal());
        }

        if (o2 instanceof Rectangle) {
                axes.push(o2.dir.normal());
                axes.push(o2.dir);
        }

        if (o2 instanceof Triangle) {
            axes.push(o2.vertex[1].subtract(o2.vertex[0]).normal());
            axes.push(o2.vertex[2].subtract(o2.vertex[1]).normal());
            axes.push(o2.vertex[0].subtract(o2.vertex[2]).normal());
        }

        return axes;
    }

    function closestVertexToPoint(obj: Shape, p: Vector): Vector {
        let closestVertex;
        let minDist = null;

        for (let i = 0; i < obj.vertex.length; i++) {
            if (minDist === null || p.subtract(obj.vertex[i]).magnitude() < minDist) {
                closestVertex = obj.vertex[i];
                minDist = p.subtract(obj.vertex[i]).magnitude();
            }
        }

        return closestVertex!;
    }

    function getShapeAxis(obj: Shape): number {
        if (obj instanceof Circle || obj instanceof Line) {
            return 1;
        }
        if (obj instanceof Rectangle) {
            return 2;
        }
        if (obj instanceof Triangle) {
            return 3;
        }
        return 0;
    }

    function setBallVerticeAlongAxis(obj: Shape, axis: Vector) {
        if (obj instanceof Circle) {
            obj.vertex[0] = obj.pos.add(axis.unit().multiply(-obj.r));
            obj.vertex[1] = obj.pos.add(axis.unit().multiply(obj.r));
        }
    }

    // --- UI & Initialization ---

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') inputState.UP = true;
		if (e.key === 'ArrowDown') inputState.DOWN = true;
		if (e.key === 'ArrowLeft') inputState.LEFT = true;
		if (e.key === 'ArrowRight') inputState.RIGHT = true;
	}

	function handleKeyup(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') inputState.UP = false;
		if (e.key === 'ArrowDown') inputState.DOWN = false;
		if (e.key === 'ArrowLeft') inputState.LEFT = false;
		if (e.key === 'ArrowRight') inputState.RIGHT = false;
	}

    onMount(() => {
        console.log('Hello World');
        const ctx = canvas.getContext('2d')!;

        bodies.push(new Wall(0, 0, canvas.clientWidth, 0));
		bodies.push(new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight));
		bodies.push(new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight));
		bodies.push(new Wall(0, canvas.clientHeight, 0, 0));

        for (let i = 0; i < 11; i++) {
			let x0 = randInt(100, canvas.clientWidth - 100);
			let y0 = randInt(100, canvas.clientHeight - 100);
			let x1 = x0 + randInt(-100, 100);
			let y1 = y0 + randInt(-100, 100);
			let r = randInt(25, 50);
			let m = randInt(0, 10);

			if (i % 4 === 0) bodies.push(new Capsule(x0, y0, x1, y1, r, m));
			if (i % 4 === 1) bodies.push(new Box(x0, y0, x1, y1, r, m));
			if (i % 4 === 2) bodies.push(new Ball(x0, y0, r, m));
			if (i % 4 === 3) bodies.push(new Star(x0, y0, r, m));
		}


        let playerBall = new Ball(canvas.clientWidth / 2, canvas.clientHeight / 2, 50, 1);
        playerBall.player = true;
        bodies.push(playerBall);

        // Animation loop
        let frameId: number;

        const mainloop = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            collisions = [];
            ctx.fillText("Collision: " + collCounter, 50, 50);

            bodies.forEach((b) => {
                b.draw(ctx);
                b.display();
                if (b.player) {
                    b.keyControl();
                }
                b.reposition();
            })

            bodies.forEach((b, index) => {
                for (let bodyPair = index + 1; bodyPair < bodies.length; bodyPair++) {
                    let bestSat: SatResult = {
                        pen: null,
                        axis: null,
                        vertex: null
                    };

                    for (let o1comp = 0; o1comp < bodies[index].comp.length; o1comp++) {
                        for (let o2comp = 0; o2comp < bodies[bodyPair].comp.length; o2comp++) {
                            let result = sat(bodies[index].comp[o1comp], bodies[bodyPair].comp[o2comp]);
                            if (result.pen !== null && (bestSat.pen === null || result.pen > bestSat.pen)) {
                                bestSat = sat(bodies[index].comp[o1comp], bodies[bodyPair].comp[o2comp]);
                                collCounter++;
                            }
                        }
                    }

                    if (bestSat.pen !== null && bestSat.axis && bestSat.vertex) {
                        collisions.push(new CollData(bodies[index], bodies[bodyPair], bestSat.axis, bestSat.pen, bestSat.vertex));
                    }
                }
            });

            collisions.forEach((c) => {
                c.penRes();
                c.collRes();
            });

            frameId = requestAnimationFrame(mainloop);
        };

        frameId = requestAnimationFrame(mainloop);

        return () => {
            cancelAnimationFrame(frameId);
        };
    });
</script>


<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="container">
	<div class="info">
		<p>
			<a href="https://github.com/Malghnei/2D-Physics-Simulation">Back to Github.</a>
			<br />
			Generates 11 shapes with random attributes, the red one is the controllable one (with arrow keys).
		</p>
	</div>

	<canvas bind:this={canvas} width="1000" height="600"></canvas>

	<div class="credits">
		<p>
			Made by Malik Alghneimin. Credits to <a href="https://youtube.com/playlist?list=PLo6lBZn6hgca1T7cNZXpiq4q395ljbEI_&si=kQsmeopRjL0EchDU">Danielstuts</a> for the physics engine.
		</p>
	</div>

	<div id="properties-panel">
		{#each bodies as body, idx}
			{#if body.m > 0 || body.player} <div class="prop-card">
					<strong>Body {idx} ({body.constructor.name})</strong><br />
					Position:
					<input type="number" bind:value={body.pos.x} style="width:60px;">,
					<input type="number" bind:value={body.pos.y} style="width:60px;"><br />
					Mass:
					<input type="number" bind:value={body.m} on:input={() => body.inv_m = body.m === 0 ? 0 : 1 / body.m} style="width:60px;"><br />
					</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	canvas {
		border: 1px solid black;
		display: block;
		margin: 0 auto;
		background: #fffacc;
	}

	.container {
		font-family: sans-serif;
		padding: 20px;
	}

	#properties-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 20px;
	}

	.prop-card {
		border: 1px solid #ccc;
		padding: 8px;
		background: #f9f9f9;
	}
</style>
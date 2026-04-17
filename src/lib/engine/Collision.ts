import { Vector } from './Vector';
import { Shape, Circle, Rectangle, Triangle, Line } from './Shape';
import { Body } from './Body';

export interface SatResult {
    pen: number | null;
    axis: Vector | null;
    vertex: Vector | null;
}

export class CollData {
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
        
        let shift1 = penResolution.multiply(this.o1.inv_m);
        this.o1.pos = this.o1.pos.add(shift1);
        this.o1.comp.forEach(comp => {
            comp.pos = comp.pos.add(shift1);
            if (comp.getVertices) comp.getVertices();
        });

        let shift2 = penResolution.multiply(-this.o2.inv_m);
        this.o2.pos = this.o2.pos.add(shift2);
        this.o2.comp.forEach(comp => {
            comp.pos = comp.pos.add(shift2);
            if (comp.getVertices) comp.getVertices();
        });
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
        
        if (sepVel > 0) return;
        
        let new_sepVel = -sepVel * Math.min(this.o1.elasticity, this.o2.elasticity);
        let vsep_diff = new_sepVel - sepVel;

        if ((this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2) === 0) return;
        let impulse = vsep_diff / (this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2);
        let impulseVec = this.normal.multiply(impulse);
        
        this.o1.vel = this.o1.vel.add(impulseVec.multiply(this.o1.inv_m));
        this.o2.vel = this.o2.vel.add(impulseVec.multiply(-this.o2.inv_m));
        
        this.o1.angVel += this.o1.inv_inertia * Vector.cross(collArm1, impulseVec);
        this.o2.angVel -= this.o2.inv_inertia * Vector.cross(collArm2, impulseVec);
    }
}

// Seperating Axis Theorem
export function sat(o1: Shape, o2: Shape): SatResult {
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
    if (obj instanceof Circle && obj.r !== undefined) {
        obj.vertex[0] = obj.pos.add(axis.unit().multiply(-obj.r));
        obj.vertex[1] = obj.pos.add(axis.unit().multiply(obj.r));
    }
}

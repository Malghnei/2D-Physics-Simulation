export abstract class BaseSimulation {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected frameId: number | null = null;
    protected isRunning = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.onStart();
        this.loop();
    }

    stop() {
        this.isRunning = false;
        if (this.frameId !== null) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        this.onStop();
    }

    protected loop = () => {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.frameId = requestAnimationFrame(this.loop);
    }

    // Lifecycle hooks
    onStart(): void {}
    onStop(): void {}

    // Required methods
    abstract update(): void;
    abstract draw(): void;

    // Optional method to reload inputs/parameters from UI
    refresh(): void {}
}

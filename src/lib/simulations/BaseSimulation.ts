export abstract class BaseSimulation {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected frameId: number | null = null;
    public isRunning = false;

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
        this.pause();
        this.onStop();
    }
    
    pause() {
        this.isRunning = false;
        if (this.frameId !== null) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    resume() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
    }
    
    togglePause() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.resume();
        }
    }
    
    reset() {
        this.pause();
        this.refresh();
        // optionally resume or just draw one frame
        this.draw();
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

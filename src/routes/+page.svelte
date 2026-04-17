<script lang="ts">
    import { onMount } from "svelte";
    import SimulationControls from "$lib/components/SimulationControls.svelte";
    import { EngineState } from "$lib/engine/EngineState";
    import { SandboxSim } from "$lib/simulations/SandboxSim";
    import { ProjectileSim } from "$lib/simulations/ProjectileSim";
    import { BoxSlopeSim } from "$lib/simulations/BoxSlopeSim";
    import { CRTSim } from "$lib/simulations/CRTSim";
    import { DiffractionSim } from "$lib/simulations/DiffractionSim";

    let canvas: HTMLCanvasElement;
    let currentMode = 'sandbox';
    let simInstance: any = null;

    const modes = [
        { id: 'sandbox', name: 'Sandbox Collisions' },
        { id: 'projectile', name: 'Projectile Motion' },
        { id: 'boxslope', name: 'Inclined Plane' },
        { id: 'crt', name: 'CRT Electron Tracer' },
        { id: 'diffraction', name: 'Diffraction Grating' }
    ];

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowUp') EngineState.inputState.UP = true;
        if (e.key === 'ArrowDown') EngineState.inputState.DOWN = true;
        if (e.key === 'ArrowLeft') EngineState.inputState.LEFT = true;
        if (e.key === 'ArrowRight') EngineState.inputState.RIGHT = true;
    }

    function handleKeyup(e: KeyboardEvent) {
        if (e.key === 'ArrowUp') EngineState.inputState.UP = false;
        if (e.key === 'ArrowDown') EngineState.inputState.DOWN = false;
        if (e.key === 'ArrowLeft') EngineState.inputState.LEFT = false;
        if (e.key === 'ArrowRight') EngineState.inputState.RIGHT = false;
    }

    function switchMode(newMode: string) {
        if (simInstance) {
            simInstance.stop();
        }
        
        if (!canvas) return;
        
        switch(newMode) {
            case 'sandbox': simInstance = new SandboxSim(canvas); break;
            case 'projectile': simInstance = new ProjectileSim(canvas); break;
            case 'boxslope': simInstance = new BoxSlopeSim(canvas); break;
            case 'crt': simInstance = new CRTSim(canvas); break;
            case 'diffraction': simInstance = new DiffractionSim(canvas); break;
        }

        currentMode = newMode;

        if (simInstance) {
            simInstance.reset();
        }
    }

    onMount(() => {
        switchMode('sandbox');

        return () => {
            if (simInstance) simInstance.stop();
        };
    });
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="container">
    <header class="header">
        <h1>2D Physics Simulation Shenanigans</h1>
        <div class="nav-tabs">
            {#each modes as mode}
                <button 
                    class="tab-btn {currentMode === mode.id ? 'active' : ''}" 
                    on:click={() => switchMode(mode.id)}
                >
                    {mode.name}
                </button>
            {/each}
        </div>
    </header>

    {#if simInstance}
        <SimulationControls {currentMode} {simInstance} />
    {/if}

    <main class="sim-wrapper">
        <canvas bind:this={canvas} width="1000" height="600"></canvas>
    </main>

    <div class="credits">
        <p>
            Framework physics engine components inspired by <a href="https://youtube.com/playlist?list=PLo6lBZn6hgca1T7cNZXpiq4q395ljbEI_&si=kQsmeopRjL0EchDU">Danielstuts</a>. 
            Developed and ported by Malik Alghneimin.
        </p>
        <p>
            <a href="https://github.com/Malghnei/2D-Physics-Simulation">Back to Github.</a>
        </p>
    </div>
</div>

<style>
    :global(body) {
        background-color: #f0f2f5;
        margin: 0;
    }

    .container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 40px 20px;
        max-width: 1100px;
        margin: 0 auto;
        color: #333;
    }

    .header {
        margin-bottom: 30px;
        text-align: center;
    }

    .header h1 {
        margin-top: 0;
        margin-bottom: 25px;
        color: #1a1a1a;
        font-size: 2.2rem;
    }

    .nav-tabs {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
    }

    .nav-tabs button {
        padding: 12px 24px;
        background: #ffffff;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.95rem;
        color: #555;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        transition: all 0.2s ease-in-out;
    }

    .nav-tabs button:hover {
        background: #f8f9fa;
        border-color: #ced4da;
        transform: translateY(-1px);
    }

    .nav-tabs button.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
    }

    .sim-wrapper {
        display: flex;
        justify-content: center;
        background: #ffffff;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        margin: 0 auto;
        width: fit-content;
    }

    canvas {
        border: 2px solid #333;
        display: block;
        background: #fffacc;
        border-radius: 4px;
    }

    .credits {
        margin-top: 30px;
        text-align: center;
        font-size: 0.9em;
        color: #777;
        line-height: 1.5;
    }
    
    .credits a {
        color: #007bff;
        text-decoration: none;
    }

    .credits a:hover {
        text-decoration: underline;
    }
</style>
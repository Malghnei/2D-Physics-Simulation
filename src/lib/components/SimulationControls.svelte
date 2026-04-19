<script lang="ts">
    import { EngineState } from '../engine/EngineState';

    export let currentMode: string;
    export let simInstance: any;

    function refresh() {
        if (simInstance && typeof simInstance.refresh === 'function') {
            simInstance.refresh();
        }
    }
    
    function togglePause() {
        if (simInstance && typeof simInstance.togglePause === 'function') {
            simInstance.togglePause();
            // trigger svelte reactivity
            simInstance = simInstance;
        }
    }
    
    function resetSim() {
        if (simInstance && typeof simInstance.reset === 'function') {
            simInstance.reset();
            simInstance = simInstance;
        }
    }

    function startSim() {
        if (simInstance && typeof simInstance.start === 'function') {
            // start handles setting isRunning and looping
            simInstance.start();
            simInstance = simInstance;
        }
    }
    function randomizeSim() {
        if (simInstance && typeof simInstance.randomize === 'function') {
            simInstance.randomize();
            simInstance = simInstance; // trigger reactivity
        } else {
            refresh();
        }
    }
</script>

<div class="controls-panel">
    <div class="playback-controls">
        {#if currentMode !== 'diffraction'}
            {#if !simInstance.isRunning}
                <button class="btn-play" on:click={togglePause}>▶ Play</button>
            {:else}
                <button class="btn-pause" on:click={togglePause}>⏸ Pause</button>
            {/if}
            <button class="btn-reset" on:click={resetSim}>↺ Restart</button>
        {:else}
            <button class="btn-reset" on:click={randomizeSim}>Random</button>
        {/if}
    </div>

    <div class="separator"></div>

    {#if currentMode === 'sandbox'}
        <label>
            Friction: {EngineState.friction.toFixed(3)}
            <input type="range" min="0" max="0.1" step="0.001" bind:value={EngineState.friction}>
        </label>
        <label>
            Player Speed: {simInstance.playerSpeed.toFixed(2)}
            <input type="range" min="0.1" max="2" step="0.1" bind:value={simInstance.playerSpeed}>
        </label>
        <label>
            Player Mass: {simInstance.playerMass}
            <input type="range" min="0" max="20" step="1" bind:value={simInstance.playerMass} on:change={refresh}>
        </label>
        <label>
            Shapes to Spawn: {simInstance.shapeAmount}
            <input type="number" min="0" max="100" bind:value={simInstance.shapeAmount} on:change={refresh}>
        </label>
        <button on:click={refresh}>Respawn Shapes</button>
        <p class="hint">Use Arrow Keys to move the red shape.</p>
    {/if}

    {#if currentMode === 'projectile'}
        <label>
            Initial Velocity: {simInstance.initialVelocity}
            <input type="range" min="10" max="500" step="1" bind:value={simInstance.initialVelocity} on:change={refresh}>
        </label>
        <label>
            Start Height: {simInstance.startHeight}
            <input type="range" min="0" max="500" step="10" bind:value={simInstance.startHeight} on:change={refresh}>
        </label>
        <label>
            Angle (deg): {simInstance.angle}
            <input type="range" min="-90" max="90" step="1" bind:value={simInstance.angle} on:change={refresh}>
        </label>
    {/if}

    {#if currentMode === 'boxslope'}
        <label>
            Angle (deg): {simInstance.angle}
            <input type="range" min="10" max="80" step="1" bind:value={simInstance.angle} on:change={refresh}>
        </label>
        <label>
            Friction Coeff: {simInstance.frictionCoefficient.toFixed(2)}
            <input type="range" min="0" max="1" step="0.05" bind:value={simInstance.frictionCoefficient} on:change={refresh}>
        </label>
    {/if}

    {#if currentMode === 'crt'}
        <label>
            Length of Plates (cm): {simInstance.length}
            <input type="range" min="1" max="30" step="1" bind:value={simInstance.length} on:change={refresh}>
        </label>
        <label>
            Dist. Between (cm): {simInstance.distanceBetween}
            <input type="range" min="1" max="30" step="1" bind:value={simInstance.distanceBetween} on:change={refresh}>
        </label>
        <label>
            Potential Diff (V): {simInstance.potentialDifference}
            <input type="range" min="100" max="1000" step="10" bind:value={simInstance.potentialDifference} on:change={refresh}>
        </label>
        <label>
            Initial Speed: {(simInstance.initialSpeed / 1000000).toFixed(1)}M m/s
            <input type="range" min="100000" max="5000000" step="100000" bind:value={simInstance.initialSpeed} on:change={refresh}>
        </label>
    {/if}

    {#if currentMode === 'diffraction'}
        <label>
            Wavelength (nm): {simInstance.wavelength}
            <input type="range" min="300" max="800" step="10" bind:value={simInstance.wavelength} on:change={refresh}>
        </label>
        <label>
            Spacing (nm): {simInstance.spacing}
            <input type="range" min="10" max="100" step="1" bind:value={simInstance.spacing} on:change={refresh}>
        </label>
        <label>
            Distance (m): {simInstance.distance.toFixed(2)}
            <input type="range" min="0.01" max="1" step="0.01" bind:value={simInstance.distance} on:change={refresh}>
        </label>
    {/if}
</div>

<style>
    .controls-panel {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        background: #fdfdfd;
        border-radius: 8px;
        border: 1px solid #ccc;
    }

    .playback-controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .separator {
        width: 2px;
        height: 40px;
        background: #ddd;
        margin: 0 5px;
    }

    .controls-panel label {
        display: flex;
        flex-direction: column;
        font-size: 0.9em;
        font-weight: bold;
        min-width: 120px;
    }

    .controls-panel button {
        padding: 8px 16px;
        font-weight: bold;
        cursor: pointer;
        color: white;
        border: none;
        border-radius: 4px;
        height: min-content;
        transition: transform 0.1s, background 0.1s;
    }
    
    .controls-panel button:active {
        transform: scale(0.95);
    }

    .btn-play { background: #28a745; }
    .btn-play:hover { background: #218838; }
    
    .btn-pause { background: #ffc107; color: black !important; }
    .btn-pause:hover { background: #e0a800; }

    .btn-reset { background: #17a2b8; }
    .btn-reset:hover { background: #138496; }

    /* Default buttons */
    .controls-panel > button {
        background: #007bff;
    }
    .controls-panel > button:hover {
        background: #0056b3;
    }

    .hint {
        font-size: 0.8em;
        color: #555;
        margin: 0;
        align-self: center;
    }
</style>

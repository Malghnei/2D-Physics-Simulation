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
            <span>Friction</span>
            <div class="input-group">
                <input type="number" min="0" max="0.1" step="0.001" bind:value={EngineState.friction}>
                <input type="range" min="0" max="0.1" step="0.001" bind:value={EngineState.friction}>
            </div>
        </label>
        <label>
            <span>Player Speed</span>
            <div class="input-group">
                <input type="number" min="0.1" max="2" step="0.1" bind:value={simInstance.playerSpeed}>
                <input type="range" min="0.1" max="2" step="0.1" bind:value={simInstance.playerSpeed}>
            </div>
        </label>
        <label>
            <span>Player Mass</span>
            <div class="input-group">
                <input type="number" min="0" max="20" step="1" bind:value={simInstance.playerMass} on:change={refresh}>
                <input type="range" min="0" max="20" step="1" bind:value={simInstance.playerMass} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Shapes to Spawn</span>
            <div class="input-group">
                <input type="number" min="0" max="100" step="1" bind:value={simInstance.shapeAmount} on:change={refresh}>
                <input type="range" min="0" max="100" step="1" bind:value={simInstance.shapeAmount} on:change={refresh}>
            </div>
        </label>
        <button on:click={refresh}>Respawn Shapes</button>
        <p class="hint">Use Arrow Keys to move the red shape.</p>
    {/if}

    {#if currentMode === 'projectile'}
        <label>
            <span>Initial Velocity</span>
            <div class="input-group">
                <input type="number" min="10" max="500" step="1" bind:value={simInstance.initialVelocity} on:change={refresh}>
                <input type="range" min="10" max="500" step="1" bind:value={simInstance.initialVelocity} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Start Height</span>
            <div class="input-group">
                <input type="number" min="0" max="500" step="10" bind:value={simInstance.startHeight} on:change={refresh}>
                <input type="range" min="0" max="500" step="10" bind:value={simInstance.startHeight} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Angle (deg)</span>
            <div class="input-group">
                <input type="number" min="-90" max="90" step="1" bind:value={simInstance.angle} on:change={refresh}>
                <input type="range" min="-90" max="90" step="1" bind:value={simInstance.angle} on:change={refresh}>
            </div>
        </label>
    {/if}

    {#if currentMode === 'boxslope'}
        <label>
            <span>Angle (deg)</span>
            <div class="input-group">
                <input type="number" min="10" max="80" step="1" bind:value={simInstance.angle} on:change={refresh}>
                <input type="range" min="10" max="80" step="1" bind:value={simInstance.angle} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Friction Coeff</span>
            <div class="input-group">
                <input type="number" min="0" max="1" step="0.05" bind:value={simInstance.frictionCoefficient} on:change={refresh}>
                <input type="range" min="0" max="1" step="0.05" bind:value={simInstance.frictionCoefficient} on:change={refresh}>
            </div>
        </label>
    {/if}

    {#if currentMode === 'crt'}
        <label>
            <span>Length of Plates (cm)</span>
            <div class="input-group">
                <input type="number" min="1" max="30" step="1" bind:value={simInstance.length} on:change={refresh}>
                <input type="range" min="1" max="30" step="1" bind:value={simInstance.length} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Dist. Between (cm)</span>
            <div class="input-group">
                <input type="number" min="1" max="30" step="1" bind:value={simInstance.distanceBetween} on:change={refresh}>
                <input type="range" min="1" max="30" step="1" bind:value={simInstance.distanceBetween} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Potential Diff (V)</span>
            <div class="input-group">
                <input type="number" min="100" max="1000" step="10" bind:value={simInstance.potentialDifference} on:change={refresh}>
                <input type="range" min="100" max="1000" step="10" bind:value={simInstance.potentialDifference} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Initial Speed (m/s)</span>
            <div class="input-group">
                <input type="number" min="100000" max="5000000" step="100000" bind:value={simInstance.initialSpeed} on:change={refresh}>
                <input type="range" min="100000" max="5000000" step="100000" bind:value={simInstance.initialSpeed} on:change={refresh}>
            </div>
        </label>
    {/if}

    {#if currentMode === 'diffraction'}
        <label>
            <span>Wavelength (nm)</span>
            <div class="input-group">
                <input type="number" min="300" max="800" step="10" bind:value={simInstance.wavelength} on:change={refresh}>
                <input type="range" min="300" max="800" step="10" bind:value={simInstance.wavelength} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Spacing (nm)</span>
            <div class="input-group">
                <input type="number" min="10" max="100" step="1" bind:value={simInstance.spacing} on:change={refresh}>
                <input type="range" min="10" max="100" step="1" bind:value={simInstance.spacing} on:change={refresh}>
            </div>
        </label>
        <label>
            <span>Distance (m)</span>
            <div class="input-group">
                <input type="number" min="0.01" max="1" step="0.01" bind:value={simInstance.distance} on:change={refresh}>
                <input type="range" min="0.01" max="1" step="0.01" bind:value={simInstance.distance} on:change={refresh}>
            </div>
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

    .controls-panel label > span {
        margin-bottom: 2px;
        display: block;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;
    }
    
    .input-group input[type="number"] {
        padding: 4px 6px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.9em;
        width: 100%;
        box-sizing: border-box;
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

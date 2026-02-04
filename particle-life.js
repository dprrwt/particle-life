/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PARTICLE LIFE — Emergent Behavior Simulation
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Simple rules, complex behaviors. Life emerges from attraction and repulsion.
 * 
 * Inspired by Jeffrey Ventrella's "Clusters" and Tom Mohr's "Particle Life"
 * Built for dprrwt.me portfolio
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Particle settings
    particleCount: 1500,
    particleRadius: 2.5,
    colors: [
        '#ff4757', // Red
        '#2ed573', // Green
        '#3498ff', // Blue
        '#ffc312', // Yellow
        '#a55eea', // Purple
        '#00d2d3', // Cyan
    ],
    
    // Physics
    maxForce: 1,
    friction: 0.5,
    interactionRadius: 80,
    
    // Visual
    trails: true,
    trailAlpha: 0.08,
    glow: true,
    wrap: true,
    
    // Simulation
    speed: 1,
    paused: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Presets — Different emergent behaviors
// ═══════════════════════════════════════════════════════════════════════════════

const PRESETS = {
    random: () => generateRandomRules(),
    
    cells: () => ({
        // Same colors attract, different repel slightly
        matrix: [
            [ 0.8, -0.2, -0.2, -0.2, -0.2, -0.2],
            [-0.2,  0.8, -0.2, -0.2, -0.2, -0.2],
            [-0.2, -0.2,  0.8, -0.2, -0.2, -0.2],
            [-0.2, -0.2, -0.2,  0.8, -0.2, -0.2],
            [-0.2, -0.2, -0.2, -0.2,  0.8, -0.2],
            [-0.2, -0.2, -0.2, -0.2, -0.2,  0.8],
        ]
    }),
    
    swarm: () => ({
        // Everyone follows green, green follows red
        matrix: [
            [ 0.1, -0.5,  0.5,  0.3,  0.3,  0.3],
            [ 0.8,  0.1, -0.1, -0.1, -0.1, -0.1],
            [ 0.3,  0.6,  0.1, -0.1, -0.1, -0.1],
            [ 0.3,  0.6, -0.1,  0.1, -0.1, -0.1],
            [ 0.3,  0.6, -0.1, -0.1,  0.1, -0.1],
            [ 0.3,  0.6, -0.1, -0.1, -0.1,  0.1],
        ]
    }),
    
    predator: () => ({
        // Red chases green, green chases blue, blue chases red
        matrix: [
            [ 0.1,  0.8, -0.5,  0.0,  0.0,  0.0],
            [-0.8,  0.1,  0.8,  0.0,  0.0,  0.0],
            [ 0.8, -0.8,  0.1,  0.0,  0.0,  0.0],
            [ 0.0,  0.0,  0.0,  0.5, -0.3, -0.3],
            [ 0.0,  0.0,  0.0, -0.3,  0.5, -0.3],
            [ 0.0,  0.0,  0.0, -0.3, -0.3,  0.5],
        ]
    }),
    
    symbiosis: () => ({
        // Pairs that attract each other
        matrix: [
            [ 0.2,  0.7, -0.3, -0.3,  0.0,  0.0],
            [ 0.7,  0.2, -0.3, -0.3,  0.0,  0.0],
            [-0.3, -0.3,  0.2,  0.7,  0.0,  0.0],
            [-0.3, -0.3,  0.7,  0.2,  0.0,  0.0],
            [ 0.0,  0.0,  0.0,  0.0,  0.2,  0.7],
            [ 0.0,  0.0,  0.0,  0.0,  0.7,  0.2],
        ]
    }),
    
    chains: () => ({
        // Creates chain-like structures
        matrix: [
            [ 0.3,  0.5, -0.3, -0.3, -0.3, -0.3],
            [-0.5,  0.3,  0.5, -0.3, -0.3, -0.3],
            [-0.3, -0.5,  0.3,  0.5, -0.3, -0.3],
            [-0.3, -0.3, -0.5,  0.3,  0.5, -0.3],
            [-0.3, -0.3, -0.3, -0.5,  0.3,  0.5],
            [ 0.5, -0.3, -0.3, -0.3, -0.5,  0.3],
        ]
    }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════════════════

let canvas, ctx;
let particles = [];
let rules = { matrix: [] };
let width, height;
let lastTime = 0;
let frameCount = 0;
let fpsDisplay = 60;
let spatialHash = {};
let cellSize = CONFIG.interactionRadius;

// ═══════════════════════════════════════════════════════════════════════════════
// Particle Class
// ═══════════════════════════════════════════════════════════════════════════════

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = type;
        this.color = CONFIG.colors[type];
    }
    
    update(dt) {
        // Apply velocity
        this.x += this.vx * dt * CONFIG.speed;
        this.y += this.vy * dt * CONFIG.speed;
        
        // Apply friction
        this.vx *= (1 - CONFIG.friction * dt);
        this.vy *= (1 - CONFIG.friction * dt);
        
        // Boundary handling
        if (CONFIG.wrap) {
            // Wrap around
            if (this.x < 0) this.x += width;
            if (this.x >= width) this.x -= width;
            if (this.y < 0) this.y += height;
            if (this.y >= height) this.y -= height;
        } else {
            // Bounce
            if (this.x < 0 || this.x >= width) {
                this.vx *= -0.8;
                this.x = Math.max(0, Math.min(width - 1, this.x));
            }
            if (this.y < 0 || this.y >= height) {
                this.vy *= -0.8;
                this.y = Math.max(0, Math.min(height - 1, this.y));
            }
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONFIG.particleRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Spatial Hashing for Performance
// ═══════════════════════════════════════════════════════════════════════════════

function buildSpatialHash() {
    spatialHash = {};
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cellX = Math.floor(p.x / cellSize);
        const cellY = Math.floor(p.y / cellSize);
        const key = `${cellX},${cellY}`;
        
        if (!spatialHash[key]) {
            spatialHash[key] = [];
        }
        spatialHash[key].push(i);
    }
}

function getNeighbors(particle) {
    const neighbors = [];
    const cellX = Math.floor(particle.x / cellSize);
    const cellY = Math.floor(particle.y / cellSize);
    
    // Check surrounding cells
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let nx = cellX + dx;
            let ny = cellY + dy;
            
            // Handle wrapping
            if (CONFIG.wrap) {
                const maxCellX = Math.ceil(width / cellSize);
                const maxCellY = Math.ceil(height / cellSize);
                if (nx < 0) nx += maxCellX;
                if (nx >= maxCellX) nx -= maxCellX;
                if (ny < 0) ny += maxCellY;
                if (ny >= maxCellY) ny -= maxCellY;
            }
            
            const key = `${nx},${ny}`;
            if (spatialHash[key]) {
                neighbors.push(...spatialHash[key]);
            }
        }
    }
    
    return neighbors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Physics
// ═══════════════════════════════════════════════════════════════════════════════

function applyForces() {
    buildSpatialHash();
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let fx = 0;
        let fy = 0;
        
        const neighbors = getNeighbors(p);
        
        for (const j of neighbors) {
            if (i === j) continue;
            
            const other = particles[j];
            
            // Calculate distance (handle wrapping)
            let dx = other.x - p.x;
            let dy = other.y - p.y;
            
            if (CONFIG.wrap) {
                if (dx > width / 2) dx -= width;
                if (dx < -width / 2) dx += width;
                if (dy > height / 2) dy -= height;
                if (dy < -height / 2) dy += height;
            }
            
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);
            
            if (dist < CONFIG.interactionRadius && dist > 0) {
                // Get interaction strength from rules matrix
                const strength = rules.matrix[p.type][other.type];
                
                // Force calculation with smooth falloff
                // Strong repulsion at very close range, attraction/repulsion at medium range
                let force;
                const minDist = CONFIG.particleRadius * 4;
                
                if (dist < minDist) {
                    // Repulsion zone - prevents overlap
                    force = (dist / minDist - 1) * CONFIG.maxForce;
                } else {
                    // Interaction zone - attraction or repulsion based on rules
                    const normalizedDist = (dist - minDist) / (CONFIG.interactionRadius - minDist);
                    force = strength * (1 - normalizedDist) * CONFIG.maxForce;
                }
                
                // Apply force
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
            }
        }
        
        // Update velocity
        p.vx += fx;
        p.vy += fy;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Rule Generation
// ═══════════════════════════════════════════════════════════════════════════════

function generateRandomRules() {
    const numTypes = CONFIG.colors.length;
    const matrix = [];
    
    for (let i = 0; i < numTypes; i++) {
        matrix[i] = [];
        for (let j = 0; j < numTypes; j++) {
            // Random value between -1 and 1
            matrix[i][j] = Math.random() * 2 - 1;
        }
    }
    
    return { matrix };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Particle Management
// ═══════════════════════════════════════════════════════════════════════════════

function createParticles(count) {
    particles = [];
    const numTypes = CONFIG.colors.length;
    
    for (let i = 0; i < count; i++) {
        const type = Math.floor(Math.random() * numTypes);
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push(new Particle(x, y, type));
    }
}

function spawnParticles(x, y, count = 20) {
    const numTypes = CONFIG.colors.length;
    
    for (let i = 0; i < count; i++) {
        const type = Math.floor(Math.random() * numTypes);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 30;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        particles.push(new Particle(px, py, type));
    }
    
    updateParticleStats();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Rendering
// ═══════════════════════════════════════════════════════════════════════════════

function draw() {
    // Trail effect
    if (CONFIG.trails) {
        ctx.fillStyle = `rgba(10, 10, 15, ${CONFIG.trailAlpha})`;
        ctx.fillRect(0, 0, width, height);
    } else {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
    }
    
    // Set glow effect
    if (CONFIG.glow) {
        ctx.shadowBlur = 8;
    } else {
        ctx.shadowBlur = 0;
    }
    
    // Draw particles
    for (const particle of particles) {
        if (CONFIG.glow) {
            ctx.shadowColor = particle.color;
        }
        particle.draw();
    }
    
    // Reset shadow for UI
    ctx.shadowBlur = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Animation Loop
// ═══════════════════════════════════════════════════════════════════════════════

function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // FPS calculation
    frameCount++;
    if (currentTime - lastTime >= 1000) {
        fpsDisplay = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        document.getElementById('fps').textContent = `${fpsDisplay} FPS`;
    }
    
    if (!CONFIG.paused) {
        // Physics step
        applyForces();
        
        // Update particles
        const dt = 1;
        for (const particle of particles) {
            particle.update(dt);
        }
    }
    
    // Draw
    draw();
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI Functions
// ═══════════════════════════════════════════════════════════════════════════════

function updatePlayPauseButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (CONFIG.paused) {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
        document.body.classList.add('paused');
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
        document.body.classList.remove('paused');
    }
}

function updateParticleStats() {
    document.getElementById('particle-stats').textContent = `${particles.length} particles`;
}

function buildMatrixUI() {
    const container = document.getElementById('matrix-container');
    const numTypes = CONFIG.colors.length;
    
    let html = '<table class="matrix-table"><tr><th></th>';
    
    // Header row with color dots
    for (let i = 0; i < numTypes; i++) {
        html += `<th><span class="color-dot" style="background:${CONFIG.colors[i]}"></span></th>`;
    }
    html += '</tr>';
    
    // Matrix rows
    for (let i = 0; i < numTypes; i++) {
        html += `<tr><th><span class="color-dot" style="background:${CONFIG.colors[i]}"></span></th>`;
        for (let j = 0; j < numTypes; j++) {
            const value = rules.matrix[i][j].toFixed(2);
            const className = rules.matrix[i][j] > 0 ? 'positive' : (rules.matrix[i][j] < 0 ? 'negative' : '');
            html += `<td class="matrix-cell"><input type="number" class="matrix-input ${className}" data-i="${i}" data-j="${j}" value="${value}" min="-1" max="1" step="0.1"></td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    container.innerHTML = html;
    
    // Add input listeners
    container.querySelectorAll('.matrix-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) || 0;
            e.target.className = 'matrix-input ' + (value > 0 ? 'positive' : (value < 0 ? 'negative' : ''));
        });
    });
}

function applyMatrixFromUI() {
    const inputs = document.querySelectorAll('.matrix-input');
    inputs.forEach(input => {
        const i = parseInt(input.dataset.i);
        const j = parseInt(input.dataset.j);
        rules.matrix[i][j] = Math.max(-1, Math.min(1, parseFloat(input.value) || 0));
    });
}

function showMatrix() {
    buildMatrixUI();
    document.getElementById('matrix-modal').classList.add('visible');
}

function hideMatrix() {
    document.getElementById('matrix-modal').classList.remove('visible');
}

function setPreset(name) {
    // Update active preset button
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === name);
    });
    
    // Apply preset
    rules = PRESETS[name]();
}

function reset() {
    createParticles(CONFIG.particleCount);
    updateParticleStats();
}

function randomize() {
    setPreset('random');
    reset();
}

function toggleControls() {
    document.querySelector('.controls').classList.toggle('hidden');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Event Listeners
// ═══════════════════════════════════════════════════════════════════════════════

function setupEventListeners() {
    // Play/Pause
    document.getElementById('play-pause').addEventListener('click', () => {
        CONFIG.paused = !CONFIG.paused;
        updatePlayPauseButton();
    });
    
    // Reset
    document.getElementById('reset').addEventListener('click', reset);
    
    // Randomize
    document.getElementById('randomize').addEventListener('click', randomize);
    
    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setPreset(btn.dataset.preset);
        });
    });
    
    // Particle count slider
    const particleSlider = document.getElementById('particle-count');
    const particleDisplay = document.getElementById('particle-count-display');
    particleSlider.addEventListener('input', (e) => {
        const count = parseInt(e.target.value);
        particleDisplay.textContent = count;
        CONFIG.particleCount = count;
    });
    particleSlider.addEventListener('change', () => {
        createParticles(CONFIG.particleCount);
        updateParticleStats();
    });
    
    // Speed slider
    const speedSlider = document.getElementById('speed');
    const speedDisplay = document.getElementById('speed-display');
    speedSlider.addEventListener('input', (e) => {
        CONFIG.speed = parseFloat(e.target.value);
        speedDisplay.textContent = CONFIG.speed.toFixed(1);
    });
    
    // Visual toggles
    document.getElementById('trails').addEventListener('change', (e) => {
        CONFIG.trails = e.target.checked;
    });
    document.getElementById('glow').addEventListener('change', (e) => {
        CONFIG.glow = e.target.checked;
    });
    document.getElementById('wrap').addEventListener('change', (e) => {
        CONFIG.wrap = e.target.checked;
    });
    
    // Matrix modal
    document.getElementById('show-matrix').addEventListener('click', showMatrix);
    document.getElementById('close-matrix').addEventListener('click', hideMatrix);
    document.getElementById('apply-matrix').addEventListener('click', () => {
        applyMatrixFromUI();
        hideMatrix();
    });
    document.getElementById('randomize-matrix').addEventListener('click', () => {
        rules = generateRandomRules();
        buildMatrixUI();
    });
    
    // Toggle controls
    document.getElementById('toggle-controls').addEventListener('click', toggleControls);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                CONFIG.paused = !CONFIG.paused;
                updatePlayPauseButton();
                break;
            case 'r':
                reset();
                break;
            case 'n':
                randomize();
                break;
            case 'h':
                toggleControls();
                break;
            case 'm':
                if (document.getElementById('matrix-modal').classList.contains('visible')) {
                    hideMatrix();
                } else {
                    showMatrix();
                }
                break;
            case 'escape':
                hideMatrix();
                break;
        }
    });
    
    // Click to spawn
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spawnParticles(x, y, 30);
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Generate initial rules
    rules = generateRandomRules();
    
    // Create particles
    createParticles(CONFIG.particleCount);
    updateParticleStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start animation
    requestAnimationFrame(animate);
    
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                    PARTICLE LIFE                          ║
    ║           Emergent Behavior Simulation                    ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  SPACE    Play/Pause                                      ║
    ║  R        Reset particles                                 ║
    ║  N        New random rules                                ║
    ║  H        Hide/Show controls                              ║
    ║  M        Open/Close rule matrix                          ║
    ║  CLICK    Spawn particles                                 ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Built for dprrwt.me                                      ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
}

// Start
init();

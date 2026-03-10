// Get canvas and context
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// Get UI elements
const stepSpan = document.getElementById('stepCount');
const conflictSpan = document.getElementById('conflictCount');
const statusDiv = document.getElementById('status');
const playPauseBtn = document.getElementById('playPauseBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const nInput = document.getElementById('nInput');
const startBtn = document.getElementById('startBtn');
const stepBtn = document.getElementById('stepBtn');
const randomizeBtn = document.getElementById('randomizeBtn');

// Game state
let n = 8;
let queens = [];
let conflicts = [];
let stepCount = 0;
let isPaused = false;
let isSolved_flag = false;
let speed = 10;
let animationTimer = null;

// Speed slider event
speedSlider.addEventListener('input', function() {
    speed = parseInt(this.value);
    speedValue.textContent = speed + ' steps/sec';
    
    // Restart animation with new speed
    if (animationTimer) {
        clearInterval(animationTimer);
        startAnimation();
    }
});

// Button event listeners
startBtn.addEventListener('click', reset);
stepBtn.addEventListener('click', function() {
    if (!isSolved_flag) {
        step();
    }
});
randomizeBtn.addEventListener('click', randomize);
playPauseBtn.addEventListener('click', togglePlay);

// Initialize board
function init() {
    queens = [];
    for (let i = 0; i < n; i++) {
        queens.push(Math.floor(Math.random() * n));
    }
    calculateConflicts();
    stepCount = 0;
    isSolved_flag = checkSolved();
    updateUI();
    draw();
}

// Calculate conflicts
function calculateConflicts() {
    conflicts = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            // Same column
            if (queens[i] === queens[j]) {
                conflicts[i]++;
                conflicts[j]++;
            }
            // Same diagonal
            if (Math.abs(queens[i] - queens[j]) === Math.abs(i - j)) {
                conflicts[i]++;
                conflicts[j]++;
            }
        }
    }
}

// Total conflicts
function totalConflicts() {
    let total = 0;
    for (let i = 0; i < n; i++) {
        total += conflicts[i];
    }
    return total;
}

// Check if solved
function checkSolved() {
    return totalConflicts() === 0;
}

// Update UI
function updateUI() {
    stepSpan.textContent = stepCount;
    conflictSpan.textContent = totalConflicts();
    
    if (isSolved_flag) {
        statusDiv.textContent = '🎉 SOLVED! 🎉';
        statusDiv.className = 'status-solved';
        if (animationTimer) {
            clearInterval(animationTimer);
            animationTimer = null;
        }
    } else {
        statusDiv.textContent = 'Solving...';
        statusDiv.className = 'status-solving';
    }
}

// One step of the algorithm
function step() {
    if (isSolved_flag) return;
    
    // Find conflicting queens
    let withConflicts = [];
    for (let i = 0; i < n; i++) {
        if (conflicts[i] > 0) {
            withConflicts.push(i);
        }
    }
    
    if (withConflicts.length === 0) {
        isSolved_flag = true;
        updateUI();
        return;
    }
    
    // Pick random conflicting queen
    let row = withConflicts[Math.floor(Math.random() * withConflicts.length)];
    
    // Find best column for this queen
    let bestConflicts = n * n;
    let bestCols = [];
    
    for (let col = 0; col < n; col++) {
        // Test this position
        let testConflicts = 0;
        
        for (let r = 0; r < n; r++) {
            if (r === row) continue;
            
            if (queens[r] === col) testConflicts++;
            if (Math.abs(queens[r] - col) === Math.abs(r - row)) testConflicts++;
        }
        
        if (testConflicts < bestConflicts) {
            bestConflicts = testConflicts;
            bestCols = [col];
        } else if (testConflicts === bestConflicts) {
            bestCols.push(col);
        }
    }
    
    // Move queen to best column
    let newCol = bestCols[Math.floor(Math.random() * bestCols.length)];
    queens[row] = newCol;
    
    // Recalculate conflicts
    calculateConflicts();
    stepCount++;
    isSolved_flag = checkSolved();
    
    // Update display
    updateUI();
    draw();
}

// Draw the board
function draw() {
    const size = 400;
    const cellSize = size / n;
    
    ctx.clearRect(0, 0, size, size);
    
    // Draw grid
    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            // Chessboard pattern
            if ((row + col) % 2 === 0) {
                ctx.fillStyle = '#f0f0f0';
            } else {
                ctx.fillStyle = '#808080';
            }
            
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
    
    // Draw queens
    for (let row = 0; row < n; row++) {
        let col = queens[row];
        let x = col * cellSize + cellSize / 2;
        let y = row * cellSize + cellSize / 2;
        let radius = cellSize / 3;
        
        // Color based on conflict
        if (conflicts[row] > 0) {
            ctx.fillStyle = '#ff4444';  // Red for conflicts
        } else {
            ctx.fillStyle = '#4444ff';  // Blue for safe
        }
        
        // Draw queen circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
        // Draw Q
        ctx.fillStyle = 'white';
        ctx.font = `${radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Q', x, y);
        
        // Show conflict count if > 0
        if (conflicts[row] > 0) {
            ctx.fillStyle = 'black';
            ctx.font = `${radius/2}px Arial`;
            ctx.fillText(conflicts[row], x + radius/2, y - radius/2);
        }
    }
}

// Animation function
function startAnimation() {
    if (animationTimer) clearInterval(animationTimer);
    
    animationTimer = setInterval(() => {
        if (!isPaused && !isSolved_flag) {
            step();
        }
    }, 1000 / speed);
}

// Toggle play/pause
function togglePlay() {
    isPaused = !isPaused;
    playPauseBtn.textContent = isPaused ? '▶️ Play' : '⏸️ Pause';
}

// Randomize board
function randomize() {
    init();
    if (!isPaused && animationTimer) {
        startAnimation();
    }
}

// Reset with new N
function reset() {
    n = parseInt(nInput.value);
    if (n < 4) n = 4;
    if (n > 20) n = 20;
    nInput.value = n;
    
    // Adjust canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Reset state
    isPaused = false;
    isSolved_flag = false;
    playPauseBtn.textContent = '⏸️ Pause';
    
    // Initialize new board
    init();
    
    // Restart animation
    if (animationTimer) {
        clearInterval(animationTimer);
    }
    startAnimation();
}

// Start everything when page loads
window.addEventListener('load', () => {
    reset();
});

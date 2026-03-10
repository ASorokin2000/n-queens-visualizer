// Get canvas and context
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// Get UI elements
const stepSpan = document.getElementById('stepCount');
const conflictSpan = document.getElementById('conflictCount');
const attemptSpan = document.getElementById('attemptCount');
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
let attemptCount = 1;
let isPaused = false;
let isSolved_flag = false;
let speed = 10;
let animationTimer = null;

// Stall detection
let lastConflicts = 0;
let stallCounter = 0;
const STALL_THRESHOLD = 50; // Number of steps without improvement before restart

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
    lastConflicts = totalConflicts();
    stallCounter = 0;
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
    if (attemptSpan) attemptSpan.textContent = attemptCount;
    
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

// Check for stall and restart if needed
function checkForStall() {
    const currentConflicts = totalConflicts();
    
    if (currentConflicts === 0) {
        isSolved_flag = true;
        return false;
    }
    
    if (currentConflicts >= lastConflicts) {
        stallCounter++;
        if (stallCounter >= STALL_THRESHOLD) {
            // Stall detected - restart with new random board
            attemptCount++;
            console.log(`Stall detected! Restarting attempt #${attemptCount}`);
            
            // Visual indication of restart
            statusDiv.textContent = `🔄 Restarting attempt #${attemptCount}...`;
            
            // Short delay before restart (so user can see)
            setTimeout(() => {
                init();
                draw();
            }, 500);
            
            return true; // Restart initiated
        }
    } else {
        // Improvement! Reset stall counter
        stallCounter = 0;
    }
    
    lastConflicts = currentConflicts;
    return false;
}

// One step of the algorithm
function step() {
    if (isSolved_flag) return;
    
    // Check for stall before proceeding
    if (checkForStall()) {
        return; // Restart was initiated
    }
    
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

// Draw the board with bold conflict visualization
function draw() {
    const size = 400;
    const cellSize = size / n;
    
    ctx.clearRect(0, 0, size, size);
    
    // Draw chessboard
    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const x = col * cellSize;
            const y = row * cellSize;
            
            // Classic chessboard colors
            if ((row + col) % 2 === 0) {
                ctx.fillStyle = '#f0d9b5';  // Light square
            } else {
                ctx.fillStyle = '#b58863';  // Dark square
            }
            
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Grid lines
            ctx.strokeStyle = '#8b5a2b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
    
    // Draw queens
    for (let row = 0; row < n; row++) {
        const col = queens[row];
        const x = col * cellSize;
        const y = row * cellSize;
        
        if (conflicts[row] > 0) {
            // QUEEN WITH CONFLICT - FULL RED SQUARE
            ctx.fillStyle = '#ff4444';  // Bright red
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Add a pattern to make it more visible
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let i = 0; i < cellSize; i += 10) {
                ctx.fillRect(x + i, y, 2, cellSize);
            }
            
            // Draw the conflict number LARGE
            ctx.fillStyle = 'white';
            ctx.font = `bold ${cellSize * 0.7}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(conflicts[row], x + cellSize/2, y + cellSize/2);
            
            // Add a small queen symbol in corner
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = `${cellSize * 0.25}px Arial`;
            ctx.fillText('♕', x + cellSize * 0.15, y + cellSize * 0.15);
            
        } else {
            // SAFE QUEEN - ELEGANT BLUE
            const centerX = x + cellSize/2;
            const centerY = y + cellSize/2;
            const radius = cellSize * 0.4;
            
            // Blue gradient for safe queen
            const gradient = ctx.createRadialGradient(
                centerX - 3, centerY - 3, 5,
                centerX, centerY, radius + 5
            );
            gradient.addColorStop(0, '#4dabf7');
            gradient.addColorStop(1, '#1971c2');
            
            // Draw queen circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Add highlight
            ctx.beginPath();
            ctx.arc(centerX - 3, centerY - 3, radius/3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
            
            // Draw crown
            ctx.fillStyle = '#ffd700';  // Gold
            ctx.font = `${radius * 0.8}px "Segoe UI", "Arial Unicode MS", Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♕', centerX, centerY - 2);
            
            // Add a subtle glow for safe queens
            ctx.shadowColor = '#4dabf7';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#4dabf7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.shadowColor = 'transparent';
        }
    }
    
    // Draw attempt counter
    if (attemptCount > 1 && !isSolved_flag) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Attempt #${attemptCount}`, size-10, 30);
        
        // Add stall warning if close to restart
        if (stallCounter > STALL_THRESHOLD * 0.7) {
            ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`⚠️ Stalled...`, 10, 30);
        }
    }
    
    // Draw solved celebration
    if (isSolved_flag) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';  // Gold overlay
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓ SOLVED ✓', size/2, size/2);
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
    attemptCount = 1; // Reset attempt counter on manual randomize
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
    attemptCount = 1;
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

cclass NQueensVisualizer {
    constructor() {
        this.canvas = document.getElementById('board-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Default values
        this.n = 8;
        this.cellSize = 60;
        this.boardSize = this.n * this.cellSize;
        
        // Set canvas size
        this.canvas.width = this.boardSize;
        this.canvas.height = this.boardSize;
        
        // Algorithm state
        this.queens = [];
        this.colConflicts = [];
        this.diag1Conflicts = [];
        this.diag2Conflicts = [];
        this.conflicts = [];
        
        // Animation state - FIXED: Better animation control
        this.step = 0;
        this.attempt = 1;
        this.solved = false;
        this.paused = false;
        this.speed = 10;
        this.animationId = null;  // Store animation ID
        this.lastUpdate = 0;
        this.animationRunning = false;  // Track if animation is running
        
        // UI elements
        this.stepsSpan = document.getElementById('steps-count');
        this.conflictsSpan = document.getElementById('conflicts-count');
        this.attemptSpan = document.getElementById('attempt-count');
        this.statusSpan = document.getElementById('status');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedValue = document.getElementById('speed-value');
        this.nInput = document.getElementById('n-input');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.stepSolution = this.stepSolution.bind(this);
        this.randomize = this.randomize.bind(this);
        this.reset = this.reset.bind(this);
        this.togglePause = this.togglePause.bind(this);
        this.startAnimation = this.startAnimation.bind(this);
        this.stopAnimation = this.stopAnimation.bind(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize board
        this.randomize();
        
        // Start animation immediately
        this.startAnimation();
    }
    
    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            const newN = parseInt(this.nInput.value);
            if (newN >= 4 && newN <= 30) {
                this.n = newN;
                this.reset();
            } else {
                alert('Please enter a number between 4 and 30');
            }
        });
        
        this.playPauseBtn.addEventListener('click', this.togglePause);
        
        document.getElementById('step-btn').addEventListener('click', () => {
            // Pause animation when manually stepping
            this.paused = true;
            this.playPauseBtn.textContent = '▶️ Play';
            this.stopAnimation();
            this.stepSolution();
            this.draw();
        });
        
        document.getElementById('randomize-btn').addEventListener('click', () => {
            this.randomize();
            this.draw();
            // Restart animation if it was running
            if (!this.paused && !this.animationRunning) {
                this.startAnimation();
            }
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
            this.draw();
            // Restart animation if it was running
            if (!this.paused && !this.animationRunning) {
                this.startAnimation();
            }
        });
        
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.speedValue.textContent = `${this.speed} steps/sec`;
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.adjustCanvasSize();
            this.draw();
        });
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden, stop animation to save resources
                this.stopAnimation();
            } else {
                // Page visible again, restart if not paused
                if (!this.paused && !this.solved) {
                    this.startAnimation();
                }
            }
        });
    }
    
    // NEW: Start animation loop
    startAnimation() {
        if (this.animationRunning) return;
        this.animationRunning = true;
        this.lastUpdate = performance.now();
        this.animate();
    }
    
    // NEW: Stop animation loop
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.animationRunning = false;
    }
    
    // FIXED: Better toggle pause
    togglePause() {
        this.paused = !this.paused;
        this.playPauseBtn.textContent = this.paused ? '▶️ Play' : '⏸️ Pause';
        
        if (this.paused) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }
    
    adjustCanvasSize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const maxSize = Math.min(containerWidth, 600);
        this.cellSize = Math.floor(maxSize / this.n);
        this.boardSize = this.n * this.cellSize;
        this.canvas.width = this.boardSize;
        this.canvas.height = this.boardSize;
        this.canvas.style.width = `${this.boardSize}px`;
        this.canvas.style.height = `${this.boardSize}px`;
    }
    
    randomize() {
        // Random initial placement
        this.queens = [];
        for (let i = 0; i < this.n; i++) {
            this.queens.push(Math.floor(Math.random() * this.n));
        }
        
        this.updateConflicts();
        this.solved = this.checkSolved();
        this.step = 0;
        this.adjustCanvasSize();
        this.updateUI();
    }
    
    reset() {
        this.attempt++;
        this.randomize();
    }
    
    updateConflicts() {
        // Reset conflict arrays
        this.colConflicts = new Array(this.n).fill(0);
        this.diag1Conflicts = new Array(2 * this.n - 1).fill(0);
        this.diag2Conflicts = new Array(2 * this.n - 1).fill(0);
        
        // Count conflicts
        for (let row = 0; row < this.n; row++) {
            const col = this.queens[row];
            this.colConflicts[col]++;
            this.diag1Conflicts[row + col]++;
            this.diag2Conflicts[row - col + this.n - 1]++;
        }
        
        // Calculate conflicts per queen
        this.conflicts = [];
        for (let row = 0; row < this.n; row++) {
            const col = this.queens[row];
            const conflictCount = (this.colConflicts[col] - 1) +
                                 (this.diag1Conflicts[row + col] - 1) +
                                 (this.diag2Conflicts[row - col + this.n - 1] - 1);
            this.conflicts.push(conflictCount);
        }
    }
    
    getConflictsForPosition(row, col) {
        const currentCol = this.queens[row];
        return (this.colConflicts[col] - (currentCol === col ? 1 : 0)) +
               (this.diag1Conflicts[row + col] - (currentCol === col ? 1 : 0)) +
               (this.diag2Conflicts[row - col + this.n - 1] - (currentCol === col ? 1 : 0));
    }
    
    moveQueen(row, newCol) {
        const oldCol = this.queens[row];
        
        if (oldCol === newCol) return;
        
        // Remove from old position
        this.colConflicts[oldCol]--;
        this.diag1Conflicts[row + oldCol]--;
        this.diag2Conflicts[row - oldCol + this.n - 1]--;
        
        // Add to new position
        this.queens[row] = newCol;
        this.colConflicts[newCol]++;
        this.diag1Conflicts[row + newCol]++;
        this.diag2Conflicts[row - newCol + this.n - 1]++;
        
        // Update conflicts for all queens
        this.conflicts = [];
        for (let r = 0; r < this.n; r++) {
            const c = this.queens[r];
            const conflictCount = (this.colConflicts[c] - 1) +
                                 (this.diag1Conflicts[r + c] - 1) +
                                 (this.diag2Conflicts[r - c + this.n - 1] - 1);
            this.conflicts.push(conflictCount);
        }
    }
    
    findConflictingRows() {
        const conflicting = [];
        for (let row = 0; row < this.n; row++) {
            if (this.conflicts[row] > 0) {
                conflicting.push(row);
            }
        }
        return conflicting;
    }
    
    checkSolved() {
        return this.conflicts.every(c => c === 0);
    }
    
    stepSolution() {
        if (this.solved) return;
        
        const conflictingRows = this.findConflictingRows();
        
        if (conflictingRows.length === 0) {
            this.solved = true;
            this.statusSpan.textContent = 'Solved! 🎉';
            this.statusSpan.className = 'status-solved';
            // Stop animation when solved
            this.stopAnimation();
            this.paused = true;
            this.playPauseBtn.textContent = '▶️ Play';
            return;
        }
        
        // Pick random conflicting row
        const row = conflictingRows[Math.floor(Math.random() * conflictingRows.length)];
        
        // Find column with minimum conflicts
        let minConflicts = this.n + 1;
        let bestCols = [];
        
        for (let col = 0; col < this.n; col++) {
            const conflicts = this.getConflictsForPosition(row, col);
            if (conflicts < minConflicts) {
                minConflicts = conflicts;
                bestCols = [col];
            } else if (conflicts === minConflicts) {
                bestCols.push(col);
            }
        }
        
        // Move to random best column
        const newCol = bestCols[Math.floor(Math.random() * bestCols.length)];
        this.moveQueen(row, newCol);
        
        this.step++;
        this.solved = this.checkSolved();
        this.updateUI();
        
        // Redraw after each step
        this.draw();
    }
    
    updateUI() {
        this.stepsSpan.textContent = this.step;
        const totalConflicts = this.conflicts.reduce((a, b) => a + b, 0) / 2;
        this.conflictsSpan.textContent = totalConflicts;
        this.attemptSpan.textContent = this.attempt;
        
        if (this.solved) {
            this.statusSpan.textContent = 'Solved! 🎉';
            this.statusSpan.className = 'status-solved';
        } else {
            this.statusSpan.textContent = 'Solving...';
            this.statusSpan.className = 'status-solving';
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        
        // Draw chessboard
        for (let row = 0; row < this.n; row++) {
            for (let col = 0; col < this.n; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                // Square color
                if ((row + col) % 2 === 0) {
                    this.ctx.fillStyle = '#f0f0f0';
                } else {
                    this.ctx.fillStyle = '#808080';
                }
                
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                this.ctx.strokeStyle = '#000';
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
        
        // Draw queens
        for (let row = 0; row < this.n; row++) {
            const col = this.queens[row];
            const x = col * this.cellSize + this.cellSize / 2;
            const y = row * this.cellSize + this.cellSize / 2;
            const radius = this.cellSize / 3;
            
            // Queen color based on conflicts
            if (this.conflicts[row] > 0) {
                this.ctx.fillStyle = '#ff4444';  // Red for conflicts
            } else {
                this.ctx.fillStyle = '#4444ff';  // Blue for safe
            }
            
            // Draw queen circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();
            
            // Draw crown symbol (Q)
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${Math.floor(radius)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('♕', x, y);
            
            // Show conflict count if > 0
            if (this.conflicts[row] > 0) {
                this.ctx.fillStyle = 'black';
                this.ctx.font = `${Math.floor(radius/2)}px Arial`;
                this.ctx.fillText(this.conflicts[row], x + radius/2, y - radius/2);
            }
        }
    }
    
    // FIXED: Better animation loop
    animate(currentTime) {
        if (!this.animationRunning) return;
        
        // Request next frame immediately
        this.animationId = requestAnimationFrame(this.animate);
        
        // Skip if paused or solved
        if (this.paused || this.solved) return;
        
        // Time-based animation
        if (!this.lastUpdate) this.lastUpdate = currentTime;
        
        const elapsed = currentTime - this.lastUpdate;
        const stepInterval = 1000 / this.speed;
        
        // Take multiple steps if we're behind (prevents freezing)
        if (elapsed >= stepInterval) {
            const stepsToTake = Math.floor(elapsed / stepInterval);
            for (let i = 0; i < Math.min(stepsToTake, 5); i++) {  // Max 5 steps per frame
                this.stepSolution();
                if (this.solved) break;
            }
            this.lastUpdate = currentTime;
        }
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    const visualizer = new NQueensVisualizer();
});

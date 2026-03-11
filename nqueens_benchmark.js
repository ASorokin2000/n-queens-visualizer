// nqueens_benchmark.js
// Run with: node nqueens_benchmark.js

class NQueensSolver {
    constructor(n) {
        this.n = n;
        this.queens = new Array(n);
        this.conflicts = new Array(n);
        this.steps = 0;
    }

    // Initialize random board
    init() {
        for (let i = 0; i < this.n; i++) {
            this.queens[i] = Math.floor(Math.random() * this.n);
        }
        this.calculateConflicts();
        this.steps = 0;
    }

    // Calculate conflicts for all queens
    calculateConflicts() {
        // Reset conflicts
        for (let i = 0; i < this.n; i++) {
            this.conflicts[i] = 0;
        }
        
        // Count conflicts between all pairs
        for (let i = 0; i < this.n; i++) {
            for (let j = i + 1; j < this.n; j++) {
                // Same column
                if (this.queens[i] === this.queens[j]) {
                    this.conflicts[i]++;
                    this.conflicts[j]++;
                }
                // Same diagonal
                if (Math.abs(this.queens[i] - this.queens[j]) === Math.abs(i - j)) {
                    this.conflicts[i]++;
                    this.conflicts[j]++;
                }
            }
        }
    }

    // Total conflicts
    totalConflicts() {
        let total = 0;
        for (let i = 0; i < this.n; i++) {
            total += this.conflicts[i];
        }
        return total;
    }

    // Check if solved
    isSolved() {
        return this.totalConflicts() === 0;
    }

    // Test conflicts for a specific position
    testPosition(row, col) {
        let testConflicts = 0;
        
        for (let r = 0; r < this.n; r++) {
            if (r === row) continue;
            
            if (this.queens[r] === col) testConflicts++;
            if (Math.abs(this.queens[r] - col) === Math.abs(r - row)) testConflicts++;
        }
        
        return testConflicts;
    }

    // One step of the algorithm
    step() {
        // Find queens with conflicts
        let withConflicts = [];
        for (let i = 0; i < this.n; i++) {
            if (this.conflicts[i] > 0) {
                withConflicts.push(i);
            }
        }
        
        if (withConflicts.length === 0) {
            return true; // Solved
        }
        
        // Pick random conflicting queen
        let row = withConflicts[Math.floor(Math.random() * withConflicts.length)];
        
        // Find best column
        let bestConflicts = this.n + 1;
        let bestCols = [];
        
        for (let col = 0; col < this.n; col++) {
            let testConflicts = this.testPosition(row, col);
            
            if (testConflicts < bestConflicts) {
                bestConflicts = testConflicts;
                bestCols = [col];
            } else if (testConflicts === bestConflicts) {
                bestCols.push(col);
            }
        }
        
        // Move to random best column
        let newCol = bestCols[Math.floor(Math.random() * bestCols.length)];
        this.queens[row] = newCol;
        
        // Recalculate conflicts
        this.calculateConflicts();
        this.steps++;
        
        return this.isSolved();
    }

    // Solve with stall detection and restart
    solve() {
        const STALL_THRESHOLD = 100;
        let lastConflicts = this.totalConflicts();
        let stallCounter = 0;
        let totalSteps = 0;
        let attemptSteps = 0;
        let attempts = 1;
        
        while (true) {
            if (this.isSolved()) {
                return { steps: totalSteps, attempts };
            }
            
            // Find queens with conflicts
            let withConflicts = [];
            for (let i = 0; i < this.n; i++) {
                if (this.conflicts[i] > 0) {
                    withConflicts.push(i);
                }
            }
            
            // Check for stall
            let currentConflicts = this.totalConflicts();
            if (currentConflicts >= lastConflicts) {
                stallCounter++;
                if (stallCounter >= STALL_THRESHOLD) {
                    // Restart
                    attempts++;
                    this.init();
                    lastConflicts = this.totalConflicts();
                    stallCounter = 0;
                    attemptSteps = 0;
                    continue;
                }
            } else {
                stallCounter = 0;
            }
            lastConflicts = currentConflicts;
            
            // Pick random conflicting queen
            let row = withConflicts[Math.floor(Math.random() * withConflicts.length)];
            
            // Find best column
            let bestConflicts = this.n + 1;
            let bestCols = [];
            
            for (let col = 0; col < this.n; col++) {
                let testConflicts = this.testPosition(row, col);
                
                if (testConflicts < bestConflicts) {
                    bestConflicts = testConflicts;
                    bestCols = [col];
                } else if (testConflicts === bestConflicts) {
                    bestCols.push(col);
                }
            }
            
            // Move to random best column
            let newCol = bestCols[Math.floor(Math.random() * bestCols.length)];
            this.queens[row] = newCol;
            
            // Recalculate conflicts
            this.calculateConflicts();
            
            attemptSteps++;
            totalSteps++;
        }
    }
}

// Progress bar
class ProgressBar {
    constructor(total, width = 50) {
        this.total = total;
        this.width = width;
        this.current = 0;
    }

    update(current) {
        this.current = current;
        const percentage = (current / this.total) * 100;
        const filled = Math.floor((current / this.total) * this.width);
        const bar = '█'.repeat(filled) + '░'.repeat(this.width - filled);
        process.stdout.write(`\r[${bar}] ${percentage.toFixed(1)}% (${current}/${this.total})`);
    }

    finish() {
        process.stdout.write('\n');
    }
}

// Main benchmark function
async function runBenchmark() {
    console.log('=' .repeat(70));
    console.log('N-QUEENS MINIMUM CONFLICTS BENCHMARK');
    console.log('=' .repeat(70));
    console.log('Running 100 tests for each N from 4 to 30...\n');
    
    const results = [];
    const TESTS_PER_N = 1000;
    
    // For each N
    for (let n = 4; n <= 100; n++) {
        console.log(`\n📊 Testing N = ${n}`);
        
        const steps = [];
        const attempts = [];
        const progressBar = new ProgressBar(TESTS_PER_N);
        
        // Run TESTS_PER_N tests
        for (let test = 0; test < TESTS_PER_N; test++) {
            const solver = new NQueensSolver(n);
            solver.init();
            
            const result = solver.solve();
            steps.push(result.steps);
            attempts.push(result.attempts);
            
            progressBar.update(test + 1);
        }
        
        progressBar.finish();
        
        // Calculate statistics
        const avgSteps = steps.reduce((a, b) => a + b, 0) / steps.length;
        const minSteps = Math.min(...steps);
        const maxSteps = Math.max(...steps);
        const avgAttempts = attempts.reduce((a, b) => a + b, 0) / attempts.length;
        
        results.push({
            n,
            avgSteps: avgSteps.toFixed(1),
            minSteps,
            maxSteps,
            avgAttempts: avgAttempts.toFixed(1)
        });
        
        // Show result immediately
        console.log(`   ✅ Avg: ${avgSteps.toFixed(1)} steps | Min: ${minSteps} | Max: ${maxSteps} | Avg attempts: ${avgAttempts.toFixed(1)}`);
    }
    
    // Print final table
    console.log('\n' + '=' .repeat(80));
    console.log('📈 FINAL RESULTS TABLE');
    console.log('=' .repeat(80));
    console.log('│  N  │ Avg Steps │ Min Steps │ Max Steps │ Avg Attempts │');
    console.log('├─────┼───────────┼───────────┼───────────┼──────────────┤');
    
    for (const r of results) {
        console.log(`│ ${r.n.toString().padStart(3)} │ ${r.avgSteps.toString().padStart(9)} │ ${r.minSteps.toString().padStart(9)} │ ${r.maxSteps.toString().padStart(9)} │ ${r.avgAttempts.toString().padStart(12)} │`);
    }
    
    console.log('=' .repeat(80));
    
    // Optional: Save to CSV
    const fs = require('fs');
    const csv = ['N,Average Steps,Min Steps,Max Steps,Average Attempts'];
    for (const r of results) {
        csv.push(`${r.n},${r.avgSteps},${r.minSteps},${r.maxSteps},${r.avgAttempts}`);
    }
    fs.writeFileSync('nqueens_results.csv', csv.join('\n'));
    console.log('\n📁 Results saved to nqueens_results.csv');
}

// Run the benchmark
console.log('Starting benchmark...\n');
runBenchmark().catch(console.error);

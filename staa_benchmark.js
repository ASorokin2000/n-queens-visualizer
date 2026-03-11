// stall_benchmark.js
// Tests different stall thresholds for N from 4 to 100
// Run with: node stall_benchmark.js

class NQueensSolver {
    constructor(n, stallThreshold) {
        this.n = n;
        this.stallThreshold = stallThreshold;
        this.queens = new Array(n);
        this.conflicts = new Array(n);
        this.steps = 0;
    }

    init() {
        for (let i = 0; i < this.n; i++) {
            this.queens[i] = Math.floor(Math.random() * this.n);
        }
        this.calculateConflicts();
        this.steps = 0;
    }

    calculateConflicts() {
        for (let i = 0; i < this.n; i++) {
            this.conflicts[i] = 0;
        }
        
        for (let i = 0; i < this.n; i++) {
            for (let j = i + 1; j < this.n; j++) {
                if (this.queens[i] === this.queens[j]) {
                    this.conflicts[i]++;
                    this.conflicts[j]++;
                }
                if (Math.abs(this.queens[i] - this.queens[j]) === Math.abs(i - j)) {
                    this.conflicts[i]++;
                    this.conflicts[j]++;
                }
            }
        }
    }

    totalConflicts() {
        let total = 0;
        for (let i = 0; i < this.n; i++) {
            total += this.conflicts[i];
        }
        return total;
    }

    isSolved() {
        return this.totalConflicts() === 0;
    }

    testPosition(row, col) {
        let testConflicts = 0;
        
        for (let r = 0; r < this.n; r++) {
            if (r === row) continue;
            
            if (this.queens[r] === col) testConflicts++;
            if (Math.abs(this.queens[r] - col) === Math.abs(r - row)) testConflicts++;
        }
        
        return testConflicts;
    }

    solve() {
        let lastConflicts = this.totalConflicts();
        let stallCounter = 0;
        let totalSteps = 0;
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
            
            // Stall detection
            let currentConflicts = this.totalConflicts();
            if (currentConflicts >= lastConflicts) {
                stallCounter++;
                if (stallCounter >= this.stallThreshold) {
                    // Restart
                    attempts++;
                    this.init();
                    lastConflicts = this.totalConflicts();
                    stallCounter = 0;
                    continue;
                }
            } else {
                stallCounter = 0;
                lastConflicts = currentConflicts;
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
            
            totalSteps++;
        }
    }
}

// Progress bar
class ProgressBar {
    constructor(total, width = 40) {
        this.total = total;
        this.width = width;
        this.current = 0;
    }

    update(current) {
        this.current = current;
        const percentage = (current / this.total) * 100;
        const filled = Math.floor((current / this.total) * this.width);
        const bar = '█'.repeat(filled) + '░'.repeat(this.width - filled);
        process.stdout.write(`\r[${bar}] ${percentage.toFixed(1)}%`);
    }

    finish() {
        process.stdout.write('\n');
    }
}

// Main benchmark function
async function runStallBenchmark() {
    console.log('=' .repeat(80));
    console.log('STALL THRESHOLD BENCHMARK');
    console.log('=' .repeat(80));
    console.log('Testing thresholds from 10 to 40');
    console.log('For each threshold: testing N from 4 to 100 (10 tests per N)');
    console.log('This will take a few minutes...\n');

    // Configuration
    const STALL_VALUES = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100];
    const MAX_N = 100;
    const MIN_N = 4;
    const TESTS_PER_N = 10;
    
    const results = {};

    // For each stall threshold
    for (const stall of STALL_VALUES) {
        console.log(`\n🔧 Testing stall threshold = ${stall}`);
        
        let totalStepsAllN = 0;
        let totalTests = 0;
        const progressBar = new ProgressBar(MAX_N - MIN_N + 1);
        
        // For each N
        for (let n = MIN_N; n <= MAX_N; n++) {
            let stepsForThisN = [];
            
            // Run TESTS_PER_N tests for this N
            for (let test = 0; test < TESTS_PER_N; test++) {
                const solver = new NQueensSolver(n, stall);
                solver.init();
                
                const result = solver.solve();
                stepsForThisN.push(result.steps);
            }
            
            // Calculate average for this N
            const avgForN = stepsForThisN.reduce((a, b) => a + b, 0) / stepsForThisN.length;
            totalStepsAllN += avgForN;
            totalTests++;
            
            progressBar.update(n - MIN_N + 1);
        }
        
        progressBar.finish();
        
        // Calculate overall average across all N
        const overallAvg = totalStepsAllN / totalTests;
        results[stall] = overallAvg.toFixed(1);
        
        console.log(`   ✅ Avg steps across all N: ${overallAvg.toFixed(1)}`);
    }

    // Print final comparison table
    console.log('\n' + '=' .repeat(60));
    console.log('📊 STALL THRESHOLD COMPARISON');
    console.log('=' .repeat(60));
    console.log('│ Stall (S) │ Avg Steps (N=4..100) │');
    console.log('├───────────┼─────────────────────┤');
    
    for (const stall of STALL_VALUES) {
        console.log(`│ ${stall.toString().padStart(9)} │ ${results[stall].toString().padStart(19)} │`);
    }
    
    console.log('=' .repeat(60));
    
    // Find best threshold
    let bestStall = STALL_VALUES[0];
    let bestSteps = parseFloat(results[bestStall]);
    
    for (const stall of STALL_VALUES) {
        const steps = parseFloat(results[stall]);
        if (steps < bestSteps) {
            bestSteps = steps;
            bestStall = stall;
        }
    }
    
    console.log(`\n🎯 Best stall threshold: ${bestStall} (avg ${bestSteps} steps)`);
    
    // Save detailed results
    const fs = require('fs');
    let csv = 'Stall Threshold,Average Steps (N=4-100)\n';
    for (const stall of STALL_VALUES) {
        csv += `${stall},${results[stall]}\n`;
    }
    fs.writeFileSync('stall_comparison.csv', csv);
    console.log('\n📁 Detailed results saved to stall_comparison.csv');
}

// Run the benchmark
console.log('Starting stall threshold benchmark...\n');
runStallBenchmark().catch(console.error);

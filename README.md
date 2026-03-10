# 👑 N-Queens Visualizer

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://yourusername.github.io/n-queens-visualizer/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive visualization of the N-Queens problem solved using the Minimum Conflicts algorithm. Watch queens resolve conflicts in real-time!

## 🎯 Live Demo

**Try it now:** [https://yourusername.github.io/n-queens-visualizer/](https://yourusername.github.io/n-queens-visualizer/)

## ✨ Features

- 🎮 **Interactive controls** - Play, pause, step through the algorithm
- 🎨 **Visual feedback** - Red queens have conflicts, blue queens are safe
- 📊 **Real-time stats** - Steps, conflicts, and attempt counter
- ⚡ **Adjustable speed** - Slow down to learn, speed up to watch
- 📱 **Responsive design** - Works on desktop, tablet, and mobile

## 🎮 How to Use

1. **Enter N** (4-30) and click "Start"
2. **Watch** as the algorithm tries to resolve conflicts
3. **Use controls** to pause, step, or randomize
4. **See it solve** when all queens turn blue!

## 🧠 How It Works

The Minimum Conflicts algorithm:
1. **Start** with random queen placement
2. **Pick** a queen that's under attack (red)
3. **Move** it to the column with fewest conflicts
4. **Repeat** until all queens are safe (blue)

This is a local search algorithm that finds a solution surprisingly fast!

## 📊 Example Solutions

| N | Time to Solve | Notes |
|---|--------------|-------|
| 8 | ~0.1s | Classic puzzle |
| 14 | ~2s | Challenging size |
| 20 | ~10s | Large board |

## 🛠️ Local Development

Want to run locally?

```bash
git clone https://github.com/yourusername/n-queens-visualizer.git
cd n-queens-visualizer
# Open index.html in your browser

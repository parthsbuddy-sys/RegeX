# RegeX — Interactive Finite Automata & Step Simulator

Welcome to **RegeX**, an interactive educational studio for formal language theory, regular expressions, and finite state automata!

Whether you're a computer science student studying automata theory, an educator teaching formal languages, or a software engineer, RegeX provides real-time conversion, interactive step-by-step string simulation, and mathematical inspection.

---

## ⚡ Key Features

- **Automata Representations**:
  - **NFA (Nondeterministic Finite Automaton)**: Thompson's construction with \(\lambda\)-transitions.
  - **DFA (Deterministic Finite Automaton)**: Powerset / subset construction with deterministic transitions.
  - **Mini NFA (Minimized / \(\epsilon\)-Free NFA)**: Compact non-deterministic machine with \(\lambda\)-transitions eliminated and unreachable states pruned.

- **UI Step-by-Step String Simulation**:
  - **Interactive Tape Visualizer**: Input string tape with an active read-head pointer (\(\blacktriangledown\)) tracking character processing.
  - **Playback Controls**: Step Forward, Step Backward, Play / Pause with speed toggles (`0.5x`, `1x`, `2x`), Reset, and Jump to End.
  - **Live Graph Illumination**: Active machine states glow dynamically on the network graph during each step of the simulation.
  - **Rewindable Execution Trace**: Step-by-step event log where clicking any prior step rewinds the simulator to that exact state.
  - **Acceptance Verdicts**: Instant `ACCEPTED ✓` or `REJECTED ✗` feedback.

- **Formal 5-Tuple & Transition Matrix (\(\delta\))**:
  - Full mathematical formal definition: \(M = (Q, \Sigma, \delta, q_0, F)\).
  - Live-highlighted state-by-symbol transition table.

- **Batch Test Bench**:
  - Test multiple candidate strings simultaneously against the current automaton.

- **Language Equivalence Checker**:
  - Side-by-side formal verification checking if two regular expressions describe the identical language (\(L(R_1) == L(R_2)\)).

- **Theory Guide & Syntax Reference**:
  - Comprehensive guide covering Thompson's construction, Powerset construction, and Mini NFA \(\lambda\)-elimination.
  - Cheat sheet modal for union (`+` or `|`), concatenation, Kleene star (`*`), and empty string (\(\lambda\) / \(\epsilon\)).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

```bash
# Clone the repository
git clone https://github.com/parthsbuddy-sys/RegeX.git
cd RegeX

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173/` (or the port specified by Vite).

### Production Build

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Tech Stack

- **Frontend**: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- **Graph Visualization**: [vis-network](https://visjs.github.io/vis-network/docs/network/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **Styling**: Vanilla SCSS + Modern Dark Slate Theme tokens

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

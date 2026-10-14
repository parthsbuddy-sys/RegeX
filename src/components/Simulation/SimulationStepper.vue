<template>
  <div class="stepper-card">
    <div class="stepper-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <div>
          <h3 class="header-title">Step-by-Step String Simulation</h3>
          <p class="header-subtitle">Execute input strings on the automaton with real-time state tracking</p>
        </div>
      </div>

      <!-- Quick Status Badge -->
      <div class="status-badge" :class="currentStepData.status">
        <span class="status-indicator"></span>
        <span class="status-text">{{ statusLabel }}</span>
      </div>
    </div>

    <!-- String Input Bar -->
    <div class="input-section">
      <div class="input-wrapper">
        <label for="sim-input" class="input-label">Test String (w):</label>
        <div class="input-row">
          <input
            id="sim-input"
            type="text"
            v-model="inputString"
            placeholder="e.g. abb, aabb, or empty for ε"
            class="string-input"
            @keydown.enter="jumpToEnd"
          />
          <button class="clear-btn" @click="inputString = ''" title="Clear string" v-if="inputString">
            ✕
          </button>
        </div>
      </div>

      <!-- Symbol quick-insert chips -->
      <div class="quick-chips">
        <span class="chips-label">Insert:</span>
        <button
          v-for="symbol in availableSymbols"
          :key="symbol"
          class="chip-btn"
          @click="appendSymbol(symbol)"
        >
          + {{ symbol }}
        </button>
        <button class="chip-btn example-chip" @click="setPresetString">
          Random Sample
        </button>
      </div>
    </div>

    <!-- Tape Visualizer -->
    <div class="tape-container">
      <div class="tape-label">Input Tape & Read Head:</div>
      <div class="tape-track" v-if="inputString.length > 0">
        <div
          v-for="(char, index) in inputString"
          :key="index"
          class="tape-cell"
          :class="{
            active: currentStepIndex > 0 && currentStepIndex - 1 === index,
            processed: currentStepIndex - 1 > index,
            future: currentStepIndex - 1 < index,
          }"
        >
          <div class="cell-head-pointer" v-if="currentStepIndex > 0 && currentStepIndex - 1 === index">
            ▼
          </div>
          <span class="cell-char">{{ char }}</span>
          <span class="cell-index">#{{ index }}</span>
        </div>
      </div>
      <div class="tape-empty" v-else>
        <span class="epsilon-badge">ε (Empty String)</span>
        <p class="empty-desc">Testing if initial state is an accepting state (λ ∈ L(R))</p>
      </div>
    </div>

    <!-- Stepper Controls -->
    <div class="controls-bar">
      <div class="playback-controls">
        <button
          class="ctrl-btn"
          @click="resetSimulation"
          :disabled="currentStepIndex === 0"
          title="Reset to Start (q0)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Reset
        </button>

        <button
          class="ctrl-btn"
          @click="stepBackward"
          :disabled="currentStepIndex === 0"
          title="Previous Step"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <line x1="5" y1="19" x2="5" y2="5"></line>
          </svg>
          Back
        </button>

        <button
          class="ctrl-btn play-btn"
          :class="{ isPlaying }"
          @click="togglePlay"
          :disabled="isFinished"
        >
          <svg v-if="!isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          {{ isPlaying ? "Pause" : "Play" }}
        </button>

        <button
          class="ctrl-btn"
          @click="stepForward"
          :disabled="isFinished"
          title="Next Step"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19"></line>
          </svg>
          Step
        </button>

        <button
          class="ctrl-btn"
          @click="jumpToEnd"
          :disabled="isFinished"
          title="Jump to Final Verdict"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 19 22 12 13 5 13 19"></polygon>
            <polygon points="2 19 11 12 2 5 2 19"></polygon>
          </svg>
          End
        </button>
      </div>

      <!-- Speed selector -->
      <div class="speed-selector">
        <span class="speed-label">Speed:</span>
        <button
          v-for="s in [500, 1000, 1800]"
          :key="s"
          class="speed-btn"
          :class="{ active: playSpeed === s }"
          @click="playSpeed = s"
        >
          {{ s === 500 ? "2x" : s === 1000 ? "1x" : "0.5x" }}
        </button>
      </div>
    </div>

    <!-- Active Step Detail Card -->
    <div class="step-detail-box">
      <div class="detail-header">
        <span class="step-badge">Step {{ currentStepIndex }} / {{ totalStepsCount - 1 }}</span>
        <span class="states-indicator">
          Active States:
          <strong>{{ activeStatesFormatted }}</strong>
        </span>
      </div>
      <p class="detail-explanation">{{ currentStepData.description }}</p>
    </div>

    <!-- Step Trace History Table -->
    <div class="trace-history">
      <div class="trace-toggle-header" @click="showTraceTable = !showTraceTable">
        <span class="trace-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Step-by-Step Execution Log ({{ trace.steps.length }} events)
        </span>
        <span class="trace-chevron">{{ showTraceTable ? "▲ Hide" : "▼ Expand" }}</span>
      </div>

      <div class="trace-table-wrapper" v-if="showTraceTable">
        <table class="trace-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Current State(s)</th>
              <th>Symbol</th>
              <th>Next State(s)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="step in trace.steps"
              :key="step.stepIndex"
              :class="{ 'row-active': step.stepIndex === currentStepIndex }"
              @click="goToStep(step.stepIndex)"
            >
              <td>{{ step.stepIndex }}</td>
              <td>
                <span class="state-chip" v-for="s in (step.fromStates || step.currentStates)" :key="s">
                  q{{ s }}
                </span>
              </td>
              <td class="mono-symbol">{{ step.symbol || "—" }}</td>
              <td>
                <span class="state-chip" v-for="s in step.currentStates" :key="s">
                  q{{ s }}
                </span>
              </td>
              <td>
                <span class="pill-badge" :class="step.status">{{ step.status }}</span>
              </td>
              <td>
                <button class="goto-btn">Rewind Here</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { buildSimulationTrace } from "@/utilities/simulationEngine.js";

const props = defineProps({
  automata: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(["update:activeStates"]);

const inputString = ref("abb");
const currentStepIndex = ref(0);
const isPlaying = ref(false);
const playSpeed = ref(1000);
const showTraceTable = ref(true);
let playTimer = null;

// Build trace whenever automata or inputString changes
const trace = computed(() => {
  return buildSimulationTrace(props.automata, inputString.value);
});

const totalStepsCount = computed(() => trace.value.steps.length);

const currentStepData = computed(() => {
  if (!trace.value.steps || trace.value.steps.length === 0) {
    return {
      status: "idle",
      description: "No machine loaded",
      currentStates: [],
    };
  }
  const idx = Math.min(currentStepIndex.value, trace.value.steps.length - 1);
  return trace.value.steps[idx] || trace.value.steps[0];
});

const isFinished = computed(() => {
  return currentStepIndex.value >= totalStepsCount.value - 1;
});

const activeStatesFormatted = computed(() => {
  const states = currentStepData.value.currentStates || [];
  if (states.length === 0) return "∅ (Trapped)";
  return "{" + states.map((s) => "q" + s).join(", ") + "}";
});

const statusLabel = computed(() => {
  const s = currentStepData.value.status;
  if (s === "accepted") return "ACCEPTED ✓ (String in L)";
  if (s === "rejected") return "REJECTED ✗ (Not in L)";
  if (s === "running") return `RUNNING (Step ${currentStepIndex.value})`;
  return "READY";
});

const availableSymbols = computed(() => {
  if (!props.automata || !props.automata.alphabets) return ["a", "b"];
  return props.automata.alphabets.filter((a) => a !== "λ");
});

// Notify parent of active states for visual network rendering
watch(
  () => currentStepData.value.currentStates,
  (newStates) => {
    emits("update:activeStates", newStates || []);
  },
  { immediate: true }
);

// When input changes, reset simulation to 0
watch(inputString, () => {
  stopPlay();
  currentStepIndex.value = 0;
});

// When automaton changes, reset simulation
watch(
  () => props.automata,
  () => {
    stopPlay();
    currentStepIndex.value = 0;
  }
);

const appendSymbol = (sym) => {
  inputString.value += sym;
};

const setPresetString = () => {
  const options = ["abb", "aabb", "babb", "ab", "ba", "a", "b", ""];
  const rand = options[Math.floor(Math.random() * options.length)];
  inputString.value = rand;
};

const stepForward = () => {
  if (currentStepIndex.value < totalStepsCount.value - 1) {
    currentStepIndex.value++;
  } else {
    stopPlay();
  }
};

const stepBackward = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

const resetSimulation = () => {
  stopPlay();
  currentStepIndex.value = 0;
};

const jumpToEnd = () => {
  stopPlay();
  currentStepIndex.value = totalStepsCount.value - 1;
};

const goToStep = (index) => {
  stopPlay();
  currentStepIndex.value = index;
};

const togglePlay = () => {
  if (isPlaying.value) {
    stopPlay();
  } else {
    startPlay();
  }
};

const startPlay = () => {
  if (isFinished.value) {
    currentStepIndex.value = 0;
  }
  isPlaying.value = true;
  clearInterval(playTimer);
  playTimer = setInterval(() => {
    if (currentStepIndex.value < totalStepsCount.value - 1) {
      currentStepIndex.value++;
    } else {
      stopPlay();
    }
  }, playSpeed.value);
};

const stopPlay = () => {
  isPlaying.value = false;
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
};

onBeforeUnmount(() => {
  stopPlay();
});
</script>

<style scoped lang="scss">
.stepper-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 2rem;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  box-shadow: var(--shadow-card);
}

.stepper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.header-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2));
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1.4rem;
  border-radius: 2rem;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .status-indicator {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
  }

  &.accepted {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
    .status-indicator {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
  }

  &.rejected {
    background: rgba(244, 63, 94, 0.15);
    color: #f43f5e;
    border: 1px solid rgba(244, 63, 94, 0.3);
    .status-indicator {
      background: #f43f5e;
      box-shadow: 0 0 8px #f43f5e;
    }
  }

  &.running {
    background: rgba(6, 182, 212, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(6, 182, 212, 0.3);
    .status-indicator {
      background: #38bdf8;
      box-shadow: 0 0 8px #38bdf8;
    }
  }

  &.idle {
    background: rgba(100, 116, 139, 0.15);
    color: var(--text-muted);
    border: 1px solid var(--border-subtle);
    .status-indicator {
      background: var(--text-muted);
    }
  }
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.input-label {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-row {
  position: relative;
  display: flex;
  align-items: center;
}

.string-input {
  width: 100%;
  height: 4.6rem;
  background: var(--bg-surface-elevated);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 4rem 0 1.6rem;
  color: var(--text-main);
  font-size: 1.6rem;
  font-family: var(--font-mono);
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
  }
}

.clear-btn {
  position: absolute;
  right: 1.2rem;
  color: var(--text-muted);
  font-size: 1.4rem;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-main);
  }
}

.quick-chips {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.chips-label {
  font-size: 1.2rem;
  color: var(--text-muted);
}

.chip-btn {
  padding: 0.4rem 1rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 1.2rem;
  font-family: var(--font-mono);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(6, 182, 212, 0.15);
    color: var(--accent-cyan);
    border-color: rgba(6, 182, 212, 0.3);
  }

  &.example-chip {
    margin-left: auto;
    font-family: inherit;
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border-color: rgba(99, 102, 241, 0.3);

    &:hover {
      background: rgba(99, 102, 241, 0.25);
      color: #fff;
    }
  }
}

.tape-container {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.4rem;
}

.tape-label {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 0.8rem;
}

.tape-track {
  display: flex;
  gap: 0.8rem;
  overflow-x: auto;
  padding-bottom: 0.6rem;
  padding-top: 1.4rem;
}

.tape-cell {
  position: relative;
  min-width: 4.8rem;
  height: 5.4rem;
  border-radius: 0.8rem;
  background: var(--bg-surface-elevated);
  border: 1.5px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;

  .cell-char {
    font-size: 1.8rem;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--text-main);
  }

  .cell-index {
    font-size: 1rem;
    color: var(--text-muted);
  }

  .cell-head-pointer {
    position: absolute;
    top: -1.6rem;
    color: var(--accent-amber);
    font-size: 1.4rem;
    animation: bounce-head 1s infinite;
  }

  &.active {
    background: rgba(245, 158, 11, 0.15);
    border-color: var(--accent-amber);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);

    .cell-char {
      color: var(--accent-amber);
    }
  }

  &.processed {
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.3);
    .cell-char {
      color: #10b981;
    }
  }

  &.future {
    opacity: 0.6;
  }
}

@keyframes bounce-head {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.tape-empty {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 0;

  .epsilon-badge {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.15);
    padding: 0.4rem 1rem;
    border-radius: 0.6rem;
  }

  .empty-desc {
    font-size: 1.3rem;
    color: var(--text-secondary);
  }
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.4rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 1.3rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--border-strong);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.play-btn {
    background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
    color: #0b0f19;
    font-weight: 700;
    border: none;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);

    &.isPlaying {
      background: linear-gradient(135deg, var(--accent-amber), #ea580c);
      color: #fff;
    }
  }
}

.speed-selector {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.speed-label {
  font-size: 1.2rem;
  color: var(--text-muted);
}

.speed-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 600;

  &.active {
    background: rgba(6, 182, 212, 0.2);
    color: var(--accent-cyan);
    border-color: var(--accent-cyan);
  }
}

.step-detail-box {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 4px solid var(--accent-cyan);
  border-radius: var(--radius-sm);
  padding: 1.2rem 1.6rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.step-badge {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-cyan);
  text-transform: uppercase;
}

.states-indicator {
  font-size: 1.3rem;
  color: var(--text-secondary);

  strong {
    color: var(--accent-amber);
    font-family: var(--font-mono);
  }
}

.detail-explanation {
  font-size: 1.4rem;
  color: var(--text-main);
  line-height: 1.5;
}

.trace-history {
  border-top: 1px solid var(--border-subtle);
  padding-top: 1.2rem;
}

.trace-toggle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.trace-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-secondary);

  &:hover {
    color: var(--text-main);
  }
}

.trace-chevron {
  font-size: 1.2rem;
  color: var(--accent-cyan);
}

.trace-table-wrapper {
  margin-top: 1.2rem;
  max-height: 220px;
  overflow-y: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.trace-table {
  width: 100%;
  font-size: 1.2rem;
  text-align: left;

  thead th {
    position: sticky;
    top: 0;
    background: #0f172a;
    padding: 0.8rem 1rem;
    font-weight: 600;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-subtle);
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    &.row-active {
      background: rgba(6, 182, 212, 0.12);
      border-left: 3px solid var(--accent-cyan);
    }
  }

  tbody td {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    color: var(--text-secondary);
  }
}

.state-chip {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.2rem 0.6rem;
  border-radius: 0.4rem;
  margin-right: 0.4rem;
  color: #f1f5f9;
}

.mono-symbol {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent-amber);
}

.pill-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;

  &.accepted {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }
  &.rejected {
    background: rgba(244, 63, 94, 0.2);
    color: #f43f5e;
  }
  &.running {
    background: rgba(6, 182, 212, 0.2);
    color: #38bdf8;
  }
}

.goto-btn {
  font-size: 1.1rem;
  color: var(--accent-cyan);
  text-decoration: underline;

  &:hover {
    color: #fff;
  }
}
</style>

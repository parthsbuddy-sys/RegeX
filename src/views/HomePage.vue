<template>
  <div class="app-layout">
    <!-- Header Navigation & Branding -->
    <app-header
      :currentMode="currentMode"
      @update:mode="currentMode = $event"
      @select:preset="applyPreset"
      @toggle:help="showSyntaxModal = true"
    ></app-header>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- MODE 1: STUDIO & STEP SIMULATION -->
      <section v-if="currentMode === 'studio'" class="studio-view">
        <div class="studio-grid">
          <!-- Automaton Visualizer Column -->
          <div class="automata-panel">
            <automata-box
              v-model="studioRegex"
              :activeStates="activeStates"
              @automata="onStudioAutomataChange"
            ></automata-box>
          </div>

          <!-- Educational & Simulation Tooling Column / Tabs -->
          <div class="tooling-panel">
            <!-- Tooling Tabs Header -->
            <div class="tooling-tabs">
              <button
                class="tab-btn"
                :class="{ active: studioTab === 'simulation' }"
                @click="studioTab = 'simulation'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                UI Step Simulation
              </button>

              <button
                class="tab-btn"
                :class="{ active: studioTab === 'matrix' }"
                @click="studioTab = 'matrix'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                Transition Matrix (δ)
              </button>

              <button
                class="tab-btn"
                :class="{ active: studioTab === 'batch' }"
                @click="studioTab = 'batch'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Batch Test Bench
              </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-body">
              <div v-if="currentAutomata">
                <simulation-stepper
                  v-if="studioTab === 'simulation'"
                  :automata="currentAutomata"
                  @update:activeStates="activeStates = $event"
                ></simulation-stepper>

                <transition-table
                  v-else-if="studioTab === 'matrix'"
                  :automata="currentAutomata"
                  :activeStates="activeStates"
                ></transition-table>

                <batch-tester
                  v-else-if="studioTab === 'batch'"
                  :automata="currentAutomata"
                  @select:string="switchToSimulationWithString"
                ></batch-tester>
              </div>

              <div v-else class="no-machine-card">
                <p>Provide a valid regular expression to enable simulation and matrix inspection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MODE 2: EQUIVALENCE COMPARATOR -->
      <section v-else-if="currentMode === 'compare'" class="compare-view">
        <div class="compare-banner">
          <div class="banner-badge">Formal Verification</div>
          <h2 class="compare-title">Language Equivalence Checker: L(R₁) == L(R₂)</h2>
          <p class="compare-sub">
            Verifies whether two distinct regular expressions generate the identical formal language by comparing their minimized canonical DFAs.
          </p>

          <div class="equivalence-result-badge" :class="{ 'is-equal': isEqual, 'is-different': !isEqual }">
            <span class="symbol">{{ isEqual ? "==" : "≠" }}</span>
            <span class="text">
              {{ isEqual ? "LANGUAGES ARE EQUIVALENT: L(R₁) == L(R₂)" : "LANGUAGES ARE DIFFERENT: L(R₁) ≠ L(R₂)" }}
            </span>
          </div>
        </div>

        <div class="compare-grid">
          <div class="compare-col">
            <div class="col-header">
              <span class="col-tag tag-primary">Automaton 1 (R₁)</span>
            </div>
            <automata-box
              v-model="compareRegex1"
              placeholderText="e.g. (a+b)*"
            ></automata-box>
          </div>

          <div class="compare-center-divider">
            <div class="vs-circle" :class="{ 'vs-equal': isEqual }">
              {{ isEqual ? "=" : "vs" }}
            </div>
          </div>

          <div class="compare-col">
            <div class="col-header">
              <span class="col-tag tag-secondary">Automaton 2 (R₂)</span>
            </div>
            <automata-box
              v-model="compareRegex2"
              placeholderText="e.g. (a*b*)*"
            ></automata-box>
          </div>
        </div>
      </section>

      <!-- MODE 3: THEORY & REFERENCE GUIDE -->
      <section v-else-if="currentMode === 'theory'" class="theory-view">
        <theory-guide></theory-guide>
      </section>
    </main>

    <!-- Syntax Help Modal -->
    <syntax-modal
      v-if="showSyntaxModal"
      @close="showSyntaxModal = false"
    ></syntax-modal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AppHeader from "@/components/Navigation/AppHeader.vue";
import SyntaxModal from "@/components/Navigation/SyntaxModal.vue";
import AutomataBox from "@/components/Automata/AutomataBox.vue";
import SimulationStepper from "@/components/Simulation/SimulationStepper.vue";
import TransitionTable from "@/components/Educational/TransitionTable.vue";
import BatchTester from "@/components/Educational/BatchTester.vue";
import TheoryGuide from "@/components/Educational/TheoryGuide.vue";
import { FiniteAutomata } from "@/utilities/finiteAutomata.js";

const currentMode = ref("studio"); // 'studio' | 'compare' | 'theory'
const studioTab = ref("simulation"); // 'simulation' | 'matrix' | 'batch'
const showSyntaxModal = ref(false);

const studioRegex = ref("(a+b)*abb");
const currentAutomata = ref(null);
const activeStates = ref([]);

// Equivalence comparison regexes
const compareRegex1 = ref("(a+b)*");
const compareRegex2 = ref("(a*b*)*");

const onStudioAutomataChange = (machine) => {
  currentAutomata.value = machine;
  activeStates.value = [];
};

const applyPreset = (preset) => {
  studioRegex.value = preset.regex;
  currentMode.value = "studio";
};

const switchToSimulationWithString = (str) => {
  studioTab.value = "simulation";
};

const isEqual = computed(() => {
  const r1 = compareRegex1.value.replace(/\|/g, "+").replace(/\s+/g, "");
  const r2 = compareRegex2.value.replace(/\|/g, "+").replace(/\s+/g, "");
  const helper = new FiniteAutomata();

  if (
    r1 &&
    r2 &&
    helper.validateRegularExpression(r1) &&
    helper.validateRegularExpression(r2)
  ) {
    try {
      return helper.isEqual(r1, r2);
    } catch (e) {
      return false;
    }
  }
  return false;
});
</script>

<style scoped lang="scss">
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-app);
}

.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 2.4rem;
}

/* STUDIO VIEW */
.studio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.4rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.automata-panel {
  display: flex;
  flex-direction: column;
}

.tooling-panel {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.tooling-tabs {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.4rem;
  gap: 0.6rem;
  overflow-x: auto;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.6rem;
  border-radius: var(--radius-sm);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2));
    color: var(--accent-cyan);
    border: 1px solid rgba(6, 182, 212, 0.3);
  }
}

.tab-body {
  width: 100%;
}

.no-machine-card {
  padding: 4rem 2rem;
  text-align: center;
  background: var(--bg-card);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 1.4rem;
}

/* COMPARE VIEW */
.compare-banner {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem auto;
}

.banner-badge {
  display: inline-block;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-emerald);
  background: rgba(16, 185, 129, 0.12);
  padding: 0.4rem 1.2rem;
  border-radius: 2rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.compare-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin-bottom: 0.8rem;
}

.compare-sub {
  font-size: 1.4rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 2rem;
}

.equivalence-result-badge {
  display: inline-flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 2.4rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.02em;

  .symbol {
    font-size: 2.2rem;
    font-family: var(--font-mono);
  }

  &.is-equal {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1.5px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
  }

  &.is-different {
    background: rgba(244, 63, 94, 0.15);
    color: #f43f5e;
    border: 1.5px solid rgba(244, 63, 94, 0.4);
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.2);
  }
}

.compare-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.compare-col {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.col-header {
  display: flex;
  align-items: center;
}

.col-tag {
  font-size: 1.2rem;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 0.6rem;

  &.tag-primary {
    background: rgba(6, 182, 212, 0.15);
    color: var(--accent-cyan);
    border: 1px solid rgba(6, 182, 212, 0.3);
  }

  &.tag-secondary {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
}

.compare-center-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-circle {
  width: 5.4rem;
  height: 5.4rem;
  border-radius: 50%;
  background: var(--bg-surface-elevated);
  border: 2px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-muted);
  box-shadow: var(--shadow-card);

  &.vs-equal {
    border-color: #10b981;
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }
}
</style>

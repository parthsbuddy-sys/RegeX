<template>
  <div class="table-card">
    <div class="card-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
        </div>
        <div>
          <h3 class="card-title">Transition Function Matrix (δ) & Formal Definition</h3>
          <p class="card-subtitle">5-tuple mathematical definition: M = (Q, Σ, δ, q₀, F)</p>
        </div>
      </div>

      <div class="type-pill" :class="automataType">
        {{ automataType.toUpperCase() }}
      </div>
    </div>

    <!-- Formal 5-Tuple Box -->
    <div class="formal-definition-grid">
      <div class="tuple-item">
        <span class="tuple-sym">Q</span>
        <div class="tuple-content">
          <span class="tuple-desc">States Set ({{ automata.states.length }}):</span>
          <span class="tuple-val">{ {{ stateNamesList }} }</span>
        </div>
      </div>

      <div class="tuple-item">
        <span class="tuple-sym">Σ</span>
        <div class="tuple-content">
          <span class="tuple-desc">Alphabet:</span>
          <span class="tuple-val">{ {{ alphabetsList }} }</span>
        </div>
      </div>

      <div class="tuple-item">
        <span class="tuple-sym">q₀</span>
        <div class="tuple-content">
          <span class="tuple-desc">Initial State:</span>
          <span class="tuple-val">q₀</span>
        </div>
      </div>

      <div class="tuple-item">
        <span class="tuple-sym">F</span>
        <div class="tuple-content">
          <span class="tuple-desc">Accept States ({{ (automata.finalStates || []).length }}):</span>
          <span class="tuple-val">{ {{ finalStatesList }} }</span>
        </div>
      </div>
    </div>

    <!-- δ Matrix Table -->
    <div class="matrix-wrapper">
      <table class="delta-table">
        <thead>
          <tr>
            <th class="state-col">State (q)</th>
            <th v-for="alpha in tableData.alphabets" :key="alpha" class="alpha-col">
              Input: '{{ alpha }}'
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tableData.rows"
            :key="row.state"
            :class="{
              'row-start': row.isStart,
              'row-final': row.isFinal,
              'row-active': isRowActive(row.state),
            }"
          >
            <td class="state-cell">
              <span class="state-markers">
                <span v-if="row.isStart" class="start-arrow" title="Start State">→</span>
                <span v-if="row.isFinal" class="final-star" title="Accepting State">*</span>
              </span>
              <span class="state-label">{{ row.name }}</span>
            </td>

            <td
              v-for="alpha in tableData.alphabets"
              :key="alpha"
              class="target-cell"
              :class="{ 'cell-active': isRowActive(row.state) && activeSymbol === alpha }"
            >
              <span
                class="target-chip"
                :class="{ empty: row.transitions[alpha] === '—' }"
              >
                {{ row.transitions[alpha] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Educational Footer Notes -->
    <div class="table-legend">
      <span>Legend: <strong class="start-arrow">→</strong> = Start state (q₀)</span>
      <span><strong class="final-star">*</strong> = Accept state (F)</span>
      <span><strong>—</strong> = No transition (trap / dead state)</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { getTransitionTable } from "@/utilities/simulationEngine.js";

const props = defineProps({
  automata: {
    type: Object,
    required: true,
  },
  activeStates: {
    type: Array,
    default: () => [],
  },
  activeSymbol: {
    type: String,
    default: null,
  },
});

const automataType = computed(() => {
  return props.automata.type || "nfa";
});

const tableData = computed(() => {
  return getTransitionTable(props.automata);
});

const stateNamesList = computed(() => {
  return props.automata.states.map((_, i) => "q" + i).join(", ");
});

const alphabetsList = computed(() => {
  return (tableData.value.alphabets || []).join(", ");
});

const finalStatesList = computed(() => {
  const f = props.automata.finalStates || [];
  if (f.length === 0) return "∅";
  return f.map((s) => "q" + s).join(", ");
});

const isRowActive = (stateIndex) => {
  return props.activeStates && props.activeStates.includes(stateIndex);
};
</script>

<style scoped lang="scss">
.table-card {
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

.card-header {
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
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.card-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
}

.type-pill {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.4rem 1.2rem;
  border-radius: 2rem;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald);
  border: 1px solid rgba(16, 185, 129, 0.3);

  &.nfa {
    background: rgba(6, 182, 212, 0.15);
    color: var(--accent-cyan);
    border-color: rgba(6, 182, 212, 0.3);
  }
}

.formal-definition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
}

.tuple-item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 1rem 1.4rem;

  .tuple-sym {
    font-size: 2rem;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--accent-cyan);
    min-width: 2.8rem;
  }

  .tuple-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tuple-desc {
    font-size: 1.1rem;
    color: var(--text-muted);
  }

  .tuple-val {
    font-size: 1.3rem;
    font-weight: 600;
    font-family: var(--font-mono);
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.matrix-wrapper {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.delta-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.3rem;

  thead th {
    position: sticky;
    top: 0;
    background: #0f172a;
    padding: 1rem 1.4rem;
    font-weight: 700;
    color: var(--text-secondary);
    border-bottom: 1.5px solid var(--border-subtle);
    text-align: left;
  }

  .state-col {
    width: 25%;
  }

  tbody tr {
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    &.row-active {
      background: rgba(245, 158, 11, 0.12);
      border-left: 3px solid var(--accent-amber);
    }

    &.row-final .state-label {
      color: #34d399;
      font-weight: 700;
    }
  }

  tbody td {
    padding: 1rem 1.4rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
  }

  .state-cell {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-mono);
  }

  .start-arrow {
    color: #3b82f6;
    font-weight: 800;
  }

  .final-star {
    color: #10b981;
    font-weight: 800;
  }

  .target-cell {
    font-family: var(--font-mono);

    &.cell-active {
      background: rgba(245, 158, 11, 0.2);
    }
  }

  .target-chip {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 0.4rem;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-main);

    &.empty {
      background: transparent;
      color: var(--text-muted);
    }
  }
}

.table-legend {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  font-size: 1.2rem;
  color: var(--text-muted);
  flex-wrap: wrap;

  .start-arrow {
    color: #3b82f6;
  }

  .final-star {
    color: #10b981;
  }
}
</style>

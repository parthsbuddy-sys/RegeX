<template>
  <div class="batch-card">
    <div class="batch-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div>
          <h3 class="card-title">Batch Test Bench</h3>
          <p class="card-subtitle">Test multiple candidate strings simultaneously against this automaton</p>
        </div>
      </div>

      <div class="stats-counter">
        <span class="count-accepted">{{ acceptedCount }} Accepted</span>
        <span class="count-separator">/</span>
        <span class="count-total">{{ results.length }} Total</span>
      </div>
    </div>

    <!-- Quick Add Input -->
    <div class="add-row">
      <input
        type="text"
        v-model="newTestString"
        placeholder="Enter string to add (or leave empty for ε)"
        class="batch-input"
        @keydown.enter="addTestString"
      />
      <button class="add-btn" @click="addTestString">
        + Add String
      </button>
      <button class="reset-tests-btn" @click="loadDefaultTests" title="Load Default Test Suite">
        Default Tests
      </button>
    </div>

    <!-- Results Table -->
    <div class="batch-table-container">
      <table class="batch-table">
        <thead>
          <tr>
            <th>Test String (w)</th>
            <th>Length |w|</th>
            <th>Steps</th>
            <th>Result</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in results" :key="index" :class="item.accepted ? 'pass-row' : 'fail-row'">
            <td class="string-cell">
              <span class="string-display" v-if="item.string.length > 0">{{ item.string }}</span>
              <span class="epsilon-display" v-else>ε (Empty)</span>
            </td>
            <td>{{ item.string.length }}</td>
            <td>{{ item.stepsCount }}</td>
            <td>
              <span class="result-badge" :class="item.accepted ? 'pass' : 'fail'">
                {{ item.accepted ? "ACCEPTED ✓" : "REJECTED ✗" }}
              </span>
            </td>
            <td>
              <button class="action-test-btn" @click="$emit('select:string', item.string)">
                Step in Simulator →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { batchTestStrings } from "@/utilities/simulationEngine.js";

const props = defineProps({
  automata: {
    type: Object,
    required: true,
  },
});

defineEmits(["select:string"]);

const testStrings = ref(["abb", "aabb", "babb", "ab", "ba", "a", "b", ""]);
const newTestString = ref("");

const results = computed(() => {
  return batchTestStrings(props.automata, testStrings.value);
});

const acceptedCount = computed(() => {
  return results.value.filter((r) => r.accepted).length;
});

const addTestString = () => {
  const s = newTestString.value.trim();
  if (!testStrings.value.includes(s)) {
    testStrings.value.push(s);
  }
  newTestString.value = "";
};

const loadDefaultTests = () => {
  testStrings.value = ["abb", "aabb", "babb", "ab", "ba", "a", "b", ""];
};
</script>

<style scoped lang="scss">
.batch-card {
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

.batch-header {
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
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--accent-emerald);
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

.stats-counter {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  font-weight: 700;
  background: var(--bg-surface);
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  border: 1px solid var(--border-subtle);

  .count-accepted {
    color: var(--accent-emerald);
  }

  .count-separator {
    color: var(--text-muted);
  }

  .count-total {
    color: var(--text-secondary);
  }
}

.add-row {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.batch-input {
  flex: 1;
  min-width: 200px;
  height: 4.2rem;
  background: var(--bg-surface-elevated);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0 1.4rem;
  color: var(--text-main);
  font-family: var(--font-mono);
  font-size: 1.4rem;

  &:focus {
    border-color: var(--accent-emerald);
  }
}

.add-btn {
  padding: 0 1.6rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  font-weight: 600;
  border-radius: var(--radius-sm);
  font-size: 1.3rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(16, 185, 129, 0.25);
    color: #fff;
  }
}

.reset-tests-btn {
  padding: 0 1.2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 1.3rem;
  border-radius: var(--radius-sm);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-main);
  }
}

.batch-table-container {
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.batch-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.3rem;

  thead th {
    position: sticky;
    top: 0;
    background: #0f172a;
    padding: 0.8rem 1.2rem;
    font-weight: 700;
    color: var(--text-muted);
    border-bottom: 1.5px solid var(--border-subtle);
    text-align: left;
  }

  tbody td {
    padding: 0.8rem 1.2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
  }

  tbody tr {
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  }
}

.string-display {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--text-main);
}

.epsilon-display {
  font-family: var(--font-mono);
  color: var(--accent-cyan);
}

.result-badge {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 700;

  &.pass {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
  }

  &.fail {
    background: rgba(244, 63, 94, 0.15);
    color: #f43f5e;
  }
}

.action-test-btn {
  font-size: 1.2rem;
  color: var(--accent-cyan);
  text-decoration: underline;

  &:hover {
    color: #fff;
  }
}
</style>

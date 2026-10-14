<template>
  <section class="automata-box">
    <!-- Top Control Bar -->
    <div class="box-top-bar">
      <!-- Input Field -->
      <div class="regex-field-wrapper">
        <div class="input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
          </svg>
        </div>

        <input
          type="text"
          v-model="rawRegex"
          :placeholder="placeholderText"
          class="regex-text-input"
          :class="{ 'has-error': rawRegex && !isValidRegex }"
        />

        <div class="input-actions">
          <button v-if="rawRegex" class="clear-btn" @click="rawRegex = ''" title="Clear expression">✕</button>
          <span v-if="rawRegex && isValidRegex" class="valid-check" title="Valid Regular Expression">✓ Valid</span>
          <span v-else-if="rawRegex && !isValidRegex" class="invalid-mark" title="Invalid Syntax">✕ Invalid</span>
        </div>
      </div>

      <!-- Automaton Representation Selector -->
      <div class="type-segmented-control">
        <button
          v-for="opt in options"
          :key="opt"
          class="seg-btn"
          :class="{ active: type === opt }"
          @click="changeType(opt)"
        >
          {{ opt.toUpperCase() }}
        </button>
      </div>
    </div>

    <!-- Machine Stats Strip -->
    <div class="stats-strip" v-if="currentAutomata">
      <div class="stat-badge">
        <span class="stat-k">States:</span>
        <span class="stat-v">{{ currentAutomata.states.length }}</span>
      </div>
      <div class="stat-badge">
        <span class="stat-k">Alphabet:</span>
        <span class="stat-v">{ {{ alphabetList }} }</span>
      </div>
      <div class="stat-badge">
        <span class="stat-k">Accept:</span>
        <span class="stat-v">{ {{ finalStatesList }} }</span>
      </div>
      <div class="stat-badge type-indicator">
        <span class="type-tag">{{ type.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Graph Container -->
    <div class="box-graph-area">
      <automata-graph
        v-if="currentAutomata"
        :automata="currentAutomata"
        :activeStates="activeStates"
      ></automata-graph>
      <div v-else class="graph-empty-state">
        <div class="empty-icon">⚡</div>
        <p class="empty-title">Enter a Regular Expression</p>
        <p class="empty-sub">
          Type an expression above like <code>(a+b)*abb</code> or <code>(0+1)*00(0+1)*</code>
          to generate the automaton graph.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { FiniteAutomata } from "@/utilities/finiteAutomata.js";
import AutomataGraph from "@/components/Automata/AutomataGraph.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholderText: {
    type: String,
    default: "e.g. (a+b)*abb",
  },
  activeStates: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(["update:modelValue", "input", "automata"]);

const rawRegex = ref(props.modelValue || "(a+b)*abb");
const type = ref("nfa");
const options = ["nfa", "dfa", "mini nfa"];

const changeType = (opt) => {
  type.value = opt;
};

// Normalize expression (replace | with + for union, trim spaces)
const normalizedRegex = computed(() => {
  return rawRegex.value.replace(/\|/g, "+").replace(/\s+/g, "");
});

const isValidRegex = computed(() => {
  if (!normalizedRegex.value) return false;
  const helper = new FiniteAutomata();
  return helper.validateRegularExpression(normalizedRegex.value);
});

const currentAutomata = computed(() => {
  if (!isValidRegex.value) return null;
  try {
    let machine = new FiniteAutomata();
    machine = machine.parseRegularExpression(normalizedRegex.value);
    if (type.value === "nfa") {
      return machine;
    } else if (type.value === "dfa") {
      return machine.toDFA();
    } else if (type.value === "mini nfa") {
      return machine.toMiniNFA();
    }
  } catch (e) {
    console.error("Automaton generation error:", e);
    return null;
  }
  return null;
});

const alphabetList = computed(() => {
  if (!currentAutomata.value || !currentAutomata.value.alphabets) return "";
  return currentAutomata.value.alphabets.join(", ");
});

const finalStatesList = computed(() => {
  if (!currentAutomata.value || !currentAutomata.value.finalStates) return "∅";
  const f = currentAutomata.value.finalStates;
  if (f.length === 0) return "∅";
  return f.map((s) => "q" + s).join(", ");
});

watch(
  rawRegex,
  (val) => {
    emits("update:modelValue", val);
    emits("input", normalizedRegex.value);
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (val) => {
    if (val !== rawRegex.value) {
      rawRegex.value = val;
    }
  }
);

watch(
  currentAutomata,
  (machine) => {
    emits("automata", machine);
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.automata-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.box-top-bar {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.regex-field-wrapper {
  flex: 1;
  min-width: 260px;
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1.4rem;
  color: var(--text-muted);
  pointer-events: none;
}

.regex-text-input {
  width: 100%;
  height: 4.8rem;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 9rem 0 4.2rem;
  color: var(--text-main);
  font-family: var(--font-mono);
  font-size: 1.6rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
  }

  &.has-error {
    border-color: var(--accent-rose);
  }
}

.input-actions {
  position: absolute;
  right: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.clear-btn {
  color: var(--text-muted);
  font-size: 1.4rem;
  padding: 0.2rem 0.6rem;
  border-radius: 0.4rem;

  &:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.1);
  }
}

.valid-check {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 0.3rem 0.8rem;
  border-radius: 2rem;
}

.invalid-mark {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.15);
  padding: 0.3rem 0.8rem;
  border-radius: 2rem;
}

.type-segmented-control {
  display: flex;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.3rem;
  gap: 0.3rem;
}

.seg-btn {
  padding: 0.8rem 1.4rem;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-main);
  }

  &.active {
    background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
    color: #090d16;
  }
}

.stats-strip {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  padding: 0.6rem 1.2rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;

  .stat-k {
    color: var(--text-muted);
  }

  .stat-v {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-main);
  }

  &.type-indicator {
    margin-left: auto;
  }
}

.type-tag {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent-cyan);
  background: rgba(6, 182, 212, 0.15);
  padding: 0.2rem 0.8rem;
  border-radius: 1rem;
}

.box-graph-area {
  width: 100%;
  height: 480px;
  position: relative;
}

.graph-empty-state {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, #111827 0%, #090d16 100%);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;

  .empty-icon {
    font-size: 3.6rem;
    margin-bottom: 1.2rem;
  }

  .empty-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.6rem;
  }

  .empty-sub {
    font-size: 1.4rem;
    color: var(--text-secondary);
    max-width: 400px;
    line-height: 1.5;

    code {
      font-family: var(--font-mono);
      color: var(--accent-cyan);
    }
  }
}
</style>

<template>
  <div class="graph-wrapper">
    <!-- Graph interactive toolbar -->
    <div class="graph-toolbar">
      <div class="graph-legend">
        <span class="legend-item start"><span class="legend-dot start"></span> Start (q0)</span>
        <span class="legend-item accept"><span class="legend-dot accept"></span> Accept State</span>
        <span class="legend-item active" v-if="activeStates && activeStates.length > 0">
          <span class="legend-dot active"></span> Active in Step
        </span>
      </div>

      <div class="graph-actions">
        <button class="tool-btn" @click="zoomIn" title="Zoom In" aria-label="Zoom In">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="tool-btn" @click="zoomOut" title="Zoom Out" aria-label="Zoom Out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="tool-btn" @click="fitView" title="Fit to View" aria-label="Fit to View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
        <button
          class="tool-btn"
          :class="{ active: physicsEnabled }"
          @click="togglePhysics"
          :title="physicsEnabled ? 'Freeze Physics' : 'Enable Physics'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
        </button>
        <button class="tool-btn" @click="exportImage" title="Export as PNG">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Vis-network canvas container -->
    <div ref="graphRef" class="network-container"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { Network } from "vis-network/standalone";

const props = defineProps({
  automata: {
    type: Object,
    required: true,
    validator(value) {
      return value && Array.isArray(value.states);
    },
  },
  activeStates: {
    type: Array,
    default: () => [],
  },
});

const graphRef = ref(null);
let networkInstance = null;
const physicsEnabled = ref(true);

const networkData = computed(() => {
  if (!props.automata || !props.automata.states) {
    return { nodes: [], edges: [] };
  }

  const finalStatesSet = new Set(props.automata.finalStates || []);
  const activeStatesSet = new Set(props.activeStates || []);

  const nodes = props.automata.states.map((_, index) => {
    const isStart = index === 0;
    const isFinal = finalStatesSet.has(index);
    const isActive = activeStatesSet.has(index);

    let background = "#1e293b";
    let border = "#475569";
    let borderWidth = 2;
    let fontColor = "#f1f5f9";
    let shadow = false;

    if (isActive) {
      background = "#f59e0b"; // Vibrant amber
      border = "#fef3c7";
      borderWidth = 4;
      fontColor = "#0f172a";
      shadow = {
        enabled: true,
        color: "rgba(245, 158, 11, 0.7)",
        size: 15,
        x: 0,
        y: 0,
      };
    } else if (isFinal) {
      background = "#064e3b"; // Rich emerald
      border = "#10b981";
      borderWidth = 3;
      fontColor = "#ecfdf5";
      shadow = {
        enabled: true,
        color: "rgba(16, 185, 129, 0.4)",
        size: 10,
        x: 0,
        y: 0,
      };
    } else if (isStart) {
      background = "#1e3a8a"; // Indigo-blue start node
      border = "#3b82f6";
      borderWidth = 2.5;
      fontColor = "#eff6ff";
    }

    return {
      id: index,
      label: isStart ? `→ q${index}` : `q${index}`,
      shape: isFinal ? "circle" : "circle",
      margin: 12,
      borderWidth,
      shadow,
      color: {
        background,
        border,
        hover: {
          background: isActive ? "#fbbf24" : isFinal ? "#047857" : "#334155",
          border: "#38bdf8",
        },
        highlight: {
          background: "#f59e0b",
          border: "#fff",
        },
      },
      font: {
        face: "JetBrains Mono, monospace",
        color: fontColor,
        size: 16,
        bold: {
          color: fontColor,
        },
      },
    };
  });

  // Group multiple transitions between same (from, to) nodes
  const edges = [];
  for (let index = 0; index < props.automata.states.length; index++) {
    const rawTransitions = props.automata.states[index] || [];
    // Clone so we don't mutate original state array
    const transitionsMap = new Map();

    for (const t of rawTransitions) {
      if (!transitionsMap.has(t.to)) {
        transitionsMap.set(t.to, []);
      }
      transitionsMap.get(t.to).push(t.value);
    }

    transitionsMap.forEach((values, toNode) => {
      const labelText = values.join(", ");
      const isLoop = index === toNode;
      const isFromActive = activeStatesSet.has(index);

      edges.push({
        from: index,
        to: toNode,
        label: labelText,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.8,
          },
        },
        color: {
          color: isFromActive ? "#f59e0b" : "#64748b",
          highlight: "#38bdf8",
          hover: "#38bdf8",
        },
        width: isFromActive ? 2.5 : 1.5,
        smooth: isLoop
          ? { enabled: true, type: "continuous" }
          : { enabled: true, type: "curvedCW", roundness: 0.2 },
        font: {
          face: "JetBrains Mono, monospace",
          color: "#f8fafc",
          size: 14,
          strokeWidth: 4,
          strokeColor: "#0b0f19",
          align: "middle",
        },
      });
    });
  }

  return { nodes, edges };
});

const defaultOptions = {
  autoResize: true,
  nodes: {
    shape: "circle",
    size: 25,
  },
  physics: {
    enabled: true,
    solver: "barnesHut",
    barnesHut: {
      gravitationalConstant: -2800,
      centralGravity: 0.35,
      springLength: 120,
      springConstant: 0.05,
      damping: 0.25,
      avoidOverlap: 0.6,
    },
    stabilization: {
      enabled: true,
      iterations: 150,
      updateInterval: 25,
    },
  },
  interaction: {
    hover: true,
    navigationButtons: false,
    keyboard: false,
    zoomView: true,
    dragView: true,
  },
};

const renderNetwork = () => {
  if (!graphRef.value) return;
  if (networkInstance) {
    networkInstance.setData(networkData.value);
  } else {
    networkInstance = new Network(graphRef.value, networkData.value, defaultOptions);
  }
};

const zoomIn = () => {
  if (!networkInstance) return;
  const scale = networkInstance.getScale();
  networkInstance.moveTo({ scale: scale * 1.3, animation: { duration: 250 } });
};

const zoomOut = () => {
  if (!networkInstance) return;
  const scale = networkInstance.getScale();
  networkInstance.moveTo({ scale: scale / 1.3, animation: { duration: 250 } });
};

const fitView = () => {
  if (!networkInstance) return;
  networkInstance.fit({ animation: { duration: 400, easingFunction: "easeInOutQuad" } });
};

const togglePhysics = () => {
  physicsEnabled.value = !physicsEnabled.value;
  if (networkInstance) {
    networkInstance.setOptions({ physics: { enabled: physicsEnabled.value } });
  }
};

const exportImage = () => {
  if (!graphRef.value) return;
  const canvas = graphRef.value.querySelector("canvas");
  if (!canvas) return;
  const imageURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imageURL;
  link.download = `regex-automaton-${Date.now()}.png`;
  link.click();
};

onMounted(() => {
  renderNetwork();
  setTimeout(() => fitView(), 300);
});

watch(
  () => props.automata,
  () => {
    renderNetwork();
    setTimeout(() => fitView(), 200);
  },
  { deep: true }
);

watch(
  () => props.activeStates,
  () => {
    renderNetwork();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (networkInstance) {
    networkInstance.destroy();
    networkInstance = null;
  }
});
</script>

<style scoped lang="scss">
.graph-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 380px;
  background: radial-gradient(circle at 50% 50%, #111827 0%, #090d16 100%);
  border-radius: 1.2rem;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

.graph-toolbar {
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  right: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}

.graph-legend {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: auto;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 500;

  &.start .legend-dot {
    background: #3b82f6;
    box-shadow: 0 0 8px #3b82f6;
  }
  &.accept .legend-dot {
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
  }
  &.active .legend-dot {
    background: #f59e0b;
    box-shadow: 0 0 10px #f59e0b;
    animation: pulse-dot 1.5s infinite;
  }
}

.legend-dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.8;
  }
}

.graph-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  padding: 0.4rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tool-btn {
  width: 3.2rem;
  height: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border-radius: 0.6rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.15);
  }
}

.network-container {
  width: 100%;
  height: 100%;
  flex: 1;
}
</style>

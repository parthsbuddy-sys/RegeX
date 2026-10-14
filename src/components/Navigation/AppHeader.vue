<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo Branding -->
      <div class="brand-group">
        <div class="brand-logo">
          <span class="logo-symbol">⚡</span>
        </div>
        <div class="brand-text">
          <div class="brand-title-row">
            <h1 class="brand-name">RegeX</h1>
            <span class="brand-badge">Education Studio</span>
          </div>
          <p class="brand-tagline">Visual Automata Theory & Step Simulator</p>
        </div>
      </div>

      <!-- Navigation Modes -->
      <nav class="nav-modes">
        <button
          class="nav-tab"
          :class="{ active: currentMode === 'studio' }"
          @click="$emit('update:mode', 'studio')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
          Simulation Studio
        </button>

        <button
          class="nav-tab"
          :class="{ active: currentMode === 'compare' }"
          @click="$emit('update:mode', 'compare')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 3 21 3 21 8"></polyline>
            <line x1="4" y1="20" x2="21" y2="3"></line>
            <polyline points="21 16 21 21 16 21"></polyline>
            <line x1="15" y1="15" x2="21" y2="21"></line>
            <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>
          Equivalence Checker
        </button>

        <button
          class="nav-tab"
          :class="{ active: currentMode === 'theory' }"
          @click="$emit('update:mode', 'theory')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Theory Guide
        </button>
      </nav>

      <!-- Right Header Actions: Presets & Help -->
      <div class="header-actions">
        <!-- Preset Dropdown -->
        <div class="preset-dropdown">
          <button class="action-btn preset-btn" @click="togglePresets">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Examples
            <span class="chevron">▾</span>
          </button>

          <div class="dropdown-menu" v-if="showPresetsMenu">
            <div class="dropdown-header">Educational Presets</div>
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="dropdown-item"
              @click="selectPreset(preset)"
            >
              <span class="preset-name">{{ preset.name }}</span>
              <code class="preset-code">{{ preset.regex }}</code>
            </button>
          </div>
        </div>

        <!-- Syntax Reference Help Button -->
        <button class="action-btn help-btn" @click="$emit('toggle:help')" title="Regex Syntax Cheat Sheet">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Syntax
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { EDUCATIONAL_PRESETS } from "@/utilities/simulationEngine.js";

defineProps({
  currentMode: {
    type: String,
    default: "studio",
  },
});

const emits = defineEmits(["update:mode", "select:preset", "toggle:help"]);

const showPresetsMenu = ref(false);
const presets = EDUCATIONAL_PRESETS;

const togglePresets = () => {
  showPresetsMenu.value = !showPresetsMenu.value;
};

const selectPreset = (preset) => {
  emits("select:preset", preset);
  showPresetsMenu.value = false;
};
</script>

<style scoped lang="scss">
.app-header {
  width: 100%;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.2rem 2.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.brand-logo {
  width: 4.2rem;
  height: 4.2rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);

  .logo-symbol {
    font-size: 2.2rem;
  }
}

.brand-title-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.brand-name {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #f8fafc 30%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-badge {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.8rem;
  border-radius: 2rem;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.brand-tagline {
  font-size: 1.2rem;
  color: var(--text-muted);
}

.nav-modes {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  padding: 0.4rem;
  gap: 0.4rem;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.4rem;
  border-radius: 0.7rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15));
    color: var(--accent-cyan);
    border: 1px solid rgba(6, 182, 212, 0.3);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preset-dropdown {
  position: relative;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.4rem;
  border-radius: 0.8rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 1.3rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-surface-elevated);
    border-color: var(--border-strong);
  }

  .chevron {
    font-size: 1rem;
    color: var(--text-muted);
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.8rem);
  right: 0;
  width: 28rem;
  background: #111827;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.8rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  z-index: 100;
  animation: slideDown 0.15s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.6rem 0.8rem;
}

.dropdown-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.8rem;
  border-radius: 0.6rem;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .preset-name {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .preset-code {
    font-size: 1.2rem;
    font-family: var(--font-mono);
    color: var(--accent-cyan);
    margin-top: 0.2rem;
  }
}

.help-btn {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;

  &:hover {
    background: rgba(99, 102, 241, 0.22);
    color: #fff;
  }
}
</style>

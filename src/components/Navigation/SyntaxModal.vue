<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="header-icon">⚡</div>
        <h3 class="modal-title">RegeX Syntax & Operators</h3>
        <button class="close-btn" @click="$emit('close')" aria-label="Close modal">✕</button>
      </div>

      <div class="modal-body">
        <p class="modal-intro">
          RegeX converts algebraic regular expressions into finite state automata (NFA, DFA, and Mini NFA).
          Use the following syntax conventions:
        </p>

        <div class="syntax-grid">
          <div class="syntax-card">
            <div class="syntax-op">Union / Alternation</div>
            <code class="syntax-code">a + b &nbsp;or&nbsp; a | b</code>
            <p class="syntax-desc">Matches string 'a' or string 'b'. Example: <code>(0+1)</code></p>
          </div>

          <div class="syntax-card">
            <div class="syntax-op">Concatenation</div>
            <code class="syntax-code">ab &nbsp;or&nbsp; a.b</code>
            <p class="syntax-desc">Matches 'a' followed immediately by 'b'.</p>
          </div>

          <div class="syntax-card">
            <div class="syntax-op">Kleene Star</div>
            <code class="syntax-code">a* &nbsp;or&nbsp; (a+b)*</code>
            <p class="syntax-desc">Matches zero or more repetitions of the operand.</p>
          </div>

          <div class="syntax-card">
            <div class="syntax-op">Parentheses (Grouping)</div>
            <code class="syntax-code">(a+b)*abb</code>
            <p class="syntax-desc">Explicitly controls precedence of operators.</p>
          </div>

          <div class="syntax-card">
            <div class="syntax-op">Lambda / Epsilon Transition</div>
            <code class="syntax-code">λ &nbsp;or&nbsp; ε</code>
            <p class="syntax-desc">Represents the empty string (spontaneous transition in NFA).</p>
          </div>

          <div class="syntax-card">
            <div class="syntax-op">Equivalence Test</div>
            <code class="syntax-code">R₁ == R₂</code>
            <p class="syntax-desc">Checks whether two regular expressions accept the identical formal language.</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="modal-action-btn" @click="$emit('close')">Got It</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(["close"]);
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  width: 100%;
  max-width: 680px;
  background: #111827;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.modal-header {
  padding: 1.6rem 2rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.header-icon {
  font-size: 2rem;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
  flex: 1;
}

.close-btn {
  color: var(--text-muted);
  font-size: 1.6rem;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-main);
  }
}

.modal-body {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-intro {
  font-size: 1.4rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.6rem;
}

.syntax-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.2rem;
}

.syntax-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 1.4rem;
}

.syntax-op {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.6rem;
}

.syntax-code {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 1.3rem;
  color: var(--accent-cyan);
  background: rgba(6, 182, 212, 0.12);
  padding: 0.2rem 0.8rem;
  border-radius: 0.4rem;
  margin-bottom: 0.6rem;
}

.syntax-desc {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.4;

  code {
    font-family: var(--font-mono);
    color: #e2e8f0;
  }
}

.modal-footer {
  padding: 1.4rem 2rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
}

.modal-action-btn {
  padding: 0.8rem 2rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
  color: #0b0f19;
  font-weight: 700;
  font-size: 1.3rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}
</style>

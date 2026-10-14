<template>
  <div class="theory-guide">
    <div class="guide-header">
      <div class="header-badge">Formal Language Theory</div>
      <h2 class="guide-title">Automata Theory & Conversion Pipeline Guide</h2>
      <p class="guide-desc">
        Master the theoretical concepts and mathematical algorithms behind Regular Expressions,
        Nondeterministic Finite Automata (NFA), Deterministic Finite Automata (DFA), and Minimized NFA (Mini NFA).
      </p>
    </div>

    <!-- Cards Grid -->
    <div class="concepts-grid">
      <!-- Card 1: Regular Expression Basics -->
      <div class="concept-card">
        <div class="concept-top">
          <span class="step-num">01</span>
          <span class="concept-tag">Syntax & Semantics</span>
        </div>
        <h3 class="concept-heading">Regular Expressions (RE)</h3>
        <p class="concept-body">
          A regular expression is a algebraic specification of a formal language over an alphabet Σ.
        </p>
        <ul class="concept-list">
          <li><strong>Symbol a:</strong> Matches literal symbol \(a \in \Sigma\).</li>
          <li><strong>Union (a + b or a | b):</strong> Language \(L(a) \cup L(b)\) (either a or b).</li>
          <li><strong>Concatenation (ab):</strong> Language \(L(a) \cdot L(b)\) (a followed by b).</li>
          <li><strong>Kleene Star (a*):</strong> Zero or more repetitions \(\bigcup_{i=0}^\infty L(a)^i\).</li>
          <li><strong>Empty string (λ or ε):</strong> String of length zero.</li>
        </ul>
      </div>

      <!-- Card 2: Thompson's Construction -->
      <div class="concept-card">
        <div class="concept-top">
          <span class="step-num">02</span>
          <span class="concept-tag">Regex → NFA</span>
        </div>
        <h3 class="concept-heading">Thompson's Construction</h3>
        <p class="concept-body">
          Constructs an \(\epsilon\)-NFA compositionally from a regular expression with guaranteed properties:
        </p>
        <ul class="concept-list">
          <li>Exactly <strong>one start state</strong> with no incoming transitions.</li>
          <li>Exactly <strong>one accept state</strong> with no outgoing transitions.</li>
          <li>Every state has at most two outgoing \(\lambda\)-transitions.</li>
          <li>Linear size: At most \(2 \times |regex|\) states.</li>
        </ul>
      </div>

      <!-- Card 3: Subset Construction -->
      <div class="concept-card">
        <div class="concept-top">
          <span class="step-num">03</span>
          <span class="concept-tag">NFA → DFA</span>
        </div>
        <h3 class="concept-heading">Powerset / Subset Construction</h3>
        <p class="concept-body">
          Eliminates nondeterminism and \(\lambda\)-transitions to produce an equivalent Deterministic Finite Automaton:
        </p>
        <ul class="concept-list">
          <li>Each DFA state corresponds to a <strong>subset of NFA states</strong> (\(Q_{DFA} \subseteq \mathcal{P}(Q_{NFA})\)).</li>
          <li>Initial DFA state: \(\lambda\text{-closure}(q_0)\).</li>
          <li>Transition: \(\delta_{DFA}(S, a) = \lambda\text{-closure}\left(\bigcup_{s \in S} \delta_{NFA}(s, a)\right)\).</li>
          <li>DFA accept state: any subset containing at least one NFA final state.</li>
        </ul>
      </div>

      <!-- Card 4: Mini NFA Construction -->
      <div class="concept-card">
        <div class="concept-top">
          <span class="step-num">04</span>
          <span class="concept-tag">NFA → Mini NFA</span>
        </div>
        <h3 class="concept-heading">Minimized / ε-Free NFA (Mini NFA)</h3>
        <p class="concept-body">
          Eliminates intermediate \(\lambda\)-transitions and prunes unreachable states to produce a compact, efficient NFA:
        </p>
        <ul class="concept-list">
          <li>Computes the \(\lambda\)-closure \(\Lambda(q)\) for each state in Thompson's NFA.</li>
          <li>New direct transition: \(\delta_{mini}(q, a) = \Lambda\left(\delta(\Lambda(q), a)\right)\) for each symbol \(a \in \Sigma\).</li>
          <li>Accept states: any state whose \(\lambda\)-closure contains an original final state.</li>
          <li>Removes all \(\lambda\)-transitions and unreferenced states, yielding a minimal non-deterministic machine.</li>
        </ul>
      </div>
    </div>

    <!-- Quick Reference Syntax Table -->
    <div class="syntax-reference-section">
      <h3 class="ref-title">RegeX Syntax Reference Cheat Sheet</h3>
      <div class="ref-table-wrapper">
        <table class="ref-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Supported Syntax</th>
              <th>Example</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Union</strong></td>
              <td><code>+</code> or <code>|</code></td>
              <td><code>a+b</code> or <code>a|b</code></td>
              <td>Matches either 'a' or 'b'</td>
            </tr>
            <tr>
              <td><strong>Concatenation</strong></td>
              <td>Juxtaposition or <code>.</code></td>
              <td><code>ab</code></td>
              <td>Matches 'a' immediately followed by 'b'</td>
            </tr>
            <tr>
              <td><strong>Kleene Star</strong></td>
              <td><code>*</code></td>
              <td><code>a*</code></td>
              <td>Matches zero or more repetitions of 'a'</td>
            </tr>
            <tr>
              <td><strong>Grouping</strong></td>
              <td><code>( )</code></td>
              <td><code>(a+b)*</code></td>
              <td>Forces precedence of sub-expressions</td>
            </tr>
            <tr>
              <td><strong>Empty String</strong></td>
              <td><code>λ</code> or <code>ε</code></td>
              <td><code>(a+λ)b</code></td>
              <td>Matches empty string (optional 'a')</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.theory-guide {
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.6rem 0;
}

.guide-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.header-badge {
  display: inline-block;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-cyan);
  background: rgba(6, 182, 212, 0.15);
  padding: 0.4rem 1.2rem;
  border-radius: 2rem;
  border: 1px solid rgba(6, 182, 212, 0.3);
  margin-bottom: 1rem;
}

.guide-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.guide-desc {
  font-size: 1.5rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.concepts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.concept-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 2.4rem;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(6, 182, 212, 0.4);
  }
}

.concept-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-num {
  font-size: 2.4rem;
  font-weight: 800;
  font-family: var(--font-mono);
  color: rgba(255, 255, 255, 0.15);
}

.concept-tag {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-cyan);
  background: rgba(6, 182, 212, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 0.6rem;
}

.concept-heading {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
}

.concept-body {
  font-size: 1.3rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.concept-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.4rem;

  li {
    font-size: 1.25rem;
    color: var(--text-secondary);
    line-height: 1.4;

    strong {
      color: var(--text-main);
    }
  }
}

.syntax-reference-section {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 2.4rem;
  backdrop-filter: blur(12px);
}

.ref-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 1.6rem;
}

.ref-table-wrapper {
  overflow-x: auto;
}

.ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.3rem;

  thead th {
    background: #0f172a;
    padding: 1rem 1.4rem;
    font-weight: 700;
    color: var(--text-secondary);
    border-bottom: 1.5px solid var(--border-subtle);
    text-align: left;
  }

  tbody td {
    padding: 1rem 1.4rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
  }

  code {
    font-family: var(--font-mono);
    color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.1);
    padding: 0.2rem 0.6rem;
    border-radius: 0.4rem;
  }
}
</style>

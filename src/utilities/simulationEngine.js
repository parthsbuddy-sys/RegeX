/**
 * Simulation Engine for RegeX Finite Automata
 * Handles step-by-step string simulation, epsilon closures,
 * transition tables, and batch string evaluation for NFA, DFA, and Min-DFA.
 */

/**
 * Computes the epsilon (lambda) closure for a given set of states in an automaton.
 * @param {Object} automata - The FiniteAutomata instance
 * @param {number[]} initialStates - Array of state indices
 * @returns {number[]} - Array of state indices reachable via 0 or more lambda transitions
 */
export function getEpsilonClosure(automata, initialStates) {
  if (!automata || !automata.states) return [];
  const closure = new Set(initialStates);
  const queue = [...initialStates];

  while (queue.length > 0) {
    const currentState = queue.shift();
    const transitions = automata.states[currentState] || [];
    for (const transition of transitions) {
      if (
        (transition.value === "λ" || transition.value === "ε" || transition.value === "e") &&
        !closure.has(transition.to)
      ) {
        closure.add(transition.to);
        queue.push(transition.to);
      }
    }
  }

  return Array.from(closure).sort((a, b) => a - b);
}

/**
 * Simulates a single character step from a set of states.
 * @param {Object} automata
 * @param {number[]} currentStates
 * @param {string} symbol
 * @returns {{ nextStates: number[], transitionsTaken: Array<{from: number, to: number, value: string}> }}
 */
export function stepTransition(automata, currentStates, symbol) {
  if (!automata || !automata.states) return { nextStates: [], transitionsTaken: [] };

  const targetStates = new Set();
  const transitionsTaken = [];

  for (const state of currentStates) {
    const transitions = automata.states[state] || [];
    for (const transition of transitions) {
      if (transition.value === symbol) {
        targetStates.add(transition.to);
        transitionsTaken.push({
          from: state,
          to: transition.to,
          value: transition.value,
        });
      }
    }
  }

  const nextStatesWithLambda = getEpsilonClosure(
    automata,
    Array.from(targetStates)
  );

  return {
    nextStates: nextStatesWithLambda,
    transitionsTaken,
  };
}

/**
 * Builds the complete step-by-step trace of running a string w through an automaton.
 * @param {Object} automata
 * @param {string} inputString
 * @returns {Object} - Simulation trace object
 */
export function buildSimulationTrace(automata, inputString = "") {
  if (!automata || !automata.states || automata.states.length === 0) {
    return {
      isValid: false,
      steps: [],
      accepted: false,
      message: "No automaton available to simulate.",
    };
  }

  const cleanString = inputString.trim();
  const steps = [];

  // Step 0: Initialization at start state q0 (including epsilon-closure)
  const initialStates = getEpsilonClosure(automata, [0]);
  const isInitialAccepted = initialStates.some((s) =>
    automata.finalStates.includes(s)
  );

  steps.push({
    stepIndex: 0,
    charIndex: -1,
    symbol: null,
    currentStates: [...initialStates],
    transitionsTaken: [],
    remainingString: cleanString,
    consumedString: "",
    isAcceptedState: isInitialAccepted,
    status: cleanString.length === 0 ? (isInitialAccepted ? "accepted" : "rejected") : "running",
    description:
      initialStates.length > 1
        ? `Initialized machine at start state q0 with λ-closure: {${initialStates.map((s) => "q" + s).join(", ")}}`
        : `Initialized machine at start state q0`,
  });

  if (cleanString.length === 0) {
    return {
      isValid: true,
      steps,
      accepted: isInitialAccepted,
      finalStates: initialStates,
      totalSteps: 1,
      inputString: "",
    };
  }

  let activeStates = [...initialStates];

  for (let i = 0; i < cleanString.length; i++) {
    const symbol = cleanString[i];
    const { nextStates, transitionsTaken } = stepTransition(
      automata,
      activeStates,
      symbol
    );

    const isLastChar = i === cleanString.length - 1;
    const isTrapped = nextStates.length === 0;
    const reachesAccept = nextStates.some((s) =>
      automata.finalStates.includes(s)
    );

    let status = "running";
    if (isTrapped) {
      status = "rejected";
    } else if (isLastChar) {
      status = reachesAccept ? "accepted" : "rejected";
    }

    let description = "";
    if (isTrapped) {
      description = `No valid transition for symbol '${symbol}' from current state(s). Machine is halted/trapped.`;
    } else {
      const fromStr = activeStates.map((s) => "q" + s).join(", ");
      const toStr = nextStates.map((s) => "q" + s).join(", ");
      description = `Read symbol '${symbol}': δ({${fromStr}}, '${symbol}') → {${toStr}}`;
    }

    steps.push({
      stepIndex: i + 1,
      charIndex: i,
      symbol,
      fromStates: [...activeStates],
      currentStates: [...nextStates],
      transitionsTaken,
      consumedString: cleanString.slice(0, i + 1),
      remainingString: cleanString.slice(i + 1),
      isAcceptedState: reachesAccept,
      status,
      description,
    });

    activeStates = nextStates;
    if (isTrapped) break;
  }

  const lastStep = steps[steps.length - 1];
  const accepted = lastStep.status === "accepted";

  return {
    isValid: true,
    steps,
    accepted,
    finalStates: activeStates,
    totalSteps: steps.length,
    inputString: cleanString,
  };
}

/**
 * Extracts the transition table for the automaton.
 * @param {Object} automata
 * @returns {Object}
 */
export function getTransitionTable(automata) {
  if (!automata || !automata.states) {
    return { alphabets: [], rows: [] };
  }

  // Filter out lambda from visible alphabets for DFA / Mini NFA, keep for Thompson NFA if present
  const alphabets = (automata.alphabets || []).filter((a) => a !== "λ");
  const hasLambda = (automata.alphabets || []).includes("λ");
  if (hasLambda) {
    alphabets.push("λ");
  }

  const rows = automata.states.map((transitions, stateIndex) => {
    const isStart = stateIndex === 0;
    const isFinal = (automata.finalStates || []).includes(stateIndex);
    const row = {
      state: stateIndex,
      name: "q" + stateIndex,
      isStart,
      isFinal,
      transitions: {},
    };

    for (const alpha of alphabets) {
      const targets = transitions
        .filter((t) => t.value === alpha)
        .map((t) => "q" + t.to);
      row.transitions[alpha] = targets.length > 0 ? targets.join(", ") : "—";
    }

    return row;
  });

  return {
    alphabets,
    rows,
    stateCount: automata.states.length,
    finalStatesCount: (automata.finalStates || []).length,
  };
}

/**
 * Batch tests multiple candidate strings against the automaton.
 * @param {Object} automata
 * @param {string[]} strings
 * @returns {Array<{string: string, accepted: boolean, stepsCount: number}>}
 */
export function batchTestStrings(automata, strings = []) {
  return strings.map((str) => {
    const trace = buildSimulationTrace(automata, str);
    return {
      string: str,
      accepted: trace.accepted,
      stepsCount: trace.steps.length,
    };
  });
}

/**
 * Standard preset regular expressions for education
 */
export const EDUCATIONAL_PRESETS = [
  {
    name: "Ends with 'abb'",
    regex: "(a+b)*abb",
    description: "Accepts any string over {a, b} ending in 'abb'",
    testCases: ["abb", "aabb", "babb", "ab", "a", ""],
  },
  {
    name: "Alternating 'a' & 'b'",
    regex: "a(ba)*b",
    description: "Strings starting with 'a', ending with 'b', with alternating 'ba'",
    testCases: ["ab", "abab", "ababb", "a", "ba"],
  },
  {
    name: "Contains double zero '00'",
    regex: "(0+1)*00(0+1)*",
    description: "Binary strings containing at least two consecutive zeros",
    testCases: ["00", "100", "001", "101001", "10101", ""],
  },
  {
    name: "Ends with double character",
    regex: "(a+b)*(aa+bb)",
    description: "Strings over {a, b} ending with either 'aa' or 'bb'",
    testCases: ["aa", "bb", "abaa", "babb", "ab", "ba"],
  },
  {
    name: "Even length alternating",
    regex: "(ab+ba)*",
    description: "Strings composed of 'ab' and 'ba' pairs (even length)",
    testCases: ["", "ab", "ba", "abba", "baab", "a", "b"],
  },
  {
    name: "Non-empty a*b* sequence",
    regex: "a*b*",
    description: "Zero or more 'a's followed by zero or more 'b's",
    testCases: ["", "a", "b", "aaabbb", "ba", "ab"],
  },
];

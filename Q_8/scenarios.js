const DependencyResolver = require('./resolver');
const { summarize } = require('./utils');

// -------- 1) Simple linear chain --------
function scenarioSimpleLinear() {
  const r = new DependencyResolver();
  r.addDependency("A", "B");
  r.addDependency("B", "C");
  r.addDependency("D", "A");

  const res = r.resolve();
  summarize(res, "Scenario 1: Simple linear chain");
  console.log(`  Order: ${res.order.join(" -> ")}`);
  console.log(`  Batches: ${JSON.stringify(res.batches)}`);
}

// -------- 2) Parallel branches --------
function scenarioParallel() {
  const r = new DependencyResolver();
  r.addDependency("A", "C");
  r.addDependency("B", "C");
  r.addDependency("D", "A");
  r.addDependency("D", "B");
  r.addDependency("E", "D");

  const res = r.resolve();
  summarize(res, "Scenario 2: Parallel branches");
  console.log(`  Batches:`);
  res.batches.forEach((b, i) => console.log(`    Batch ${i + 1}: [${b.join(", ")}]`));
}

// -------- 3) Simple cycle --------
function scenarioSimpleCycle() {
  const r = new DependencyResolver();
  r.addDependency("A", "B");
  r.addDependency("B", "C");
  r.addDependency("C", "A");

  const res = r.resolve();
  summarize(res, "Scenario 3: Simple cycle (A->B->C->A)");
}

// -------- 4) Self-loop --------
function scenarioSelfLoop() {
  const r = new DependencyResolver();
  r.addDependency("A", "B");
  r.addDependency("X", "X"); // self loop
  r.addDependency("C", "A");

  const res = r.resolve();
  summarize(res, "Scenario 4: Self-loop (X depends on X)");
}

// -------- 5) Diamond + disconnected components --------
function scenarioDiamondDisconnected() {
  const r = new DependencyResolver();
  // Diamond
  r.addDependency("B", "A");
  r.addDependency("C", "A");
  r.addDependency("D", "B");
  r.addDependency("D", "C");
  // Disconnected component
  r.addDependency("Y", "X");
  r.addDependency("Z", "Y");

  const res = r.resolve();
  summarize(res, "Scenario 5: Diamond + disconnected component");
  console.log(`  Batches:`);
  res.batches.forEach((b, i) => console.log(`    Batch ${i + 1}: [${b.join(", ")}]`));
}

// -------- 6) Hidden cycle inside a large DAG --------
function scenarioHiddenCycle() {
  const N = 5000;
  const r = new DependencyResolver();

  // Build a long chain: T0 -> T1 -> ... -> T(N-1)
  for (let i = 0; i < N - 1; i++) {
    r.addDependency(`T${i + 1}`, `T${i}`);
  }
  // Create a hidden back-edge in the middle: T(100) depends on T(3000)
  // This introduces a cycle T100 -> T101 -> ... -> T3000 -> T100
  r.addDependency(`T100`, `T3000`);

  const res = r.resolve();
  summarize(res, "Scenario 6: Hidden cycle inside a 5000-task chain");
  console.log(`  Cyclic tasks count : ${res.cyclicTasks.length}`);
  console.log(`  First cyclic tasks : ${res.cyclicTasks.slice(0, 5).join(", ")}`);
  console.log(`  Last  cyclic tasks : ${res.cyclicTasks.slice(-5).join(", ")}`);
}

// -------- 7) Large random DAG (100k tasks) --------
function scenarioLargeDAG() {
  const N = 100_000;
  const AVG_DEPS = 3;
  const r = new DependencyResolver();

  // Add all tasks
  for (let i = 0; i < N; i++) r.addTask(`T${i}`);

  // Only edges from lower index to higher index => guarantees a DAG
  for (let i = 0; i < N; i++) {
    const deps = Math.floor(Math.random() * AVG_DEPS) + 1;
    for (let d = 0; d < deps; d++) {
      const target = i + 1 + Math.floor(Math.random() * 50);
      if (target < N) {
        r.addDependency(`T${target}`, `T${i}`);
      }
    }
  }

  const res = r.resolve();
  summarize(res, `Scenario 7: Large random DAG (${N.toLocaleString()} tasks)`);
  console.log(`  First batch size   : ${res.batches[0].length}`);
  console.log(`  Last  batch size   : ${res.batches[res.batches.length - 1].length}`);
}

// -------- 8) Large graph with a single hidden cycle --------
function scenarioLargeWithHiddenCycle() {
  const N = 100_000;
  const r = new DependencyResolver();

  for (let i = 0; i < N; i++) r.addTask(`T${i}`);

  // Almost-DAG: edges forward only
  for (let i = 0; i < N; i++) {
    const deps = Math.floor(Math.random() * 3) + 1;
    for (let d = 0; d < deps; d++) {
      const target = i + 1 + Math.floor(Math.random() * 20);
      if (target < N) r.addDependency(`T${target}`, `T${i}`);
    }
  }

  // Inject ONE back-edge deep in the middle to create a huge hidden cycle
  r.addDependency(`T5`, `T${N - 5}`);

  const res = r.resolve();
  summarize(res, `Scenario 8: Large graph with a single hidden cycle (${N.toLocaleString()} tasks)`);
  console.log(`  Cyclic tasks count : ${res.cyclicTasks.length.toLocaleString()}`);
  console.log(`  First 3 cyclic     : ${res.cyclicTasks.slice(0, 3).join(", ")}`);
  console.log(`  Last  3 cyclic     : ${res.cyclicTasks.slice(-3).join(", ")}`);
}

// -------- 9) Wide frontier (many parallel tasks) --------
function scenarioWideFrontier() {
  const N = 50_000;
  const r = new DependencyResolver();

  // One root, then 50k tasks all depending only on the root => huge parallel batch
  r.addTask("ROOT");
  for (let i = 0; i < N; i++) {
    r.addDependency(`T${i}`, "ROOT");
  }
  // And a final sink depending on everyone
  r.addTask("SINK");
  for (let i = 0; i < N; i++) {
    r.addDependency("SINK", `T${i}`);
  }

  const res = r.resolve();
  summarize(res, "Scenario 9: Wide frontier (50k parallel tasks)");
  console.log(`  Batch sizes        : [${res.batches.map(b => b.length).join(", ")}]`);
}

// -------- 10) Extremely deep chain (recursion killer) --------
function scenarioDeepChain() {
  const N = 500_000;
  const r = new DependencyResolver();

  // Chain of 500k tasks: this would blow the call stack with a recursive DFS
  for (let i = 0; i < N - 1; i++) {
    r.addDependency(`T${i + 1}`, `T${i}`);
  }

  const res = r.resolve();
  summarize(res, `Scenario 10: Extremely deep chain (${N.toLocaleString()} tasks)`);
  console.log(`  Batch count        : ${res.batchCount.toLocaleString()}`);
  console.log(`  First order task   : ${res.order[0]}`);
  console.log(`  Last  order task   : ${res.order[res.order.length - 1]}`);
}

module.exports = {
  scenarioSimpleLinear,
  scenarioParallel,
  scenarioSimpleCycle,
  scenarioSelfLoop,
  scenarioDiamondDisconnected,
  scenarioHiddenCycle,
  scenarioLargeDAG,
  scenarioLargeWithHiddenCycle,
  scenarioWideFrontier,
  scenarioDeepChain
};

#!/usr/bin/env node

const {
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
} = require('./scenarios');

const { line, formatMs } = require('./utils');

function runAll() {
  const t0 = process.hrtime.bigint();

  scenarioSimpleLinear();
  scenarioParallel();
  scenarioSimpleCycle();
  scenarioSelfLoop();
  scenarioDiamondDisconnected();
  scenarioHiddenCycle();
  scenarioLargeDAG();
  scenarioLargeWithHiddenCycle();
  scenarioWideFrontier();
  scenarioDeepChain();

  const t1 = process.hrtime.bigint();
  console.log(`\n${line("=")}`);
  console.log(`🏁 Total wall-clock time: ${formatMs(Number(t1 - t0) / 1e6)}`);
  console.log(line("="));
}

runAll();

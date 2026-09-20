'use strict';

const v8 = require('v8');
const {
  suiteA_PureRam,
  suiteB_TieredRatios,
  suiteC_SsdLatency,
  suiteD_Skew,
  suiteE_ValueSize,
  suiteF_Optimizations,
  TIERED_WEIGHTS,
  printRanking
} = require('./suites');

async function main() {
  const t0 = process.hrtime.bigint();
  console.log('='.repeat(140));
  console.log('LRU Cache — Production-Grade Workload Benchmark (Optimized Runtime)');
  console.log(`Node.js heap limit: ${(v8.getHeapStatistics().heap_size_limit / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Virtual clock: TTL measured in ops | Zipf α=1.0 | keySpace=5× capacity | seed=42`);
  console.log(`Tiered cache: Write-Back Buffer + Promotion Hysteresis (LRU-2)`);
  console.log('='.repeat(140));

  // Lighter suites first (fail fast)
  await suiteF_Optimizations();
  await suiteC_SsdLatency();
  await suiteD_Skew();
  const b = await suiteB_TieredRatios();
  await suiteA_PureRam();
  await suiteE_ValueSize();

  const t1 = process.hrtime.bigint();
  console.log(`\nTotal benchmark time: ${(Number(t1 - t0) / 1e9 / 60).toFixed(2)} minutes`);

  printRanking('RANKING — Suite B (RAM ratios)', b, TIERED_WEIGHTS);

  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });

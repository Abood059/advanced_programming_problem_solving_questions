const { SeededRandom, VirtualClock, pad, padL } = require('./utils');
const { generateWorkload } = require('./workload');
const { benchmark } = require('./benchmark-runner');
const { PureRamCache } = require('./pure-ram-cache');
const { TieredCache } = require('./tiered-cache');

const DEFAULT_PUT_RATIO = 0.5;
const DEFAULT_ALPHA = 1.0;

async function suiteA_PureRam() {
  console.log('\n' + '='.repeat(140));
  console.log('SUITE A: Pure RAM — Zipf α=1.0 | keySpace = 5× capacity | ops = 10× capacity');
  console.log('='.repeat(140));

  const configs = [
    { label: '50K items',  capacity: 50_000,   ttl: 5_000_000,  iterations: 2 },
    { label: '200K items', capacity: 200_000,  ttl: 20_000_000, iterations: 2 },
    { label: '500K items', capacity: 500_000,  ttl: 50_000_000, iterations: 1 },
  ];

  const results = [];
  for (const c of configs) {
    const keySpace = c.capacity * 5;
    const ops = c.capacity * 10;
    console.log(`\n  ${c.label} | capacity=${c.capacity.toLocaleString()} | keySpace=${keySpace.toLocaleString()} | ops=${ops.toLocaleString()} | iter=${c.iterations}`);

    const rand = new SeededRandom(42);
    const workload = generateWorkload(rand, ops, keySpace, DEFAULT_PUT_RATIO, DEFAULT_ALPHA, 8);
    const getCount = workload.reduce((s, o) => s + (o.type === 'get' ? 1 : 0), 0);
    const putCount = ops - getCount;

    process.stdout.write(`    Running ... `);
    const t0 = process.hrtime.bigint();
    const r = await benchmark(
      () => { const clock = new VirtualClock(); return { cache: new PureRamCache(c.capacity, c.ttl, clock), clock }; },
      workload, c.iterations, getCount, putCount
    );
    const t1 = process.hrtime.bigint();
    console.log(`done (${(Number(t1 - t0) / 1e9).toFixed(2)}s)`);
    r.label = c.label;
    results.push(r);
  }

  console.log('\n  ' + pad('Size', 14) + padL('Time(ms)', 12) + padL('Get/s', 12) +
              padL('Heap(MB)', 12) + padL('RSS(MB)', 12) + padL('HitRate(%)', 12) +
              padL('Evictions', 12) + padL('Expired', 12));
  console.log('  ' + '-'.repeat(100));
  for (const r of results) {
    console.log('  ' + pad(r.label, 14) +
      padL(r.avgTimeMs.toFixed(0), 12) +
      padL(r.avgGetsPerSec.toFixed(0), 12) +
      padL(r.avgPeakHeapMB.toFixed(1), 12) +
      padL(r.avgPeakRssMB.toFixed(1), 12) +
      padL((r.avgHitRate * 100).toFixed(2), 12) +
      padL(r.avgEvictions.toFixed(0), 12) +
      padL(r.avgExpirations.toFixed(0), 12));
  }
  return results;
}

async function suiteB_TieredRatios() {
  console.log('\n' + '='.repeat(140));
  console.log('SUITE B: Tiered vs Pure RAM — capacity=200K | keySpace=1M | ops=2M | SSD=100µs');
  console.log('='.repeat(140));

  const CAPACITY = 200_000;
  const KEYSPACE = 1_000_000;
  const OPS = 2_000_000;
  const TTL = 20_000_000;
  const ITER = 1;

  const rand = new SeededRandom(42);
  const workload = generateWorkload(rand, OPS, KEYSPACE, DEFAULT_PUT_RATIO, DEFAULT_ALPHA, 8);
  const getCount = workload.reduce((s, o) => s + (o.type === 'get' ? 1 : 0), 0);
  const putCount = OPS - getCount;

  const configs = [
    { name: 'Pure RAM (100%)', factory: () => { const clock = new VirtualClock(); return { cache: new PureRamCache(CAPACITY, TTL, clock), clock }; } },
    { name: 'Tiered RAM 50%',  factory: () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.50, TTL, clock, { ssdDelayUs: 100 }), clock }; } },
    { name: 'Tiered RAM 25%',  factory: () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.25, TTL, clock, { ssdDelayUs: 100 }), clock }; } },
    { name: 'Tiered RAM 10%',  factory: () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.10, TTL, clock, { ssdDelayUs: 100 }), clock }; } },
    { name: 'Tiered RAM 5%',   factory: () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.05, TTL, clock, { ssdDelayUs: 100 }), clock }; } },
  ];

  const results = [];
  for (const c of configs) {
    process.stdout.write(`  ${pad(c.name, 18)} ... `);
    const t0 = process.hrtime.bigint();
    const r = await benchmark(c.factory, workload, ITER, getCount, putCount);
    const t1 = process.hrtime.bigint();
    r.name = c.name;
    results.push(r);
    console.log(`done (${(Number(t1 - t0) / 1e9).toFixed(2)}s)`);
  }

  console.log('\n  ' + pad('Configuration', 18) + padL('Time(ms)', 12) + padL('HitRate(%)', 12) +
              padL('RAM', 10) + padL('SSD', 10) + padL('Promo', 10) + padL('Demo', 10) +
              padL('WriteAmp', 12) + padL('PromoEff', 12) + padL('Churn', 10));
  console.log('  ' + '-'.repeat(126));
  for (const r of results) {
    console.log('  ' + pad(r.name, 18) +
      padL(r.avgTimeMs.toFixed(0), 12) +
      padL((r.avgHitRate * 100).toFixed(2), 12) +
      padL(r.avgRam.toFixed(0), 10) +
      padL(r.avgSsd.toFixed(0), 10) +
      padL(r.avgPromotions.toFixed(0), 10) +
      padL(r.avgDemotions.toFixed(0), 10) +
      padL(r.avgWriteAmp.toFixed(3), 12) +
      padL(r.avgPromoEff.toFixed(3), 12) +
      padL(r.avgChurn.toFixed(2), 10));
  }
  return results;
}

async function suiteC_SsdLatency() {
  console.log('\n' + '='.repeat(140));
  console.log('SUITE C: SSD latency sweep — RAM ratio=25%, capacity=100K, keySpace=500K, ops=1M');
  console.log('='.repeat(140));

  const CAPACITY = 100_000;
  const KEYSPACE = 500_000;
  const OPS = 1_000_000;
  const TTL = 10_000_000;
  const ITER = 1;

  const rand = new SeededRandom(42);
  const workload = generateWorkload(rand, OPS, KEYSPACE, DEFAULT_PUT_RATIO, DEFAULT_ALPHA, 8);
  const getCount = workload.reduce((s, o) => s + (o.type === 'get' ? 1 : 0), 0);
  const putCount = OPS - getCount;

  const configs = [
    { name: '0µs (in-mem)',      delay: 0 },
    { name: '10µs (fast NVMe)',  delay: 10 },
    { name: '50µs (NVMe)',       delay: 50 },
    { name: '100µs (typical)',   delay: 100 },
  ];

  const results = [];
  for (const c of configs) {
    process.stdout.write(`  ${pad(c.name, 20)} ... `);
    const t0 = process.hrtime.bigint();
    const r = await benchmark(
      () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.25, TTL, clock, { ssdDelayUs: c.delay }), clock }; },
      workload, ITER, getCount, putCount
    );
    const t1 = process.hrtime.bigint();
    r.name = c.name;
    results.push(r);
    console.log(`done (${(Number(t1 - t0) / 1e9).toFixed(2)}s)`);
  }

  const baseTime = results[0].avgTimeMs;
  console.log('\n  ' + pad('SSD Latency', 20) + padL('Time(ms)', 12) + padL('HitRate(%)', 12) +
              padL('Promo', 10) + padL('SSD R/W', 16) + padL('Overhead', 12));
  console.log('  ' + '-'.repeat(82));
  for (const r of results) {
    const overhead = ((r.avgTimeMs - baseTime) / baseTime * 100).toFixed(1) + '%';
    console.log('  ' + pad(r.name, 20) +
      padL(r.avgTimeMs.toFixed(0), 12) +
      padL((r.avgHitRate * 100).toFixed(2), 12) +
      padL(r.avgPromotions.toFixed(0), 10) +
      padL(`${r.avgSsdReads.toFixed(0)}/${r.avgSsdWrites.toFixed(0)}`, 16) +
      padL(overhead, 12));
  }
  return results;
}

async function suiteD_Skew() {
  console.log('\n' + '='.repeat(140));
  console.log('SUITE D: Zipf α sensitivity — Tiered RAM 25%, capacity=100K, keySpace=500K, SSD=100µs');
  console.log('='.repeat(140));

  const CAPACITY = 100_000;
  const KEYSPACE = 500_000;
  const OPS = 1_000_000;
  const TTL = 10_000_000;
  const ITER = 1;

  const alphas = [
    { name: 'α=0.5 (flat)',    alpha: 0.5 },
    { name: 'α=0.8',           alpha: 0.8 },
    { name: 'α=1.0 (classic)', alpha: 1.0 },
    { name: 'α=1.2',           alpha: 1.2 },
    { name: 'α=1.5 (extreme)', alpha: 1.5 },
  ];

  const results = [];
  for (const s of alphas) {
    const rand = new SeededRandom(42);
    const workload = generateWorkload(rand, OPS, KEYSPACE, DEFAULT_PUT_RATIO, s.alpha, 8);
    const getCount = workload.reduce((acc, o) => acc + (o.type === 'get' ? 1 : 0), 0);
    const putCount = OPS - getCount;

    process.stdout.write(`  ${pad(s.name, 20)} ... `);
    const t0 = process.hrtime.bigint();
    const r = await benchmark(
      () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.25, TTL, clock, { ssdDelayUs: 100 }), clock }; },
      workload, ITER, getCount, putCount
    );
    const t1 = process.hrtime.bigint();
    r.name = s.name;
    results.push(r);
    console.log(`done (${(Number(t1 - t0) / 1e9).toFixed(2)}s)`);
  }

  console.log('\n  ' + pad('Workload', 20) + padL('Time(ms)', 12) + padL('HitRate(%)', 12) +
              padL('Promo', 10) + padL('Demo', 10) + padL('RAM', 10) + padL('SSD', 10) +
              padL('WriteAmp', 12));
  console.log('  ' + '-'.repeat(110));
  for (const r of results) {
    console.log('  ' + pad(r.name, 20) +
      padL(r.avgTimeMs.toFixed(0), 12) +
      padL((r.avgHitRate * 100).toFixed(2), 12) +
      padL(r.avgPromotions.toFixed(0), 10) +
      padL(r.avgDemotions.toFixed(0), 10) +
      padL(r.avgRam.toFixed(0), 10) +
      padL(r.avgSsd.toFixed(0), 10) +
      padL(r.avgWriteAmp.toFixed(3), 12));
  }
  return results;
}

async function suiteE_ValueSize() {
  console.log('\n' + '='.repeat(140));
  console.log('SUITE E: Value size sensitivity — Pure RAM vs Tiered RAM 25% — capacity=50K, keySpace=250K, SSD=100µs');
  console.log('='.repeat(140));

  const CAPACITY = 50_000;
  const KEYSPACE = 250_000;
  const OPS = 500_000;
  const TTL = 5_000_000;
  const ITER = 1;

  const sizes = [
    { label: 'Small (8 B)',     valueSize: 8 },
    { label: 'Medium (256 B)',  valueSize: 256 },
    { label: 'Large (4 KB)',    valueSize: 4096 },
    { label: 'XLarge (64 KB)',  valueSize: 65536 },
  ];

  console.log('\n  ' + pad('ValueSize', 16) + pad('Algorithm', 16) + padL('Time(ms)', 12) +
              padL('Heap(MB)', 12) + padL('RSS(MB)', 12) + padL('HitRate(%)', 12));
  console.log('  ' + '-'.repeat(82));

  for (const s of sizes) {
    const rand = new SeededRandom(42);
    const workload = generateWorkload(rand, OPS, KEYSPACE, DEFAULT_PUT_RATIO, DEFAULT_ALPHA, s.valueSize);
    const getCount = workload.reduce((acc, o) => acc + (o.type === 'get' ? 1 : 0), 0);
    const putCount = OPS - getCount;

    for (const alg of ['Pure RAM', 'Tiered RAM 25%']) {
      const factory = alg === 'Pure RAM'
        ? () => { const clock = new VirtualClock(); return { cache: new PureRamCache(CAPACITY, TTL, clock), clock }; }
        : () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.25, TTL, clock, { ssdDelayUs: 100 }), clock }; };

      process.stdout.write(`  ${pad(s.label, 16)}${pad(alg, 16)} ... `);
      const t0 = process.hrtime.bigint();
      const r = await benchmark(factory, workload, ITER, getCount, putCount);
      const t1 = process.hrtime.bigint();
      console.log(`done (${(Number(t1 - t0) / 1e9).toFixed(2)}s)`);
      console.log('  ' + pad('', 16) + pad(alg, 16) +
        padL(r.avgTimeMs.toFixed(0), 12) +
        padL(r.avgPeakHeapMB.toFixed(1), 12) +
        padL(r.avgPeakRssMB.toFixed(1), 12) +
        padL((r.avgHitRate * 100).toFixed(2), 12));
    }
    console.log('');
  }
}

async function suiteF_Optimizations() {
  console.log('\n' + '='.repeat(140));
  console.log('SUITE F: Write-Back Buffer + Promotion Hysteresis — capacity=100K, keySpace=500K, ops=500K');
  console.log('='.repeat(140));

  const CAPACITY = 100_000;
  const KEYSPACE = 500_000;
  const OPS = 500_000;
  const TTL = 10_000_000;
  const ITER = 1;

  const rand = new SeededRandom(42);
  const workload = generateWorkload(rand, OPS, KEYSPACE, DEFAULT_PUT_RATIO, DEFAULT_ALPHA, 8);
  const getCount = workload.reduce((s, o) => s + (o.type === 'get' ? 1 : 0), 0);
  const putCount = OPS - getCount;

  const configs = [
    { name: 'Baseline (no WB, no hysteresis)', opts: { wbCapacity: 0, promotionThreshold: 1 } },
    { name: 'Hysteresis only (K=2)',           opts: { wbCapacity: 0, promotionThreshold: 2 } },
    { name: 'WB only (512)',                   opts: { wbCapacity: 512, promotionThreshold: 1 } },
    { name: 'WB + Hysteresis (K=2)',           opts: { wbCapacity: 512, promotionThreshold: 2 } },
    { name: 'WB + Hysteresis (K=3)',           opts: { wbCapacity: 512, promotionThreshold: 3 } },
  ];

  const results = [];
  for (const c of configs) {
    process.stdout.write(`  ${pad(c.name, 36)} ... `);
    const t0 = process.hrtime.bigint();
    const r = await benchmark(
      () => { const clock = new VirtualClock(); return { cache: new TieredCache(CAPACITY, 0.25, TTL, clock, { ssdDelayUs: 100, ...c.opts }), clock }; },
      workload, ITER, getCount, putCount
    );
    const t1 = process.hrtime.bigint();
    r.name = c.name;
    results.push(r);
    console.log(`done (${(Number(t1 - t0) / 1e9).toFixed(2)}s)`);
  }

  console.log('\n  ' + pad('Configuration', 36) + padL('Time(ms)', 12) + padL('HitRate(%)', 12) +
              padL('Promo', 10) + padL('Rejected', 10) + padL('WriteAmp', 12) +
              padL('SSD Reads', 12) + padL('SSD Writes', 12));
  console.log('  ' + '-'.repeat(120));
  for (const r of results) {
    console.log('  ' + pad(r.name, 36) +
      padL(r.avgTimeMs.toFixed(0), 12) +
      padL((r.avgHitRate * 100).toFixed(2), 12) +
      padL(r.avgPromotions.toFixed(0), 10) +
      padL(r.avgPromotionRejections.toFixed(0), 10) +
      padL(r.avgWriteAmp.toFixed(3), 12) +
      padL(r.avgSsdReads.toFixed(0), 12) +
      padL(r.avgSsdWrites.toFixed(0), 12));
  }
  return results;
}

function rankResults(results, weights) {
  const metrics = Object.keys(weights);
  const norm = {};
  for (const m of metrics) {
    const vals = results.map(r => r[m]);
    const min = Math.min(...vals), max = Math.max(...vals);
    norm[m] = {};
    for (const r of results) norm[m][r.name] = max === min ? 0 : (r[m] - min) / (max - min);
  }
  return results.map(r => {
    let s = 0;
    for (const [m, w] of Object.entries(weights)) s += w * norm[m][r.name];
    return { name: r.name, score: s };
  }).sort((a, b) => a.score - b.score);
}

function printRanking(title, results, weights) {
  console.log('\n' + '='.repeat(140));
  console.log(title);
  console.log('='.repeat(140));
  const ranked = rankResults(results, weights);
  console.log(pad('Rank', 8) + pad('Configuration', 40) + padL('Score', 12));
  console.log('-'.repeat(60));
  ranked.forEach((r, i) => {
    console.log(pad(`#${i + 1}`, 8) + pad(r.name, 40) + padL(r.score.toFixed(4), 12));
  });
  return ranked;
}

const TIERED_WEIGHTS = {
  avgTimeMs: 0.40,
  avgHitRate: 0.30,
  avgSsdWrites: 0.20,
  avgPeakRssMB: 0.10,
};

module.exports = {
  suiteA_PureRam,
  suiteB_TieredRatios,
  suiteC_SsdLatency,
  suiteD_Skew,
  suiteE_ValueSize,
  suiteF_Optimizations,
  TIERED_WEIGHTS,
  rankResults,
  printRanking
};

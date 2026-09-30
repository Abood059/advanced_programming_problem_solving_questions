const { SAMPLE_LIMIT } = require("./config");
const { hrns, toMs, toUs, mean, stddev, percentile, gc } = require("./utils");
function executeOnce(alg, scenario) {
  const limiter = alg.factory();
  const samples = [];
  let sampleCount = 0;
  let allowed = 0;
  let denied  = 0;

  const check = (userId, t) => {
    let r;
    if (sampleCount < SAMPLE_LIMIT) {
      const a = hrns();
      r = limiter.allow(userId, t);
      const b = hrns();
      samples.push(Number(b - a));
      sampleCount++;
    } else {
      r = limiter.allow(userId, t);
    }
    if (r.allowed) allowed++; else denied++;
  };

  const t0 = hrns();
  scenario.run(check);
  const t1 = hrns();

  const fp = limiter.footprint();

  // Reference the limiter to keep it alive past the memory measurement.
  if (limiter.footprint) limiter.footprint();

  return {
    limiter,
    allowed,
    denied,
    totalNs: Number(t1 - t0),
    samples,
    fp,
  };
}

function executeWithIterations(alg, scenario, iterations) {
  const runs = [];

  for (let it = 0; it < iterations; it++) {
    gc();
    const memBefore = process.memoryUsage();

    const r = executeOnce(alg, scenario);

    gc();
    const memAfter = process.memoryUsage();

    runs.push({
      allowed   : r.allowed,
      denied    : r.denied,
      totalNs   : r.totalNs,
      samples   : r.samples,
      fp        : r.fp,
      heapDelta : memAfter.heapUsed - memBefore.heapUsed,
      rssDelta  : memAfter.rss     - memBefore.rss,
    });

    // `r` (and its limiter) is now eligible for collection on next iteration.
  }

  return runs;
}

function aggregate(runs, scenario) {
  const timesMs = runs.map(r => toMs(r.totalNs));

  // Correctness — verify all iterations agree.
  const allowedSet = new Set(runs.map(r => r.allowed));
  const deniedSet  = new Set(runs.map(r => r.denied));

  const allowed = runs[0].allowed;
  const denied  = runs[0].denied;

  // Latency percentiles across the pooled samples.
  const pooled = [];
  for (const r of runs) for (const s of r.samples) pooled.push(s);
  pooled.sort((a, b) => a - b);
  const p50 = toUs(percentile(pooled, 0.50));
  const p99 = toUs(percentile(pooled, 0.99));
  const latMean = toUs(mean(pooled));

  const heapDeltas = runs.map(r => r.heapDelta);
  const rssDeltas  = runs.map(r => r.rssDelta);

  const totalReqs = allowed + denied;
  const meanMs    = mean(timesMs);
  const throughput = meanMs > 0 ? totalReqs / (meanMs / 1000) : 0;

  return {
    allowed, denied, totalReqs,
    timeMeanMs : meanMs,
    timeStdMs  : stddev(timesMs),
    throughput,
    latMean, p50, p99,
    heapDelta  : Math.max(...heapDeltas),   // best signal vs GC noise
    rssDelta   : Math.max(...rssDeltas),
    entries    : runs[0].fp.entries,
    users      : runs[0].fp.users,
    consistent : (allowedSet.size === 1) && (deniedSet.size === 1),
  };
}


module.exports = { executeOnce, executeWithIterations, aggregate };

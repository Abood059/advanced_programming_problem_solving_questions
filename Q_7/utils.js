const SLEEP_BUFFER = new Int32Array(new SharedArrayBuffer(4));

function hybridDelay(latencyNs) {
  if (latencyNs <= 0n) return;
  const ms = Number(latencyNs) / 1e6;
  if (ms < 0.5) {
    // Busy-wait for sub-millisecond precision
    const end = process.hrtime.bigint() + latencyNs;
    while (process.hrtime.bigint() < end) { /* spin */ }
  } else {
    // Sleep without burning CPU for larger delays
    Atomics.wait(SLEEP_BUFFER, 0, 0, ms);
  }
}

class SeededRandom {
  constructor(seed) { this.state = seed >>> 0; }
  next() {
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n) { return Math.floor(this.next() * n); }
}

class VirtualClock {
  constructor(tickPerOp = 1) { this.now = 0; this.tickPerOp = tickPerOp; }
  advance() { this.now += this.tickPerOp; }
  current() { return this.now; }
}

function buildZipfCDF(n, alpha) {
  const weights = new Float64Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const w = 1 / Math.pow(i + 1, alpha);
    weights[i] = w; total += w;
  }
  const cdf = new Float64Array(n);
  let cum = 0;
  for (let i = 0; i < n; i++) {
    cum += weights[i] / total;
    cdf[i] = cum;
  }
  return cdf;
}

function zipfSample(cdf, rand) {
  const u = rand.next();
  let lo = 0, hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cdf[mid] < u) lo = mid + 1; else hi = mid;
  }
  return lo;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad  = (s, n) => { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); };
const padL = (s, n) => { s = String(s); return s.length >= n ? s : ' '.repeat(n - s.length) + s; };

module.exports = {
  SeededRandom,
  VirtualClock,
  buildZipfCDF,
  zipfSample,
  hybridDelay,
  sleep,
  pad,
  padL
};

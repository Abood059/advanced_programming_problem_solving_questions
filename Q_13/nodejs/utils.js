const { LIMIT, WINDOW_MS, T, TAU, SAMPLE_LIMIT, LIGHT_ITERS, HEAVY_ITERS } = require("./config");

const hrns  = () => process.hrtime.bigint();
const toMs  = (ns) => Number(ns) / 1e6;
const toUs  = (ns) => Number(ns) / 1e3;
const gc    = () => { if (typeof global.gc === 'function') global.gc(); };
const fmt   = (n, d = 2) => Number(n).toFixed(d);
const padL  = (s, n) => { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); };
const padR  = (s, n) => { s = String(s); return s.length >= n ? s : ' '.repeat(n - s.length) + s; };
const comma = (n) => Math.round(Number(n)).toLocaleString('en-US');

function mean(arr) {
  if (arr.length === 0) return 0;
  let s = 0;
  for (const x of arr) s += x;
  return s / arr.length;
}
function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  let s = 0;
  for (const x of arr) s += (x - m) * (x - m);
  return Math.sqrt(s / (arr.length - 1));
}
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

module.exports = { hrns, toMs, toUs, gc, fmt, padL, padR, comma, mean, stddev, percentile };

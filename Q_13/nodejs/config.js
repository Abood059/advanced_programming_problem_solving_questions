const LIMIT     = 100;
const WINDOW_MS = 60_000;
const T         = WINDOW_MS / LIMIT;   // GCRA emission interval (600 ms)
const TAU       = WINDOW_MS - T;       // GCRA burst tolerance (59,400 ms)

const SAMPLE_LIMIT = 10_000;           // max latency samples per run
const LIGHT_ITERS  = 5;                // iterations for fast scenarios
const HEAVY_ITERS  = 3;                // iterations for heavy scenarios


module.exports = { LIMIT, WINDOW_MS, T, TAU, SAMPLE_LIMIT, LIGHT_ITERS, HEAVY_ITERS };

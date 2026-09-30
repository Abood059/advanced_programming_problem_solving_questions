const algs = require("./algorithms");
const ALGORITHMS = [
  { key: 'Fixed',   name: 'Fixed Window Counter',   factory: () => new algs.FixedWindowCounter() },
  { key: 'SLog',    name: 'Sliding Window Log',     factory: () => new algs.SlidingWindowLog() },
  { key: 'SCount',  name: 'Sliding Window Counter', factory: () => new algs.SlidingWindowCounter() },
  { key: 'Token',   name: 'Token Bucket',           factory: () => new algs.TokenBucket() },
  { key: 'Leaky',   name: 'Leaky Bucket',           factory: () => new algs.LeakyBucket() },
  { key: 'GCRA',    name: 'GCRA',                   factory: () => new algs.GCRA() },
];


module.exports = ALGORITHMS;

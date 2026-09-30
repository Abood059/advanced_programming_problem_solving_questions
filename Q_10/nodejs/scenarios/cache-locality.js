const { N_WIDE: N, WARMUP_CACHE: WARMUP, RUNS_CACHE: RUNS } = require('../config');
const { buildPreorderChildren } = require('../layouts');
const { measureTime } = require('../utils');
const { dfsHeap, dfsPreorder } = require('../dfs');
const { bfsHeap, bfsPreorder } = require('../bfs');

function run() {
  console.log(`=== Cache Locality Scenario ===`);
  console.log(`Nodes: ${N.toLocaleString()}`);
  console.log(`Tree type: complete binary tree`);
  console.log(`Approx size of one Int32Array: ${(N * 4 / 1024 / 1024).toFixed(1)} MB\n`);

  const stackBuf = new Int32Array(N);
  const queueBuf = new Int32Array(N);

  console.log('--- Layout 1: BFS-order storage (Heap Layout) ---');
  console.log('BFS reads memory sequentially; DFS jumps.\n');

  const runDfsHeap = () => dfsHeap(stackBuf, N, 0);
  const runBfsHeap = () => bfsHeap(queueBuf, N, 0);

  for (let i = 0; i < WARMUP; i++) { runDfsHeap(); runBfsHeap(); }

  const d1Time = measureTime(runDfsHeap, RUNS);
  const b1Time = measureTime(runBfsHeap, RUNS);

  console.log(`DFS: ${(d1Time / RUNS).toFixed(3)} ms`);
  console.log(`BFS: ${(b1Time / RUNS).toFixed(3)} ms`);
  console.log(`DFS/BFS ratio: ${(d1Time / b1Time).toFixed(3)}`);
  const winner1 = d1Time < b1Time ? 'DFS' : 'BFS';
  const diff1 = Math.abs(d1Time - b1Time) / Math.max(d1Time, b1Time) * 100;
  console.log(`-> ${winner1} is faster by ${diff1.toFixed(1)}%\n`);

  console.log('--- Layout 2: DFS Preorder storage ---');
  console.log('DFS reads memory sequentially; BFS jumps.\n');
  const dfsChildren = buildPreorderChildren(N);

  const runDfsPreorder = () => dfsPreorder(stackBuf, dfsChildren, 0);
  const runBfsPreorder = () => bfsPreorder(queueBuf, dfsChildren, 0);

  for (let i = 0; i < WARMUP; i++) { runDfsPreorder(); runBfsPreorder(); }

  const d2Time = measureTime(runDfsPreorder, RUNS);
  const b2Time = measureTime(runBfsPreorder, RUNS);

  console.log(`DFS: ${(d2Time / RUNS).toFixed(3)} ms`);
  console.log(`BFS: ${(b2Time / RUNS).toFixed(3)} ms`);
  console.log(`DFS/BFS ratio: ${(d2Time / b2Time).toFixed(3)}`);
  const winner2 = d2Time < b2Time ? 'DFS' : 'BFS';
  const diff2 = Math.abs(d2Time - b2Time) / Math.max(d2Time, b2Time) * 100;
  console.log(`-> ${winner2} is faster by ${diff2.toFixed(1)}%\n`);

  console.log('=== Summary ===');
  console.log(`Layout 1 (BFS order): DFS/BFS = ${(d1Time / b1Time).toFixed(3)}`);
  console.log(`Layout 2 (DFS order): DFS/BFS = ${(d2Time / b2Time).toFixed(3)}`);
  console.log('\nInterpretation:');
  console.log('- If the winner flips between layouts, cache locality dominates.');
  console.log('- If the same algorithm wins in both layouts, another factor dominates');
  console.log('  (e.g. working set size of the Stack vs Queue).');
  console.log('- With a complete binary tree, DFS Stack stays tiny (~log2(N) entries),');
  console.log('  while BFS Queue can grow to ~N/2 entries at the last level.');
  console.log('- This often makes DFS faster regardless of storage order.');
  console.log('--------------------------------------------------\n');
}

module.exports = run;

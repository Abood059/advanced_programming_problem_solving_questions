const { N_WIDE: N, WARMUP_CACHE: WARMUP, RUNS_CACHE: RUNS } = require('../config');
const { buildPreorderChildren } = require('../layouts');
const { reportMemory, measureTime } = require('../utils');
const { dfsHeap, dfsPreorder } = require('../dfs');
const { bfsHeap, bfsPreorder } = require('../bfs');

function run() {
  console.log(`=== Wide Tree (Complete Binary Tree) Scenario ===`);
  console.log(`Nodes: ${N.toLocaleString()}`);
  console.log(`Tree type: complete binary tree (WIDE)`);
  console.log(`Node size: 4 bytes (Int32)\n`);

  const stackBuf = new Int32Array(N);
  const queueBuf = new Int32Array(N);

  console.log('--- Layout 1: BFS-order storage (Heap Layout) ---\n');

  const runDfsHeap = () => dfsHeap(stackBuf, N, 0);
  const runBfsHeap = () => bfsHeap(queueBuf, N, 0);

  for (let i = 0; i < WARMUP; i++) { runDfsHeap(); runBfsHeap(); }

  const d1Result = runDfsHeap();
  const b1Result = runBfsHeap();

  const d1Time = measureTime(runDfsHeap, RUNS);
  const b1Time = measureTime(runBfsHeap, RUNS);

  console.log(`DFS: ${(d1Time / RUNS).toFixed(3)} ms`);
  console.log(`BFS: ${(b1Time / RUNS).toFixed(3)} ms`);
  console.log(`DFS/BFS ratio: ${(d1Time / b1Time).toFixed(3)}`);
  const winner1 = d1Time < b1Time ? 'DFS' : 'BFS';
  const diff1 = Math.abs(d1Time - b1Time) / Math.max(d1Time, b1Time) * 100;
  console.log(`-> ${winner1} is faster by ${diff1.toFixed(1)}%\n`);

  console.log('Memory usage (Layout 1):');
  reportMemory('DFS stack', N, d1Result.peakStack);
  reportMemory('BFS queue', N, b1Result.peakQueue);
  console.log('');

  console.log('--- Layout 2: DFS Preorder storage ---\n');
  const dfsChildren = buildPreorderChildren(N);

  const runDfsPreorder = () => dfsPreorder(stackBuf, dfsChildren, 0);
  const runBfsPreorder = () => bfsPreorder(queueBuf, dfsChildren, 0);

  for (let i = 0; i < WARMUP; i++) { runDfsPreorder(); runBfsPreorder(); }

  const d2Result = runDfsPreorder();
  const b2Result = runBfsPreorder();

  const d2Time = measureTime(runDfsPreorder, RUNS);
  const b2Time = measureTime(runBfsPreorder, RUNS);

  console.log(`DFS: ${(d2Time / RUNS).toFixed(3)} ms`);
  console.log(`BFS: ${(b2Time / RUNS).toFixed(3)} ms`);
  console.log(`DFS/BFS ratio: ${(d2Time / b2Time).toFixed(3)}`);
  const winner2 = d2Time < b2Time ? 'DFS' : 'BFS';
  const diff2 = Math.abs(d2Time - b2Time) / Math.max(d2Time, b2Time) * 100;
  console.log(`-> ${winner2} is faster by ${diff2.toFixed(1)}%\n`);

  console.log('Memory usage (Layout 2):');
  reportMemory('DFS stack', N, d2Result.peakStack);
  reportMemory('BFS queue', N, b2Result.peakQueue);
  console.log('');

  console.log('=== Summary ===');
  console.log(`Layout 1 (BFS order): DFS/BFS = ${(d1Time / b1Time).toFixed(3)}`);
  console.log(`Layout 2 (DFS order): DFS/BFS = ${(d2Time / b2Time).toFixed(3)}`);
  console.log('\nKey insight:');
  console.log('- DFS logical stack stays small (~log2 N) in a wide tree.');
  console.log('- BFS logical queue grows to ~N/2 at the widest level.');
  console.log('- This difference explains why DFS wins on wide trees,');
  console.log('  regardless of storage order.');
  console.log('--------------------------------------------------\n');
}

module.exports = run;

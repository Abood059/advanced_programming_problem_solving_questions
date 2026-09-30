const { N_DEEP: N, WARMUP_DEFAULT: WARMUP, RUNS_DEFAULT: RUNS } = require('../config');
const { getCaterpillarAccessors } = require('../layouts');
const { reportMemory, measureTime } = require('../utils');
const { dfsGeneric } = require('../dfs');
const { bfsGeneric } = require('../bfs');

function run() {
  const L = N >> 1;
  console.log(`=== Deep Narrow Tree (Caterpillar) Scenario ===`);
  console.log(`Total nodes: ${N.toLocaleString()}`);
  console.log(`Chain length: ${L.toLocaleString()}`);
  console.log(`Tree type: caterpillar (DEEP and NARROW)`);
  console.log(`Node size: 4 bytes (Int32)\n`);

  const stackBuf = new Int32Array(L + 1);
  const queueBuf = new Int32Array(N);

  const { getLeft, getRight } = getCaterpillarAccessors(L);

  const runDfs = () => dfsGeneric(stackBuf, getLeft, getRight, 0);
  const runBfs = () => bfsGeneric(queueBuf, getLeft, getRight, 0);

  for (let i = 0; i < WARMUP; i++) { runDfs(); runBfs(); }

  const dfsResult = runDfs();
  const bfsResult = runBfs();
  
  console.log(`DFS visited: ${dfsResult.count.toLocaleString()}`);
  console.log(`BFS visited: ${bfsResult.count.toLocaleString()}`);
  console.log(`Expected   : ${N.toLocaleString()}`);
  if (dfsResult.count !== N || bfsResult.count !== N) {
    console.log('WARNING: traversal did not visit all nodes!');
  }
  console.log('');

  const dt = measureTime(runDfs, RUNS);
  const bt = measureTime(runBfs, RUNS);

  const dfsAvg = dt / RUNS;
  const bfsAvg = bt / RUNS;

  console.log(`DFS: ${dfsAvg.toFixed(3)} ms`);
  console.log(`BFS: ${bfsAvg.toFixed(3)} ms`);
  console.log(`DFS/BFS ratio: ${(dfsAvg / bfsAvg).toFixed(3)}`);

  const winner = dfsAvg < bfsAvg ? 'DFS' : 'BFS';
  const diff = Math.abs(dfsAvg - bfsAvg) / Math.max(dfsAvg, bfsAvg) * 100;
  console.log(`-> ${winner} is faster by ${diff.toFixed(1)}%\n`);

  console.log('Memory usage:');
  reportMemory('DFS stack', L + 1, dfsResult.peakStack);
  reportMemory('BFS queue', N, bfsResult.peakQueue);
  console.log('');

  console.log('=== Summary ===');
  console.log('On a deep narrow tree:');
  console.log('- DFS logical stack grows to O(L) = ~N/2 entries.');
  console.log('- BFS logical queue stays tiny (~3 entries).');
  console.log('- BFS wins because its working set fits in cache,');
  console.log('  while DFS thrashes memory with a huge stack.');
  console.log('--------------------------------------------------\n');
}

module.exports = run;

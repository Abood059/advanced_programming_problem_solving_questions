const { N_DEEP: N, WARMUP_DEFAULT: WARMUP, RUNS_DEFAULT: RUNS } = require('../config');
const { getCaterpillarAccessors } = require('../layouts');
const { reportMemory, measureTime } = require('../utils');
const { dfsGeneric } = require('../dfs');
const { bfsCircular } = require('../bfs');

function run() {
  const L = N >> 1;
  const QUEUE_CAP = 16;
  
  console.log(`=== Circular Queue Scenario ===`);
  console.log(`Total nodes: ${N.toLocaleString()}`);
  console.log(`Chain length: ${L.toLocaleString()}`);
  console.log(`Tree type: caterpillar (DEEP and NARROW)`);
  console.log(`BFS queue capacity: ${QUEUE_CAP} entries (circular)`);
  console.log(`Node size: 4 bytes (Int32)\n`);

  const stackBuf = new Int32Array(L + 1);
  const queueBuf = new Int32Array(QUEUE_CAP);

  const { getLeft, getRight } = getCaterpillarAccessors(L);

  const runDfs = () => dfsGeneric(stackBuf, getLeft, getRight, 0);
  const runBfsCirc = () => bfsCircular(queueBuf, QUEUE_CAP, getLeft, getRight, 0);

  for (let i = 0; i < WARMUP; i++) { runDfs(); runBfsCirc(); }

  const dfsResult = runDfs();
  const bfsResult = runBfsCirc();

  console.log(`DFS visited: ${dfsResult.count.toLocaleString()}`);
  console.log(`BFS visited: ${bfsResult.count.toLocaleString()}`);
  console.log(`Expected   : ${N.toLocaleString()}`);
  if (dfsResult.count !== N || bfsResult.count !== N) {
    console.log('WARNING: traversal did not visit all nodes!');
    console.log('Hint: if BFS count is wrong, increase QUEUE_CAP.');
  }
  console.log('');

  const dt = measureTime(runDfs, RUNS);
  const bt = measureTime(runBfsCirc, RUNS);

  const dfsAvg = dt / RUNS;
  const bfsAvg = bt / RUNS;

  console.log(`DFS: ${dfsAvg.toFixed(3)} ms`);
  console.log(`BFS (circular): ${bfsAvg.toFixed(3)} ms`);
  console.log(`DFS/BFS ratio: ${(dfsAvg / bfsAvg).toFixed(3)}`);

  const winner = dfsAvg < bfsAvg ? 'DFS' : 'BFS';
  const diff = Math.abs(dfsAvg - bfsAvg) / Math.max(dfsAvg, bfsAvg) * 100;
  console.log(`-> ${winner} is faster by ${diff.toFixed(1)}%\n`);

  console.log('Memory usage:');
  reportMemory('DFS stack', L + 1, dfsResult.peakStack);
  reportMemory('BFS circular queue', QUEUE_CAP, bfsResult.peakQueue);
  console.log('');

  console.log('=== Summary ===');
  console.log('Same tree, same algorithm count, different buffer strategy:');
  console.log('- DFS uses a flat stack of size L+1 (~64 MB),');
  console.log('  and touches essentially the whole buffer.');
  console.log('- BFS uses a tiny circular queue of size 16 (~64 B),');
  console.log('  and touches ONLY that tiny region of memory.');
  console.log('');
  console.log('If BFS wins big here, it proves that:');
  console.log('- The dominant cost is the RANGE of memory touched by pointers,');
  console.log('- NOT the logical working-set size,');
  console.log('- NOT the traversal order (DFS vs BFS) alone.');
  console.log('--------------------------------------------------\n');
}

module.exports = run;

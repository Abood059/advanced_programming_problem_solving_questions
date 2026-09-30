const runDeepNarrow = require('./scenarios/deep-narrow');
const runWideTree = require('./scenarios/wide-tree');
const runCacheLocality = require('./scenarios/cache-locality');
const runCircularQueue = require('./scenarios/circular-queue');

function main() {
  console.log('Starting Unified Benchmark...\n');
  
  // Note: the original scripts were typically run individually, and some allocate huge arrays.
  // Running them all sequentially in one process may require garbage collection between them.
  // We'll run them sequentially.
  
  runDeepNarrow();
  runWideTree();
  runCacheLocality();
  runCircularQueue();
  
  console.log('All benchmarks complete.');
}

main();

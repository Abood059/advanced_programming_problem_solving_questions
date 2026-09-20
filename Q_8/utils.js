function line(char = "-", len = 70) {
  return char.repeat(len);
}

function formatMs(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(3)} s`;
}

function summarize(result, label) {
  console.log(`\n${line("=")}`);
  console.log(`📌 ${label}`);
  console.log(line("="));
  console.log(`  Total tasks        : ${result.totalTasks.toLocaleString()}`);
  console.log(`  Total dependencies : ${result.totalDependencies.toLocaleString()}`);
  console.log(`  Valid order?       : ${result.valid ? "✅ YES" : "❌ NO (cycle detected)"}`);
  console.log(`  Batches (parallel) : ${result.batchCount.toLocaleString()}`);
  if (!result.valid) {
    console.log(`  Cyclic tasks count : ${result.cyclicTasks.length.toLocaleString()}`);
    console.log(`  Sample cyclic      : ${result.cyclicTasks.slice(0, 5).join(", ")}...`);
  }
  console.log(`  ⏱  Elapsed time     : ${formatMs(result.elapsedMs)}`);
}

module.exports = {
  line,
  formatMs,
  summarize
};

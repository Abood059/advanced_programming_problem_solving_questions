const { performance } = require('perf_hooks');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function reportMemory(label, physicalEntries, logicalEntries) {
  const physBytes = physicalEntries * 4;
  const logBytes = logicalEntries * 4;
  console.log(`  ${label}:`);
  console.log(`    Physical buffer : ${formatBytes(physBytes)} (${physicalEntries.toLocaleString()} entries)`);
  console.log(`    Logical peak    : ${formatBytes(logBytes)} (${logicalEntries.toLocaleString()} entries)`);
}

function measureTime(fn, runs) {
  let totalTime = 0;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    totalTime += performance.now() - start;
  }
  return totalTime;
}

module.exports = { formatBytes, reportMemory, measureTime };

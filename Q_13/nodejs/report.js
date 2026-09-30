const { padL, padR, comma, fmt } = require("./utils");
const ALGORITHMS = require("./registry");
const { HEAVY_ITERS, LIGHT_ITERS, SAMPLE_LIMIT } = require("./config");
function hr(char = '─', w = 148) { return char.repeat(w); }

function printMainHeader() {
  const node     = process.version;
  const platform = process.platform + ' ' + process.arch;
  const heapMb   = (require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024).toFixed(0);
  const gcState  = (typeof global.gc === 'function') ? 'YES' : 'NO (memory numbers unreliable)';

  console.log('\n' + hr('═'));
  console.log('  Rate Limiter Benchmark — Heavy Load Edition');
  console.log(hr('═'));
  console.log(`  Node: ${node}   |   Platform: ${platform}   |   Heap limit: ${heapMb} MB`);
  console.log(`  Iterations per scenario:  light=${LIGHT_ITERS}   heavy=${HEAVY_ITERS}   |   Latency samples/run: ${SAMPLE_LIMIT}`);
  console.log(`  GC exposed: ${gcState}`);
  console.log(hr('═'));
}

function printScenarioHeader(idx, total, scenario, iterations) {
  console.log('\n' + hr('─'));
  console.log(
    `  [${padL(idx, 2)}/${total}]  ${padL(scenario.name, 20)}` +
    `  ${padL(comma(scenario.total), 10)} requests` +
    `  |  ${iterations} iterations`
  );
  console.log(hr('─'));
}

function printAlgoTable(rows) {
  const headers = [
    'Algorithm', 'Allowed', 'Denied',
    'Total ms', '±std', 'Req/s',
    'Mean µs', 'P50 µs', 'P99 µs',
    'Heap KB', 'RSS KB', 'Entries'
  ];
  const widths = [26, 10, 10, 11, 8, 14, 10, 9, 9, 11, 11, 10];

  const line = headers.map((h, i) => padR(h, widths[i])).join(' | ');
  console.log(line);
  console.log(hr('─', line.length));

  for (const r of rows) {
    const cells = [
      padL(r.name, widths[0]),
      padR(comma(r.allowed), widths[1]),
      padR(comma(r.denied),  widths[2]),
      padR(fmt(r.timeMeanMs, 3), widths[3]),
      padR(fmt(r.timeStdMs, 3),  widths[4]),
      padR(comma(r.throughput),  widths[5]),
      padR(fmt(r.latMean, 3),    widths[6]),
      padR(fmt(r.p50, 3),        widths[7]),
      padR(fmt(r.p99, 3),        widths[8]),
      padR(fmt(r.heapDelta / 1024, 1), widths[9]),
      padR(fmt(r.rssDelta  / 1024, 1), widths[10]),
      padR(comma(r.entries),     widths[11]),
    ];
    console.log(cells.join(' | '));
  }
}

function printSummary(scenarioRows) {
  console.log('\n' + hr('═'));
  console.log('  SUMMARY — allowed / total per algorithm per scenario');
  console.log(hr('═'));

  const wAlg = 13;
  const wScn = 18;

  const header = padL('Scenario', wScn) + ' | ' +
    ALGORITHMS.map(a => padR(a.key, wAlg)).join(' | ');
  console.log(header);
  console.log(hr('─', header.length));

  for (const { scenario, rows } of scenarioRows) {
    const cells = rows.map(r => {
      const total = r.allowed + r.denied;
      const mark  = r.consistent ? '' : '(!)';
      return padR(`${comma(r.allowed)}/${comma(total)}${mark}`, wAlg);
    });
    console.log(padL(scenario.name, wScn) + ' | ' + cells.join(' | '));
  }

  // Correctness column — a compact view of "who allowed more than 100/200".
  console.log('\n' + hr('─'));
  console.log('  Notes:');
  console.log('    - "(!!)" marks a scenario where iterations disagreed on allowed count.');
  console.log('    - Boundary scenario: Fixed Window allows 200/200 (known window-edge bug).');
  console.log('    - Sustained-style scenarios: Token/Leaky/GCRA allow ~199/200 due to burst allowance.');
  console.log(hr('─'));
}


module.exports = { printMainHeader, printScenarioHeader, printAlgoTable, printSummary };

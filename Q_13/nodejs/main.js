const { printMainHeader, printScenarioHeader, printAlgoTable, printSummary } = require("./report");
const SCENARIOS = require("./scenarios");
const ALGORITHMS = require("./registry");
const { HEAVY_ITERS, LIGHT_ITERS } = require("./config");
const { executeWithIterations, aggregate } = require("./runner");
function main() {
  printMainHeader();

  const summary = [];

  SCENARIOS.forEach((scenario, idx) => {
    const iterations = scenario.heavy ? HEAVY_ITERS : LIGHT_ITERS;
    printScenarioHeader(idx + 1, SCENARIOS.length, scenario, iterations);

    const rows = [];
    for (const alg of ALGORITHMS) {
      const runs = executeWithIterations(alg, scenario, iterations);
      const agg  = aggregate(runs, scenario);
      rows.push({ name: alg.name, ...agg });
    }
    printAlgoTable(rows);
    summary.push({ scenario, rows });
  });

  printSummary(summary);

  console.log('\nDone.\n');
}

main();

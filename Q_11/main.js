const buildTestCases = require("./test-cases");
const flattenRecursive = require("./recursive");
const flattenStack = require("./stack");
const flattenSegments = require("./segments");
const flattenMemo = require("./memo");
const utils = require("./utils");
const { normalizeResult, resultsEqual } = utils;


function run() {
  const cases = buildTestCases();
  const algorithms = [
    { name: "Recursive", fn: flattenRecursive },
    { name: "Stack",     fn: flattenStack },
    { name: "Segments",  fn: flattenSegments },
    { name: "Memo",      fn: flattenMemo },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of cases) {
    console.log(`\n========== Test: ${tc.name} ==========`);

    const outputs = algorithms.map((alg) => {
      try {
        const map = alg.fn(tc.input);
        return { name: alg.name, out: normalizeResult(map), error: null };
      } catch (e) {
        return { name: alg.name, out: null, error: e };
      }
    });

    // Print the result of the first algorithm that succeeded (usually Recursive).
    const sample = outputs.find((o) => !o.error);
    if (sample) {
      const MAX = 12;
      for (let i = 0; i < Math.min(sample.out.length, MAX); i++) {
        const [k, v] = sample.out[i];
        console.log(`  ${k} = ${v}`);
      }
      if (sample.out.length > MAX) {
        console.log(`  ... and ${sample.out.length - MAX} more entries`);
      }
      if (sample.out.length === 0) {
        console.log(`  (empty result)`);
      }
    } else {
      console.log(`  (all algorithms failed)`);
    }

    // Report per-algorithm status without timing.
    for (const o of outputs) {
      if (o.error) {
        console.log(`  [${o.name}] ERROR: ${o.error.message}`);
      } else {
        console.log(`  [${o.name}] ${o.out.length} entries`);
      }
    }

    // Compare successful outputs against the first successful one.
    let allMatch = true;
    const reference = outputs.find((o) => !o.error);
    if (reference) {
      for (const o of outputs) {
        if (o === reference) continue;

        if (o.error) {
          allMatch = false;
          console.log(`  MISMATCH ${reference.name} vs ${o.name}: error vs success`);
          continue;
        }

        if (!resultsEqual(reference.out, o.out)) {
          allMatch = false;
          console.log(`  MISMATCH ${reference.name} vs ${o.name}`);
          const mapA = new Map(reference.out);
          const mapB = new Map(o.out);
          const keys = new Set([...mapA.keys(), ...mapB.keys()]);
          let shown = 0;
          for (const k of keys) {
            const va = mapA.has(k) ? mapA.get(k) : "<missing>";
            const vb = mapB.has(k) ? mapB.get(k) : "<missing>";
            if (va !== vb) {
              console.log(`     ${k}: A=${va} | B=${vb}`);
              if (++shown >= 5) {
                console.log(`     ... more differences suppressed`);
                break;
              }
            }
          }
        }
      }
    } else {
      allMatch = false;
    }

    const allSucceeded = outputs.every((o) => !o.error);
    if (allSucceeded && allMatch) {
      console.log(`  PASS: all 4 algorithms agree.`);
      passed++;
    } else if (allSucceeded && !allMatch) {
      failed++;
    } else {
      console.log(`  NOTE: not all algorithms completed (likely deep recursion).`);
      failed++;
    }
  }

  console.log(`\n========== Summary ==========`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
}

run();

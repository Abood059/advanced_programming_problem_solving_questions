const { generateData } = require("./data");
const { recursiveNaive, recursiveMemo, bottomUpDP, spaceOptimizedDP } = require("./algorithms");
const { measure, printResult } = require("./utils");

function runTests() {
    console.log("=".repeat(70));
    console.log("  Testing algorithms with constraint: gap less than k is forbidden");
    console.log("  Formula: F(i) = max(F(i-1), A[i] + F(i-k))");
    console.log("=".repeat(70));

    // ---------------------------
    // Test 1: small data (n = 30) — all algorithms
    // ---------------------------
    const nSmall = 30;
    const kSmall = 2; // base case: no adjacent elements
    const small = generateData(nSmall);

    console.log(`\n[Test 1] Small data: n = ${nSmall}, k = ${kSmall}`);
    console.log("-".repeat(70));

    printResult(measure("Recursive Naive",        () => recursiveNaive(small, nSmall, kSmall)));
    printResult(measure("Recursive + Memo",       () => recursiveMemo(small, nSmall, kSmall)));
    printResult(measure("Bottom-Up DP",           () => bottomUpDP(small, nSmall, kSmall)));
    printResult(measure("Space Optimized DP",     () => spaceOptimizedDP(small, nSmall, kSmall)));

    // ---------------------------
    // Test 2: n = 35 with k = 5
    // ---------------------------
    const nMed = 35;
    const kMed = 5;
    const med = generateData(nMed);

    console.log(`\n[Test 2] Medium data: n = ${nMed}, k = ${kMed}`);
    console.log("-".repeat(70));

    printResult(measure("Recursive Naive",        () => recursiveNaive(med, nMed, kMed)));
    printResult(measure("Recursive + Memo",       () => recursiveMemo(med, nMed, kMed)));
    printResult(measure("Bottom-Up DP",           () => bottomUpDP(med, nMed, kMed)));
    printResult(measure("Space Optimized DP",     () => spaceOptimizedDP(med, nMed, kMed)));

    // ---------------------------
    // Test 3: large data (n = 10000) — only optimized algorithms
    // ---------------------------
    const nLarge = 10000;
    const kLarge = 5;
    const large = generateData(nLarge);

    console.log(`\n[Test 3] Large data: n = ${nLarge}, k = ${kLarge}`);
    console.log("-".repeat(70));

    printResult(measure("Recursive + Memo",       () => recursiveMemo(large, nLarge, kLarge)));
    printResult(measure("Bottom-Up DP",           () => bottomUpDP(large, nLarge, kLarge)));
    printResult(measure("Space Optimized DP",     () => spaceOptimizedDP(large, nLarge, kLarge)));

    // ---------------------------
    // Test 4: huge data (n = 100000)
    // ---------------------------
    const nHuge = 100000;
    const kHuge = 5;
    const huge = generateData(nHuge);

    console.log(`\n[Test 4] Huge data: n = ${nHuge}, k = ${kHuge}`);
    console.log("-".repeat(70));

    printResult(measure("Recursive + Memo",       () => recursiveMemo(huge, nHuge, kHuge)));
    printResult(measure("Bottom-Up DP",           () => bottomUpDP(huge, nHuge, kHuge)));
    printResult(measure("Space Optimized DP",     () => spaceOptimizedDP(huge, nHuge, kHuge)));

    console.log("\n" + "=".repeat(70));
    console.log("  Notes:");
    console.log("  - Recursive Naive cannot run on large n due to O(2^n).");
    console.log("  - Recursive + Memo may throw a stack overflow for large n.");
    console.log("  - Bottom-Up and Space Optimized scale well to large n.");
    console.log("  - Space Optimized uses O(k) memory instead of O(n).");
    console.log("=".repeat(70));
}

runTests();

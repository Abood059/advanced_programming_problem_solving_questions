function measure(name, fn) {
    const start = process.hrtime.bigint();
    try {
        const result = fn();
        const end = process.hrtime.bigint();
        const ms = Number(end - start) / 1e6;
        return { name, result, ms, error: null };
    } catch (err) {
        const end = process.hrtime.bigint();
        const ms = Number(end - start) / 1e6;
        return { name, result: null, ms, error: err.message };
    }
}

function printResult({ name, result, ms, error }) {
    if (error) {
        console.log(`  ${name.padEnd(30)} | ERROR: ${error} (took ${ms.toFixed(3)} ms)`);
    } else {
        console.log(`  ${name.padEnd(30)} | result = ${String(result).padStart(8)} | time = ${ms.toFixed(3)} ms`);
    }
}

module.exports = { measure, printResult };

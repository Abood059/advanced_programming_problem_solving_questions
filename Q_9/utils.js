function printResult(title, result) {
    console.log(`\n=== ${title} ===`);
    if (result.distance === Infinity) {
        console.log('Result: No path found.');
    } else if (result.distance === -Infinity) {
        console.log('Result: Negative cycle affecting destination. Shortest path is -Infinity.');
    } else {
        console.log(`Shortest distance: ${result.distance}`);
        console.log(`Path: ${result.path.join(' -> ')}`);
    }
}

module.exports = { printResult };

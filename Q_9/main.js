const { printResult } = require('./utils');
const { bfs } = require('./bfs');
const { dijkstra } = require('./dijkstra');
const { bellmanFord } = require('./bellman-ford');

// ============================================================
// Test Scenarios
// ============================================================

console.log('============================================');
console.log('  SHORTEST PATH IN A NETWORK - TEST SUITE  ');
console.log('============================================');

// -------------------- Case 1 Tests --------------------
console.log('\n\n--- CASE 1: BFS (Equal Weights) ---');

// Graph: unweighted
const adjBFS = {
    A: ['B', 'C'],
    B: ['A', 'D'],
    C: ['A', 'D'],
    D: ['B', 'C', 'E'],
    E: ['D']
};

printResult('BFS: A to E', bfs(adjBFS, 'A', 'E'));
printResult('BFS: A to A', bfs(adjBFS, 'A', 'A'));
printResult('BFS: A to F (not in graph)', bfs(adjBFS, 'A', 'F'));

// -------------------- Case 2 Tests --------------------
console.log('\n\n--- CASE 2: Dijkstra (Non-negative Weights) ---');

const adjDijkstra = {
    A: [['B', 4], ['C', 2]],
    B: [['A', 4], ['D', 5]],
    C: [['A', 2], ['D', 1]],
    D: [['B', 5], ['C', 1], ['E', 3]],
    E: [['D', 3]]
};

printResult('Dijkstra: A to E (weighted)', dijkstra(adjDijkstra, 'A', 'E'));
printResult('Dijkstra: A to A', dijkstra(adjDijkstra, 'A', 'A'));

// Equal weights (should match BFS)
const adjEqual = {
    A: [['B', 1], ['C', 1]],
    B: [['A', 1], ['D', 1]],
    C: [['A', 1], ['D', 1]],
    D: [['B', 1], ['C', 1], ['E', 1]],
    E: [['D', 1]]
};
printResult('Dijkstra: A to E (all weights = 1)', dijkstra(adjEqual, 'A', 'E'));

// No path
const adjNoPath = {
    A: [['B', 1]],
    B: [['A', 1]],
    C: [['D', 1]],
    D: [['C', 1]]
};
printResult('Dijkstra: A to D (disconnected)', dijkstra(adjNoPath, 'A', 'D'));

// -------------------- Case 3 Tests --------------------
console.log('\n\n--- CASE 3: Bellman-Ford (Negative Weights) ---');

// Scenario 3.1: Negative edge, no negative cycle
const edges1 = [
    ['A', 'B', 4],
    ['A', 'C', 2],
    ['B', 'D', 5],
    ['C', 'D', -3],
    ['D', 'E', 1]
];
const vertices1 = ['A', 'B', 'C', 'D', 'E'];
printResult('Bellman-Ford: A to E (negative edge, no cycle)', 
    bellmanFord(edges1, vertices1, 'A', 'E'));

// Scenario 3.2: Negative cycle affecting destination
const edges2 = [
    ['A', 'B', 4],
    ['A', 'C', 2],
    ['B', 'D', 5],
    ['C', 'D', -3],
    ['D', 'E', 1],
    ['D', 'C', -2]  // creates cycle C->D->C with weight -5
];
printResult('Bellman-Ford: A to E (negative cycle affecting E)', 
    bellmanFord(edges2, vertices1, 'A', 'E'));

// Scenario 3.3: Negative cycle NOT affecting destination
const edges3 = [
    ['A', 'B', 4],
    ['A', 'C', 2],
    ['B', 'D', 5],
    ['C', 'D', -3],
    ['D', 'E', 1],
    ['A', 'F', 1],
    ['F', 'G', -1],
    ['G', 'F', -1]  // negative cycle F<->G, but cannot reach E
];
const vertices3 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
printResult('Bellman-Ford: A to E (negative cycle not affecting E)', 
    bellmanFord(edges3, vertices3, 'A', 'E'));

// Scenario 3.4: A = B with no negative cycle
const edges4 = [
    ['A', 'B', 1],
    ['B', 'C', -1]
];
const vertices4 = ['A', 'B', 'C'];
printResult('Bellman-Ford: A to A (no negative cycle)', 
    bellmanFord(edges4, vertices4, 'A', 'A'));

// Scenario 3.5: A = B with negative cycle returning to A
const edges5 = [
    ['A', 'B', 1],
    ['B', 'C', -1],
    ['C', 'A', -1]  // cycle A->B->C->A with weight -1
];
printResult('Bellman-Ford: A to A (negative cycle returning to A)', 
    bellmanFord(edges5, vertices4, 'A', 'A'));

console.log('\n============================================');
console.log('  TESTS COMPLETED');
console.log('============================================');

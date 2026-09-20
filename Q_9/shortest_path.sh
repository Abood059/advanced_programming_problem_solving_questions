#!/bin/bash

# Create a Node.js script to demonstrate and test the three cases
cat > shortest_path.js << 'EOF'
// ============================================================
// Shortest Path in a Network - Three Cases
// Case 1: Equal weights (BFS)
// Case 2: Non-negative weights (Dijkstra)
// Case 3: Possibly negative weights (Bellman-Ford)
// ============================================================

// -------------------- Helper Functions --------------------

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

// -------------------- Case 1: BFS (Equal Weights) --------------------

function bfs(adj, start, end) {
    const queue = [start];
    const visited = new Set([start]);
    const dist = { [start]: 0 };
    const parent = { [start]: null };

    while (queue.length > 0) {
        const u = queue.shift();
        if (u === end) break;
        for (const v of adj[u] || []) {
            if (!visited.has(v)) {
                visited.add(v);
                dist[v] = dist[u] + 1;
                parent[v] = u;
                queue.push(v);
            }
        }
    }

    if (!(end in dist)) return { distance: Infinity, path: null };

    const path = [];
    let cur = end;
    while (cur !== null) {
        path.push(cur);
        cur = parent[cur];
    }
    path.reverse();
    return { distance: dist[end], path };
}

// -------------------- Case 2: Dijkstra (Non-negative Weights) --------------------

function dijkstra(adj, start, end) {
    const dist = {};
    const parent = {};
    const visited = new Set();

    // Collect all nodes
    const nodes = new Set();
    for (const u in adj) {
        nodes.add(u);
        for (const [v] of adj[u]) nodes.add(v);
    }
    for (const node of nodes) {
        dist[node] = Infinity;
    }
    dist[start] = 0;

    const pq = [[0, start]]; // [distance, node]

    while (pq.length > 0) {
        pq.sort((a, b) => a[0] - b[0]);
        const [d, u] = pq.shift();

        if (visited.has(u)) continue;
        visited.add(u);

        if (u === end) break;

        for (const [v, w] of adj[u] || []) {
            if (!visited.has(v)) {
                const newDist = d + w;
                if (newDist < dist[v]) {
                    dist[v] = newDist;
                    parent[v] = u;
                    pq.push([newDist, v]);
                }
            }
        }
    }

    if (dist[end] === Infinity) return { distance: Infinity, path: null };

    const path = [];
    let cur = end;
    while (cur !== undefined) {
        path.push(cur);
        cur = parent[cur];
    }
    path.reverse();
    return { distance: dist[end], path };
}

// -------------------- Case 3: Bellman-Ford (Negative Weights) --------------------

function bellmanFord(edges, vertices, start, end) {
    const dist = {};
    const parent = {};

    for (const v of vertices) {
        dist[v] = Infinity;
        parent[v] = null;
    }
    dist[start] = 0;

    const V = vertices.length;

    // Relax V-1 times
    for (let i = 0; i < V - 1; i++) {
        let changed = false;
        for (const [u, v, w] of edges) {
            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                changed = true;
            }
        }
        if (!changed) break;
    }

    // Check for negative cycles
    const affected = new Set();
    for (const [u, v, w] of edges) {
        if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
            affected.add(v);
        }
    }

    if (affected.size > 0) {
        // Build adjacency list to check reachability to end
        const adj = {};
        for (const v of vertices) adj[v] = [];
        for (const [u, v] of edges) {
            adj[u].push(v);
        }

        const visited = new Set();
        const queue = [...affected];
        for (const node of affected) visited.add(node);

        let canReachEnd = false;
        while (queue.length > 0) {
            const u = queue.shift();
            if (u === end) {
                canReachEnd = true;
                break;
            }
            for (const v of adj[u] || []) {
                if (!visited.has(v)) {
                    visited.add(v);
                    queue.push(v);
                }
            }
        }

        if (canReachEnd) {
            return { distance: -Infinity, path: null, negativeCycle: true };
        }
    }

    if (dist[end] === Infinity) return { distance: Infinity, path: null };

    const path = [];
    let cur = end;
    while (cur !== null) {
        path.push(cur);
        cur = parent[cur];
    }
    path.reverse();
    return { distance: dist[end], path };
}

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
EOF

node shortest_path.js

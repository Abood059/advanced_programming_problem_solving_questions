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

module.exports = { bellmanFord };

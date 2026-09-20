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

module.exports = { dijkstra };

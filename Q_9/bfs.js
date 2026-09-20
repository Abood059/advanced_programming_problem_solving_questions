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

module.exports = { bfs };

class DependencyResolver {
  constructor() {
    this.adj = new Map();      // task -> list of tasks that depend on it
    this.indegree = new Map(); // task -> number of pending dependencies
    this.allTasks = new Set();
  }

  addTask(task) {
    if (!this.allTasks.has(task)) {
      this.allTasks.add(task);
      this.adj.set(task, []);
      this.indegree.set(task, 0);
    }
  }

  // A depends on B  =>  B must run before A  =>  edge B -> A
  addDependency(dependent, dependency) {
    this.addTask(dependent);
    this.addTask(dependency);
    this.adj.get(dependency).push(dependent);
    this.indegree.set(dependent, this.indegree.get(dependent) + 1);
  }

  _countEdges() {
    let count = 0;
    for (const list of this.adj.values()) count += list.length;
    return count;
  }

  resolve() {
    const t0 = process.hrtime.bigint();

    const queue = [];   // manual queue using index pointer for O(1)
    const order = [];
    const batches = [];

    // Initial frontier
    for (const task of this.allTasks) {
      if (this.indegree.get(task) === 0) queue.push(task);
    }

    let head = 0;
    while (head < queue.length) {
      const batchStart = head;
      const batchEnd = queue.length;
      const currentBatch = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const u = queue[i];
        currentBatch.push(u);
        order.push(u);

        const neighbors = this.adj.get(u);
        for (let j = 0; j < neighbors.length; j++) {
          const v = neighbors[j];
          const newIndeg = this.indegree.get(v) - 1;
          this.indegree.set(v, newIndeg);
          if (newIndeg === 0) queue.push(v);
        }
      }

      batches.push(currentBatch);
      head = batchEnd;
    }

    const t1 = process.hrtime.bigint();
    const elapsedMs = Number(t1 - t0) / 1e6;

    const hasCycle = order.length < this.allTasks.size;
    const cyclicTasks = hasCycle
      ? [...this.allTasks].filter(t => this.indegree.get(t) > 0)
      : [];

    return {
      valid: !hasCycle,
      order,
      batches,
      cyclicTasks,
      elapsedMs,
      totalTasks: this.allTasks.size,
      totalDependencies: this._countEdges(),
      batchCount: batches.length
    };
  }
}

module.exports = DependencyResolver;

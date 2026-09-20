class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(room) {
        this.heap.push(room);
        this._bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this._bubbleDown(0);
        }
        return top;
    }
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }
    size() {
        return this.heap.length;
    }
    _bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[parent].endTime <= this.heap[index].endTime) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }
    _bubbleDown(index) {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.heap[left].endTime < this.heap[smallest].endTime) smallest = left;
            if (right < n && this.heap[right].endTime < this.heap[smallest].endTime) smallest = right;
            if (smallest === index) break;
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

module.exports = MinHeap;

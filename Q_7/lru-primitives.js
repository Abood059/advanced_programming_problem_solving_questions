class Node {
  constructor(key, expiry) {
    this.key = key; this.expiry = expiry;
    this.prev = null; this.next = null;
    this.ssdHits = 0;
  }
}

class LRUList {
  constructor() { this.head = null; this.tail = null; this.size = 0; }
  addToHead(n) {
    n.prev = null; n.next = this.head;
    if (this.head) this.head.prev = n;
    this.head = n;
    if (!this.tail) this.tail = n;
    this.size++;
  }
  remove(n) {
    if (n.prev) n.prev.next = n.next; else this.head = n.next;
    if (n.next) n.next.prev = n.prev; else this.tail = n.prev;
    n.prev = null; n.next = null; this.size--;
  }
  moveToHead(n) { if (this.head !== n) { this.remove(n); this.addToHead(n); } }
  removeTail() { if (!this.tail) return null; const t = this.tail; this.remove(t); return t; }
}

module.exports = { Node, LRUList };

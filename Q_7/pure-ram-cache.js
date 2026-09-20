const { Node, LRUList } = require('./lru-primitives');
const { RamValueStore } = require('./value-stores');

class PureRamCache {
  constructor(capacity, ttl, clock) {
    this.capacity = capacity; this.ttl = ttl; this.clock = clock;
    this.map = new Map();
    this.list = new LRUList();
    this.values = new RamValueStore();
    this.expiryQueue = []; this.expiryHead = 0;
    // FIX: include promotions/demotions to avoid NaN in reporting
    this.stats = { evictions: 0, expirations: 0, promotions: 0, demotions: 0 };
  }

  cleanup() {
    const now = this.clock.current();
    while (this.expiryHead < this.expiryQueue.length) {
      const ev = this.expiryQueue[this.expiryHead];
      if (ev.expiry > now) break;
      this.expiryHead++;
      const node = this.map.get(ev.key);
      if (node && node.expiry === ev.expiry) {
        this.map.delete(ev.key);
        this.list.remove(node);
        this.values.delete(ev.key);
        this.stats.expirations++;
      }
    }
    if (this.expiryHead > 5000 && this.expiryHead * 2 > this.expiryQueue.length) {
      this.expiryQueue = this.expiryQueue.slice(this.expiryHead);
      this.expiryHead = 0;
    }
  }

  get(key) {
    this.cleanup();
    const now = this.clock.current();
    const n = this.map.get(key);
    if (!n) return null;
    if (n.expiry <= now) {
      this.map.delete(key); this.list.remove(n); this.values.delete(key);
      return null;
    }
    this.list.moveToHead(n);
    return this.values.read(key);
  }

  put(key, value) {
    this.cleanup();
    const now = this.clock.current();
    const expiry = now + this.ttl;
    let n = this.map.get(key);
    if (n) {
      n.expiry = expiry;
      this.values.write(key, value);
      this.list.moveToHead(n);
      this.expiryQueue.push({ expiry, key });
      return;
    }
    if (this.map.size >= this.capacity) {
      const t = this.list.removeTail();
      if (t) { this.map.delete(t.key); this.values.delete(t.key); this.stats.evictions++; }
    }
    n = new Node(key, expiry);
    this.map.set(key, n);
    this.list.addToHead(n);
    this.values.write(key, value);
    this.expiryQueue.push({ expiry, key });
  }

  finalize() {}

  get size() { return this.map.size; }
}

module.exports = { PureRamCache };

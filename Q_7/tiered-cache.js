const { Node, LRUList } = require('./lru-primitives');
const { RamValueStore, SsdValueStore, WriteBackBuffer } = require('./value-stores');

class TieredCache {
  constructor(totalCapacity, ramRatio, ttl, clock, opts = {}) {
    const {
      ssdDelayUs = 100,
      wbCapacity = 512,
      promotionThreshold = 2,
    } = opts;

    this.totalCapacity = totalCapacity;
    this.ramCapacity = Math.max(1, Math.floor(totalCapacity * ramRatio));
    this.ttl = ttl;
    this.clock = clock;
    this.promotionThreshold = promotionThreshold;

    this.map = new Map();
    this.ramList = new LRUList();
    this.ssdList = new LRUList();
    this.ramValues = new RamValueStore();

    this.ssdStore = new SsdValueStore(ssdDelayUs);
    this.ssdValues = wbCapacity > 0
      ? new WriteBackBuffer(this.ssdStore, wbCapacity)
      : this.ssdStore;

    this.expiryQueue = []; this.expiryHead = 0;
    this.stats = {
      promotions: 0, demotions: 0, evictions: 0, expirations: 0,
      promotionRejections: 0, flushes: 0,
    };
  }

  get ramCount() { return this.ramList.size; }
  get ssdCount() { return this.ssdList.size; }
  get size() { return this.map.size; }

  cleanup() {
    const now = this.clock.current();
    while (this.expiryHead < this.expiryQueue.length) {
      const ev = this.expiryQueue[this.expiryHead];
      if (ev.expiry > now) break;
      this.expiryHead++;
      const node = this.map.get(ev.key);
      if (node && node.expiry === ev.expiry) {
        if (this.ramValues.has(ev.key)) {
          this.ramList.remove(node); this.ramValues.delete(ev.key);
        } else if (this.ssdValues.has(ev.key)) {
          this.ssdList.remove(node); this.ssdValues.delete(ev.key);
        }
        this.map.delete(ev.key);
        this.stats.expirations++;
      }
    }
    if (this.expiryHead > 5000 && this.expiryHead * 2 > this.expiryQueue.length) {
      this.expiryQueue = this.expiryQueue.slice(this.expiryHead);
      this.expiryHead = 0;
    }
  }

  _demote(node) {
    const v = this.ramValues.read(node.key);
    this.ramValues.delete(node.key);
    this.ramList.remove(node);
    this.ssdValues.write(node.key, v);
    this.ssdList.addToHead(node);
    node.ssdHits = 0;
    this.stats.demotions++;
  }

  _promote(node) {
    const v = this.ssdValues.read(node.key);
    this.ssdValues.delete(node.key);
    this.ssdList.remove(node);
    this.ramList.addToHead(node);
    this.ramValues.write(node.key, v);
    node.ssdHits = 0;
    this.stats.promotions++;
    while (this.ramList.size > this.ramCapacity) {
      this._demote(this.ramList.tail);
    }
  }

  get(key) {
    this.cleanup();
    const now = this.clock.current();
    const n = this.map.get(key);
    if (!n) return null;
    if (n.expiry <= now) {
      if (this.ramValues.has(key)) { this.ramList.remove(n); this.ramValues.delete(key); }
      else { this.ssdList.remove(n); this.ssdValues.delete(key); }
      this.map.delete(key);
      return null;
    }

    if (this.ramValues.has(key)) {
      this.ramList.moveToHead(n);
      return this.ramValues.read(key);
    }

    n.ssdHits++;
    if (n.ssdHits >= this.promotionThreshold) {
      this._promote(n);
      return this.ramValues.read(key);
    } else {
      this.stats.promotionRejections++;
      this.ssdList.moveToHead(n);
      return this.ssdValues.read(key);
    }
  }

  put(key, value) {
    this.cleanup();
    const now = this.clock.current();
    const expiry = now + this.ttl;
    let n = this.map.get(key);
    if (n) {
      n.expiry = expiry;
      if (this.ramValues.has(key)) {
        this.ramValues.write(key, value);
        this.ramList.moveToHead(n);
      } else {
        this.ssdValues.write(key, value);
        this.ssdList.moveToHead(n);
      }
      this.expiryQueue.push({ expiry, key });
      return;
    }

    if (this.map.size >= this.totalCapacity) {
      if (this.ssdList.tail) {
        const t = this.ssdList.removeTail();
        this.map.delete(t.key); this.ssdValues.delete(t.key);
        this.stats.evictions++;
      } else if (this.ramList.tail) {
        const t = this.ramList.removeTail();
        this.map.delete(t.key); this.ramValues.delete(t.key);
        this.stats.evictions++;
      }
    }

    n = new Node(key, expiry);
    this.map.set(key, n);
    this.ramList.addToHead(n);
    this.ramValues.write(key, value);
    while (this.ramList.size > this.ramCapacity) {
      this._demote(this.ramList.tail);
    }
    this.expiryQueue.push({ expiry, key });
  }

  finalize() {
    if (this.ssdValues.flush) {
      this.ssdValues.flush();
      this.stats.flushes = this.ssdValues.flushes || 0;
    }
  }
}

module.exports = { TieredCache };

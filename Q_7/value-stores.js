const { hybridDelay } = require('./utils');

class RamValueStore {
  constructor() { this.store = new Map(); }
  read(k) { return this.store.get(k); }
  write(k, v) { this.store.set(k, v); }
  delete(k) { this.store.delete(k); }
  has(k) { return this.store.has(k); }
  clear() { this.store.clear(); }
  get size() { return this.store.size; }
}

class SsdValueStore {
  static QUEUE_DEPTH = 32;

  constructor(delayUs = 100) {
    this.latencyNs = BigInt(Math.max(0, Math.floor(delayUs * 1000)));
    this.store = new Map();
    this.reads = 0; this.writes = 0; this.deletes = 0;
    this.batchedWrites = 0; this.batches = 0;
  }

  _delay(units = 1) {
    if (this.latencyNs <= 0n) return;
    hybridDelay(this.latencyNs * BigInt(units));
  }

  read(k)  { this.reads++; this._delay(1); return this.store.get(k); }
  write(k, v) { this.writes++; this._delay(1); this.store.set(k, v); }
  delete(k) { this.deletes++; this._delay(1); this.store.delete(k); }

  batchedWrite(entries) {
    if (entries.size === 0) return;
    const batches = Math.ceil(entries.size / SsdValueStore.QUEUE_DEPTH);
    this.writes += entries.size;
    this.batchedWrites += entries.size;
    this.batches += batches;
    this._delay(batches);
    for (const [k, v] of entries) this.store.set(k, v);
  }

  has(k) { return this.store.has(k); }
  clear() { this.store.clear(); }
  get size() { return this.store.size; }
}

class WriteBackBuffer {
  constructor(ssdStore, capacity = 512) {
    this.ssd = ssdStore;
    this.capacity = capacity;
    this.pending = new Map();
    this.flushes = 0;
  }

  write(key, value) {
    this.pending.set(key, value);
    if (this.pending.size >= this.capacity) this.flush();
  }

  read(key) {
    if (this.pending.has(key)) return this.pending.get(key);
    return this.ssd.read(key);
  }

  delete(key) {
    if (this.pending.has(key)) this.pending.delete(key);
    this.ssd.delete(key);
  }

  has(key) { return this.pending.has(key) || this.ssd.has(key); }

  flush() {
    if (this.pending.size === 0) return;
    this.ssd.batchedWrite(this.pending);
    this.pending.clear();
    this.flushes++;
  }

  clear() { this.pending.clear(); this.ssd.clear(); }
  get reads() { return this.ssd.reads; }
  get writes() { return this.ssd.writes; }
  get deletes() { return this.ssd.deletes; }
}

module.exports = {
  RamValueStore,
  SsdValueStore,
  WriteBackBuffer
};

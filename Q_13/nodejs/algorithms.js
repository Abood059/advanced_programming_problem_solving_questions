const { LIMIT, WINDOW_MS } = require("./config");
class FixedWindowCounter {
  constructor(limit = LIMIT, windowMs = WINDOW_MS) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.buckets = new Map();
  }
  allow(userId, nowMs) {
    const windowStart = Math.floor(nowMs / this.windowMs) * this.windowMs;
    let b = this.buckets.get(userId);
    if (!b || b.windowStart !== windowStart) {
      b = { windowStart, count: 0 };
      this.buckets.set(userId, b);
    }
    if (b.count >= this.limit) {
      return { allowed: false, remaining: 0, retryAfterMs: b.windowStart + this.windowMs - nowMs };
    }
    b.count += 1;
    return { allowed: true, remaining: this.limit - b.count, retryAfterMs: 0 };
  }
  reset()     { this.buckets.clear(); }
  footprint() { return { users: this.buckets.size, entries: this.buckets.size }; }
}

class SlidingWindowLog {
  constructor(limit = LIMIT, windowMs = WINDOW_MS) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.logs = new Map();
  }
  allow(userId, nowMs) {
    let arr = this.logs.get(userId);
    if (!arr) { arr = []; this.logs.set(userId, arr); }
    const cutoff = nowMs - this.windowMs;
    let i = 0;
    while (i < arr.length && arr[i] <= cutoff) i += 1;
    if (i > 0) arr.splice(0, i);
    if (arr.length >= this.limit) {
      return { allowed: false, remaining: 0, retryAfterMs: arr[0] + this.windowMs - nowMs };
    }
    arr.push(nowMs);
    return { allowed: true, remaining: this.limit - arr.length, retryAfterMs: 0 };
  }
  reset() { this.logs.clear(); }
  footprint() {
    let entries = 0;
    for (const arr of this.logs.values()) entries += arr.length;
    return { users: this.logs.size, entries };
  }
}

class SlidingWindowCounter {
  constructor(limit = LIMIT, windowMs = WINDOW_MS) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.buckets = new Map();
  }
  allow(userId, nowMs) {
    const windowStart = Math.floor(nowMs / this.windowMs) * this.windowMs;
    let b = this.buckets.get(userId);
    if (!b) {
      b = { windowStart, curr: 0, prev: 0 };
      this.buckets.set(userId, b);
    } else if (b.windowStart !== windowStart) {
      b.prev = (b.windowStart + this.windowMs === windowStart) ? b.curr : 0;
      b.curr = 0;
      b.windowStart = windowStart;
    }
    const elapsed   = nowMs - b.windowStart;
    const weight    = (this.windowMs - elapsed) / this.windowMs;
    const estimated = b.curr + b.prev * weight;
    if (estimated >= this.limit) {
      return { allowed: false, remaining: 0, retryAfterMs: this.windowMs - elapsed };
    }
    b.curr += 1;
    const after = b.curr + b.prev * weight;
    return { allowed: true, remaining: Math.max(0, Math.floor(this.limit - after)), retryAfterMs: 0 };
  }
  reset()     { this.buckets.clear(); }
  footprint() { return { users: this.buckets.size, entries: this.buckets.size }; }
}

class TokenBucket {
  constructor(capacity = LIMIT, windowMs = WINDOW_MS) {
    this.capacity   = capacity;
    this.refillRate = capacity / windowMs;
    this.buckets    = new Map();
  }
  allow(userId, nowMs) {
    let b = this.buckets.get(userId);
    if (!b) {
      b = { tokens: this.capacity, lastRefillMs: nowMs };
      this.buckets.set(userId, b);
    } else {
      const elapsed = nowMs - b.lastRefillMs;
      if (elapsed > 0) {
        b.tokens = Math.min(this.capacity, b.tokens + elapsed * this.refillRate);
        b.lastRefillMs = nowMs;
      }
    }
    if (b.tokens < 1) {
      return { allowed: false, remaining: 0, retryAfterMs: Math.ceil((1 - b.tokens) / this.refillRate) };
    }
    b.tokens -= 1;
    return { allowed: true, remaining: Math.floor(b.tokens), retryAfterMs: 0 };
  }
  reset()     { this.buckets.clear(); }
  footprint() { return { users: this.buckets.size, entries: this.buckets.size }; }
}

class LeakyBucket {
  constructor(capacity = LIMIT, windowMs = WINDOW_MS) {
    this.capacity = capacity;
    this.leakRate = capacity / windowMs;
    this.buckets  = new Map();
  }
  allow(userId, nowMs) {
    let b = this.buckets.get(userId);
    if (!b) {
      b = { level: 0, lastLeakMs: nowMs };
      this.buckets.set(userId, b);
    } else {
      const elapsed = nowMs - b.lastLeakMs;
      if (elapsed > 0) {
        b.level = Math.max(0, b.level - elapsed * this.leakRate);
        b.lastLeakMs = nowMs;
      }
    }
    if (b.level + 1 > this.capacity) {
      return { allowed: false, remaining: 0, retryAfterMs: Math.ceil((b.level + 1 - this.capacity) / this.leakRate) };
    }
    b.level += 1;
    return { allowed: true, remaining: Math.floor(this.capacity - b.level), retryAfterMs: 0 };
  }
  reset()     { this.buckets.clear(); }
  footprint() { return { users: this.buckets.size, entries: this.buckets.size }; }
}

class GCRA {
  constructor(limit = LIMIT, windowMs = WINDOW_MS) {
    this.limit    = limit;
    this.windowMs = windowMs;
    this.T        = windowMs / limit;
    this.tau      = windowMs - this.T;
    this.states   = new Map();
  }
  allow(userId, nowMs) {
    let s = this.states.get(userId);
    if (!s) { s = { tat: 0 }; this.states.set(userId, s); }
    if (nowMs < s.tat - this.tau) {
      return { allowed: false, remaining: 0, retryAfterMs: s.tat - this.tau - nowMs };
    }
    s.tat = Math.max(s.tat, nowMs) + this.T;
    return { allowed: true, remaining: 0, retryAfterMs: 0 };
  }
  reset()     { this.states.clear(); }
  footprint() { return { users: this.states.size, entries: this.states.size }; }
}


module.exports = { FixedWindowCounter, SlidingWindowLog, SlidingWindowCounter, TokenBucket, LeakyBucket, GCRA };

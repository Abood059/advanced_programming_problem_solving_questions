const { sleep } = require('./utils');

async function benchmark(factory, workload, iterations, getCount, putCount) {
  const runs = [];

  for (let it = 0; it < iterations; it++) {
    if (global.gc) global.gc();
    await sleep(20);
    if (global.gc) global.gc();
    await sleep(20);

    const rssBefore = process.memoryUsage().rss;
    const heapBefore = process.memoryUsage().heapUsed;

    const { cache, clock } = factory();

    const t1 = process.hrtime.bigint();
    let hits = 0, misses = 0;
    for (let i = 0; i < workload.length; i++) {
      const op = workload[i];
      clock.advance();
      if (op.type === 'put') cache.put(op.key, op.value);
      else {
        const v = cache.get(op.key);
        if (v !== null && v !== undefined) hits++; else misses++;
      }
    }
    const t2 = process.hrtime.bigint();

    if (cache.finalize) cache.finalize();

    const rssPeak = process.memoryUsage().rss;
    const heapPeak = process.memoryUsage().heapUsed;

    const sizeAfter = cache.size;
    const ramCount = cache.ramCount !== undefined ? cache.ramCount : cache.size;
    const ssdCount = cache.ssdCount !== undefined ? cache.ssdCount : 0;
    const ssdReads = cache.ssdValues ? cache.ssdValues.reads : 0;
    const ssdWrites = cache.ssdValues ? cache.ssdValues.writes : 0;
    const ssdDeletes = cache.ssdValues ? cache.ssdValues.deletes : 0;
    const stats = cache.stats || { promotions: 0, demotions: 0, evictions: 0, expirations: 0, promotionRejections: 0, flushes: 0 };

    if (cache.map) cache.map.clear();
    cache.list = null; cache.ramList = null; cache.ssdList = null;
    if (cache.values) cache.values.clear();
    if (cache.ramValues) cache.ramValues.clear();
    if (cache.ssdValues) cache.ssdValues.clear();
    if (cache.expiryQueue) { cache.expiryQueue.length = 0; cache.expiryQueue = null; }

    if (global.gc) global.gc();
    await sleep(20);
    if (global.gc) global.gc();
    await sleep(20);

    const rssAfter = process.memoryUsage().rss;
    const timeMs = Number(t2 - t1) / 1e6;

    const hitRate = hits / (hits + misses);
    const writeAmp = putCount > 0 ? ssdWrites / putCount : 0;
    const promoEff = stats.promotions + stats.promotionRejections > 0
      ? stats.promotions / (stats.promotions + stats.promotionRejections)
      : 1;
    const churn = cache.totalCapacity ? stats.demotions / cache.totalCapacity : 0;

    runs.push({
      timeMs,
      getsPerSec: (getCount / timeMs) * 1000,
      peakHeapMB: Math.max(0, (heapPeak - heapBefore) / 1024 / 1024),
      peakRssMB: Math.max(0, (rssPeak - rssBefore) / 1024 / 1024),
      residentMB: Math.max(0, (rssAfter - rssBefore) / 1024 / 1024),
      hitRate, writeAmp, promoEff, churn,
      sizeAfter, ramCount, ssdCount,
      ssdReads, ssdWrites, ssdDeletes,
      promotions: stats.promotions,
      promotionRejections: stats.promotionRejections,
      demotions: stats.demotions,
      evictions: stats.evictions,
      expirations: stats.expirations,
      flushes: stats.flushes,
    });
  }

  const avg = (k) => runs.reduce((s, r) => s + r[k], 0) / runs.length;
  return {
    avgTimeMs: avg('timeMs'),
    avgGetsPerSec: avg('getsPerSec'),
    avgPeakHeapMB: avg('peakHeapMB'),
    avgPeakRssMB: avg('peakRssMB'),
    avgResidentMB: avg('residentMB'),
    avgHitRate: avg('hitRate'),
    avgWriteAmp: avg('writeAmp'),
    avgPromoEff: avg('promoEff'),
    avgChurn: avg('churn'),
    avgSizeAfter: avg('sizeAfter'),
    avgRam: avg('ramCount'),
    avgSsd: avg('ssdCount'),
    avgSsdReads: avg('ssdReads'),
    avgSsdWrites: avg('ssdWrites'),
    avgSsdDeletes: avg('ssdDeletes'),
    avgPromotions: avg('promotions'),
    avgPromotionRejections: avg('promotionRejections'),
    avgDemotions: avg('demotions'),
    avgEvictions: avg('evictions'),
    avgExpirations: avg('expirations'),
    avgFlushes: avg('flushes'),
  };
}

module.exports = { benchmark };

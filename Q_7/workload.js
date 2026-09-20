const { buildZipfCDF, zipfSample } = require('./utils');

function generateWorkload(rand, numOps, keySpace, putRatio, alpha, valueSize) {
  const cdf = buildZipfCDF(keySpace, alpha);
  const ops = new Array(numOps);
  const useLarge = valueSize > 16;
  const payload = useLarge ? 'x'.repeat(valueSize) : null;

  for (let i = 0; i < numOps; i++) {
    const keyIdx = zipfSample(cdf, rand);
    const key = 'k' + keyIdx;
    if (rand.next() < putRatio) {
      ops[i] = { type: 'put', key, value: useLarge ? payload + i : i };
    } else {
      ops[i] = { type: 'get', key };
    }
  }
  return ops;
}

module.exports = { generateWorkload };

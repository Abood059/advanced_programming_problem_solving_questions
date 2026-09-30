const { HEAVY_ITERS, LIGHT_ITERS } = require("./config");
// Each scenario exposes:
//   name        : display name
//   total       : total number of requests (for display and iteration count)
//   heavy       : whether to use HEAVY_ITERS instead of LIGHT_ITERS
//   run(check)  : executes the workload; check(userId, t) is provided
// ----------------------------------------------------------------------------

const SCENARIOS = [
  {
    name: 'Normal',
    total: 50,
    heavy: false,
    run: (check) => {
      for (let i = 0; i < 50; i++) check('u1', i * 1200);
    },
  },
  {
    name: 'AtLimit',
    total: 100,
    heavy: false,
    run: (check) => {
      for (let i = 0; i < 100; i++) check('u1', i * 600);
    },
  },
  {
    name: 'Boundary',
    total: 200,
    heavy: false,
    run: (check) => {
      for (let i = 0; i < 100; i++) check('u1', 59_900 + i);
      for (let i = 0; i < 100; i++) check('u1', 60_000 + i);
    },
  },
  {
    name: 'ExtremeBurst',
    total: 10_000,
    heavy: false,
    run: (check) => {
      for (let i = 0; i < 10_000; i++) check('u1', 0);
    },
  },
  {
    name: 'HundredKUsers',
    total: 100_000,
    heavy: true,
    run: (check) => {
      for (let u = 0; u < 100_000; u++) check('user_' + u, 0);
    },
  },
  {
    name: 'MillionUsers',
    total: 1_000_000,
    heavy: true,
    run: (check) => {
      for (let u = 0; u < 1_000_000; u++) check('user_' + u, 0);
    },
  },
  {
    name: 'HeavySingleUser',
    total: 1_000_000,
    heavy: true,
    run: (check) => {
      // 1 user, 1M requests spread over 1 hour (3.6 ms apart)
      for (let i = 0; i < 1_000_000; i++) check('heavy', i * 3.6);
    },
  },
  {
    name: 'LongSustained',
    total: 1_000_000,
    heavy: true,
    run: (check) => {
      // 100 users × 10,000 requests each, all spread over 1 hour
      for (let i = 0; i < 10_000; i++) {
        const t = i * 360;  // one request per user every 360 ms
        for (let u = 0; u < 100; u++) {
          check('u_' + u, t);
        }
      }
    },
  },
  {
    name: 'MixedHotCold',
    total: 1_009_000,
    heavy: true,
    run: (check) => {
      // 9,000 cold users: 1 request each
      for (let u = 0; u < 9_000; u++) check('cold_' + u, 0);
      // 1,000 hot users: 1,000 requests each, spread over 60 s
      for (let u = 0; u < 1_000; u++) {
        const id = 'hot_' + u;
        for (let i = 0; i < 1_000; i++) check(id, i * 60);
      }
    },
  },
];


module.exports = SCENARIOS;

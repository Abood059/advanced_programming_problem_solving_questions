function buildTestCases() {
  const cases = [];

  /* ---------------- Basic sanity ---------------- */

  cases.push({
    name: "simple nested object",
    input: { user: { address: { city: "Gaza", coordinates: { lat: 31.5 } } } }
  });

  cases.push({
    name: "flat object",
    input: { a: 1, b: "two", c: true, d: null }
  });

  /* ---------------- Primitive roots ---------------- */

  cases.push({ name: "primitive root: number", input: 5 });
  cases.push({ name: "primitive root: string", input: "hello" });
  cases.push({ name: "primitive root: null", input: null });
  cases.push({ name: "primitive root: undefined", input: undefined });
  cases.push({ name: "primitive root: boolean", input: true });
  cases.push({ name: "primitive root: bigint", input: 42n });
  cases.push({ name: "primitive root: NaN", input: NaN });
  cases.push({ name: "primitive root: Infinity", input: Infinity });

  /* ---------------- Empty containers ---------------- */

  cases.push({ name: "empty object root", input: {} });
  cases.push({ name: "empty array root", input: [] });
  cases.push({
    name: "nested empty containers",
    input: { a: {}, b: [], c: { d: {} }, e: [[]] }
  });

  /* ---------------- Arrays ---------------- */

  cases.push({ name: "array root [1,2,3]", input: [1, 2, 3] });
  cases.push({ name: "nested array root [[1,2],[3,4]]", input: [[1, 2], [3, 4]] });
  cases.push({
    name: "array of objects",
    input: [{ id: 1 }, { id: 2, tags: ["x"] }]
  });
  cases.push({
    name: "sparse array [1, , 3]",
    input: { arr: [1, , 3] }
  });
  cases.push({
    name: "array with trailing holes",
    input: { arr: [1, 2, , , ] }
  });
  cases.push({
    name: "deeply nested arrays (3 levels)",
    input: { matrix: [[[1, 2], [3, 4]], [[5, 6]]] }
  });

  /* ---------------- Special characters in keys ---------------- */

  cases.push({
    name: "keys with dots: 'a.b' and a.b",
    input: { "a.b": 1, a: { b: 2 } }
  });
  cases.push({
    name: "key with brackets: 'a[0]'",
    input: { "a[0]": 1 }
  });
  cases.push({
    name: "key with backslash: 'a\\b'",
    input: { "a\\b": 1 }
  });
  cases.push({
    name: "key with all special chars",
    input: { "a.b[0]\\c": 1 }
  });
  cases.push({
    name: "empty key and empty value",
    input: { "": 1, x: "" }
  });
  cases.push({
    name: "nested empty key",
    input: { a: { "": { b: 1 } } }
  });
  cases.push({
    name: "multiple empty keys",
    input: { "": { "": { "": 1 } } }
  });
  cases.push({
    name: "keys that look like paths",
    input: { "a.b[0]": 1, "a.b": { "0": 2 } }
  });
  cases.push({
    name: "unicode keys",
    input: { "مفتاح": 1, "🔑": 2, "café": 3 }
  });
  cases.push({
    name: "very long key",
    input: { ["k".repeat(200)]: 1 }
  });

  /* ---------------- Numeric keys ---------------- */

  cases.push({
    name: "numeric keys object",
    input: { "0": "a", "1": "b" }
  });
  cases.push({
    name: "negative and float keys",
    input: { "-1": "a", "1.5": "b" }
  });
  cases.push({
    name: "large integer key",
    input: { "9007199254740991": "max", "9007199254740992": "beyond" }
  });

  /* ---------------- Special value types ---------------- */

  cases.push({
    name: "Date value",
    input: { when: new Date("2024-01-01T00:00:00.000Z") }
  });
  cases.push({
    name: "RegExp value",
    input: { pattern: /abc/g }
  });
  cases.push({
    name: "Map value (treated as leaf)",
    input: { m: new Map([["x", 1]]) }
  });
  cases.push({
    name: "Set value (treated as leaf)",
    input: { s: new Set([1, 2]) }
  });
  cases.push({
    name: "function value (skipped)",
    input: { fn: function () {}, x: 1 }
  });
  cases.push({
    name: "symbol value (skipped)",
    input: { s: Symbol("test"), x: 1 }
  });
  cases.push({
    name: "NaN, Infinity, -Infinity",
    input: { n: NaN, i: Infinity, ni: -Infinity }
  });
  cases.push({
    name: "mixed special values",
    input: {
      date: new Date("2020-06-15T12:00:00.000Z"),
      re: /x/,
      big: 10n,
      n: null,
      u: undefined
    }
  });

  /* ---------------- Non-enumerable, symbol keys, getters ---------------- */

  cases.push({
    name: "non-enumerable property (should be skipped)",
    input: (() => {
      const o = { a: 1 };
      Object.defineProperty(o, "hidden", {
        value: 2, enumerable: false, configurable: true
      });
      return o;
    })()
  });

  cases.push({
    name: "symbol keys (should be skipped)",
    input: (() => {
      const s = Symbol("k");
      return { a: 1, [s]: 2 };
    })()
  });

  cases.push({
    name: "getter property",
    input: (() => {
      const o = { a: 1 };
      Object.defineProperty(o, "b", {
        get() { return 42; }, enumerable: true, configurable: true
      });
      return o;
    })()
  });

  /* ---------------- Dangerous keys ---------------- */

  cases.push({
    name: "dangerous keys: __proto__ and constructor",
    input: (() => {
      const o = {};
      Object.defineProperty(o, "__proto__", {
        value: 1, enumerable: true, configurable: true, writable: true
      });
      Object.defineProperty(o, "constructor", {
        value: 2, enumerable: true, configurable: true, writable: true
      });
      return o;
    })()
  });

  cases.push({
    name: "nested __proto__ key",
    input: (() => {
      const o = { a: {} };
      Object.defineProperty(o.a, "__proto__", {
        value: { x: 1 }, enumerable: true, configurable: true, writable: true
      });
      return o;
    })()
  });

  /* ---------------- Prototypes ---------------- */

  cases.push({
    name: "null prototype object",
    input: Object.assign(Object.create(null), { a: 1, b: { c: 2 } })
  });

  cases.push({
    name: "inherited property (should be skipped)",
    input: (() => {
      const proto = { inherited: 1 };
      const o = Object.create(proto);
      o.own = 2;
      return o;
    })()
  });

  /* ---------------- Circular references ---------------- */

  cases.push({
    name: "circular object (self)",
    input: (() => { const a = { name: "x" }; a.self = a; return a; })()
  });
  cases.push({
    name: "circular array (self)",
    input: (() => { const a = [1]; a.push(a); return a; })()
  });
  cases.push({
    name: "circular mutual (a.b=b, b.a=a)",
    input: (() => {
      const a = { name: "a" };
      const b = { name: "b", a };
      a.b = b;
      return { root: a };
    })()
  });
  cases.push({
    name: "circular at depth",
    input: (() => {
      const inner = { value: 1 };
      inner.self = inner;
      return { a: { b: { c: inner } } };
    })()
  });
  cases.push({
    name: "two separate circular nodes",
    input: (() => {
      const a = { tag: "a" }; a.me = a;
      const b = { tag: "b" }; b.me = b;
      return { x: a, y: b };
    })()
  });
  cases.push({
    name: "circular through array and object",
    input: (() => {
      const obj = { tag: "obj" };
      const arr = [obj];
      obj.arr = arr;
      return { root: obj };
    })()
  });

  /* ---------------- Shared references (DAG) ---------------- */

  cases.push({
    name: "shared reference (diamond)",
    input: (() => {
      const shared = { x: 1, y: { z: 2 } };
      return { a: shared, b: shared, c: [shared] };
    })()
  });
  cases.push({
    name: "shared reference at multiple depths",
    input: (() => {
      const leaf = { v: 1 };
      return {
        a: { b: leaf },
        c: leaf,
        d: { e: { f: leaf } }
      };
    })()
  });
  cases.push({
    name: "shared reference with mixed types",
    input: (() => {
      const shared = { num: 1, arr: [1, 2], obj: { deep: true } };
      return { first: shared, second: { nested: shared } };
    })()
  });
  cases.push({
    name: "shared empty container",
    input: (() => {
      const empty = {};
      return { a: empty, b: empty };
    })()
  });

  /* ---------------- Deep nesting ---------------- */

  cases.push({
    name: "deep nesting (100 levels)",
    input: (() => {
      let o = { value: "deep" };
      for (let i = 0; i < 100; i++) o = { nested: o };
      return o;
    })()
  });

  cases.push({
    name: "deep nesting (1000 levels) - stress",
    input: (() => {
      let o = { value: "deeper" };
      for (let i = 0; i < 1000; i++) o = { n: o };
      return o;
    })()
  });

  cases.push({
    name: "deep array nesting (500 levels)",
    input: (() => {
      let a = ["end"];
      for (let i = 0; i < 500; i++) a = [a];
      return a;
    })()
  });

  /* ---------------- Wide structures ---------------- */

  cases.push({
    name: "wide object (1000 keys)",
    input: (() => {
      const o = {};
      for (let i = 0; i < 1000; i++) o["k" + i] = i;
      return o;
    })()
  });

  cases.push({
    name: "wide array (1000 items)",
    input: Array.from({ length: 1000 }, (_, i) => i)
  });

  /* ---------------- Mixed complexity ---------------- */

  cases.push({
    name: "complex realistic JSON",
    input: {
      users: [
        {
          id: 1,
          name: "Ali",
          address: {
            city: "Gaza",
            coordinates: { lat: 31.5, lng: 34.47 },
            tags: ["home", "primary"]
          },
          contacts: {
            emails: ["ali@example.com", "ali2@example.com"],
            phones: [{ type: "mobile", number: "123" }]
          }
        },
        {
          id: 2,
          name: "Sara",
          address: { city: "Rafah", coordinates: { lat: 31.3, lng: 34.25 } }
        }
      ],
      meta: {
        total: 2,
        page: 1,
        filters: {},
        "special.key": "with.dot",
        "": "empty"
      }
    }
  });

  cases.push({
    name: "combined: circular + shared + special keys",
    input: (() => {
      const shared = { sharedField: 1 };
      const c = { name: "cycle" };
      c.self = c;
      return {
        "a.b": shared,
        c,
        nested: { "": shared, "x[y]": 42 }
      };
    })()
  });

  return cases;
}


module.exports = buildTestCases;

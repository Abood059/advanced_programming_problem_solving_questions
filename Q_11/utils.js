"use strict";



// True only for plain objects (Object.prototype or null prototype).
function isPlainObject(node) {
  if (node === null || typeof node !== "object") return false;
  const proto = Object.getPrototypeOf(node);
  return proto === Object.prototype || proto === null;
}

// A container is a plain object or an array. Everything else is a leaf.
function isContainer(node) {
  return Array.isArray(node) || isPlainObject(node);
}

// Empty containers are treated as leaves (stored as-is).
function isEmptyContainer(node) {
  if (Array.isArray(node)) return node.length === 0;
  return Object.keys(node).length === 0;
}

// Escape path-separator characters in a key so paths stay unambiguous.
function escapeKey(key) {
  return key
    .replace(/\\/g, "\\\\")
    .replace(/\./g, "\\.")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

// Skip values that cannot be serialized meaningfully.
function shouldSkip(node) {
  const t = typeof node;
  return t === "function" || t === "symbol";
}



function valueToString(v) {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  const t = typeof v;
  if (t === "number") {
    if (Number.isNaN(v)) return "NaN";
    if (v === Infinity) return "Infinity";
    if (v === -Infinity) return "-Infinity";
    return String(v);
  }
  if (t === "bigint") return v.toString() + "n";
  if (t === "string") return JSON.stringify(v);
  if (t === "boolean") return String(v);
  if (t === "function") return "[Function]";
  if (t === "symbol") return "[Symbol]";
  if (v instanceof Date) {
    try { return `Date(${v.toISOString()})`; }
    catch { return `Date(invalid)`; }
  }
  if (v instanceof RegExp) return `RegExp(${v})`;
  if (v instanceof Map) return `Map(size=${v.size})`;
  if (v instanceof Set) return `Set(size=${v.size})`;
  if (Array.isArray(v)) return "[]";
  if (typeof v === "object") return "{}";
  return String(v);
}

function normalizeResult(map) {
  const entries = [...map.entries()].map(([k, v]) => [k, valueToString(v)]);
  entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return entries;
}

function resultsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0]) return false;
    if (a[i][1] !== b[i][1]) return false;
  }
  return true;
}


module.exports = {
  isPlainObject, isContainer, isEmptyContainer, escapeKey, shouldSkip, valueToString, normalizeResult, resultsEqual
};

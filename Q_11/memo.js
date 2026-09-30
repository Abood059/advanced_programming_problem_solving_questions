const utils = require("./utils");
const { shouldSkip, isContainer, isEmptyContainer, escapeKey } = utils;


const LEAF = Symbol("leaf");

function flattenMemo(root) {
  const ancestors = new Set();
  const memo = new Map();

  function process(node) {
    if (shouldSkip(node)) {
      return { map: new Map(), hasCircular: false };
    }
    if (!isContainer(node)) {
      return { map: new Map([[LEAF, node]]), hasCircular: false };
    }
    if (ancestors.has(node)) {
      return { map: new Map([[LEAF, "[Circular]"]]), hasCircular: true };
    }
    if (isEmptyContainer(node)) {
      return { map: new Map([[LEAF, node]]), hasCircular: false };
    }

    if (memo.has(node)) {
      return { map: memo.get(node), hasCircular: false };
    }

    ancestors.add(node);

    const localMap = new Map();
    let hasCircular = false;

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (!(i in node)) continue;
        const child = process(node[i]);
        if (child.hasCircular) hasCircular = true;

        const prefix = `[${i}]`;
        for (const [rel, value] of child.map) {
          if (rel === LEAF) {
            localMap.set(prefix, value);
          } else {
            const sep = rel.startsWith("[") ? "" : ".";
            localMap.set(prefix + sep + rel, value);
          }
        }
      }
    } else {
      for (const k of Object.keys(node)) {
        const esc = escapeKey(k);
        const child = process(node[k]);
        if (child.hasCircular) hasCircular = true;

        for (const [rel, value] of child.map) {
          if (rel === LEAF) {
            localMap.set(esc, value);
          } else {
            const sep = rel.startsWith("[") ? "" : ".";
            localMap.set(esc + sep + rel, value);
          }
        }
      }
    }

    ancestors.delete(node);

    if (!hasCircular) {
      memo.set(node, localMap);
    }

    return { map: localMap, hasCircular };
  }

  const { map } = process(root);
  const result = new Map();
  for (const [rel, value] of map) {
    result.set(rel === LEAF ? "root" : rel, value);
  }
  return result;
}


module.exports = flattenMemo;

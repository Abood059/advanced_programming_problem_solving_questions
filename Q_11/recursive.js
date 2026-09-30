const utils = require("./utils");
const { shouldSkip, isContainer, isEmptyContainer, escapeKey } = utils;


function flattenRecursive(root) {
  const result = new Map();
  const ancestors = new Set();

  function visit(node, path) {
    if (shouldSkip(node)) return;

    if (!isContainer(node)) {
      result.set(path === null ? "root" : path, node);
      return;
    }
    if (ancestors.has(node)) {
      result.set(path === null ? "root" : path, "[Circular]");
      return;
    }
    if (isEmptyContainer(node)) {
      result.set(path === null ? "root" : path, node);
      return;
    }

    ancestors.add(node);

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (!(i in node)) continue; // skip holes in sparse arrays
        const childPath = path === null ? `[${i}]` : `${path}[${i}]`;
        visit(node[i], childPath);
      }
    } else {
      for (const k of Object.keys(node)) {
        const esc = escapeKey(k);
        const childPath = path === null ? esc : `${path}.${esc}`;
        visit(node[k], childPath);
      }
    }

    ancestors.delete(node);
  }

  visit(root, null);
  return result;
}


module.exports = flattenRecursive;

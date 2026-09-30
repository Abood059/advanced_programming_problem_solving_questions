const utils = require("./utils");
const { shouldSkip, isContainer, isEmptyContainer, escapeKey } = utils;


function flattenStack(root) {
  const result = new Map();
  const ancestors = new Set();
  const stack = [{ node: root, path: null, phase: "enter" }];

  while (stack.length > 0) {
    const { node, path, phase } = stack.pop();

    if (shouldSkip(node)) continue;

    if (phase === "exit") {
      ancestors.delete(node);
      continue;
    }

    if (!isContainer(node)) {
      result.set(path === null ? "root" : path, node);
      continue;
    }
    if (ancestors.has(node)) {
      result.set(path === null ? "root" : path, "[Circular]");
      continue;
    }
    if (isEmptyContainer(node)) {
      result.set(path === null ? "root" : path, node);
      continue;
    }

    ancestors.add(node);
    stack.push({ node, path, phase: "exit" });

    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        if (!(i in node)) continue;
        const childPath = path === null ? `[${i}]` : `${path}[${i}]`;
        stack.push({ node: node[i], path: childPath, phase: "enter" });
      }
    } else {
      const keys = Object.keys(node);
      for (let i = keys.length - 1; i >= 0; i--) {
        const k = keys[i];
        const esc = escapeKey(k);
        const childPath = path === null ? esc : `${path}.${esc}`;
        stack.push({ node: node[k], path: childPath, phase: "enter" });
      }
    }
  }

  return result;
}


module.exports = flattenStack;

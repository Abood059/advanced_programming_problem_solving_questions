const utils = require("./utils");
const { shouldSkip, isContainer, isEmptyContainer, escapeKey } = utils;


function flattenSegments(root) {
  const result = new Map();
  const ancestors = new Set();
  const segments = [];

  function buildPath() {
    if (segments.length === 0) return "root";
    let path = "";
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.type === "key") {
        path += (i === 0 ? "" : ".") + seg.value;
      } else {
        path += `[${seg.value}]`;
      }
    }
    return path;
  }

  function visit(node) {
    if (shouldSkip(node)) return;

    if (!isContainer(node)) {
      result.set(buildPath(), node);
      return;
    }
    if (ancestors.has(node)) {
      result.set(buildPath(), "[Circular]");
      return;
    }
    if (isEmptyContainer(node)) {
      result.set(buildPath(), node);
      return;
    }

    ancestors.add(node);

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (!(i in node)) continue;
        segments.push({ type: "index", value: i });
        visit(node[i]);
        segments.pop();
      }
    } else {
      for (const k of Object.keys(node)) {
        segments.push({ type: "key", value: escapeKey(k) });
        visit(node[k]);
        segments.pop();
      }
    }

    ancestors.delete(node);
  }

  visit(root);
  return result;
}


module.exports = flattenSegments;

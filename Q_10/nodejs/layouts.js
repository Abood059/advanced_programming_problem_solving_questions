function getCaterpillarAccessors(L) {
  return {
    getLeft: (i) => (i < L - 1) ? i + 1 : -1,
    getRight: (i) => (i < L) ? L + i : -1
  };
}

function buildPreorderChildren(N) {
  const H = Math.log2(N + 1) - 1;
  const dfsChildren = new Int32Array(N * 2).fill(-1);
  let counter = 0;
  function build(depth) {
    const myIndex = counter++;
    if (depth < H) {
      dfsChildren[2 * myIndex] = build(depth + 1);
      dfsChildren[2 * myIndex + 1] = build(depth + 1);
    }
    return myIndex;
  }
  build(0);
  return dfsChildren;
}

module.exports = { getCaterpillarAccessors, buildPreorderChildren };

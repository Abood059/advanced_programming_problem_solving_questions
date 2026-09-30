function dfsGeneric(stackBuf, getLeft, getRight, startNode = 0) {
  let top = 0;
  let maxTop = 0;
  stackBuf[top++] = startNode;
  let count = 0;
  while (top > 0) {
    if (top > maxTop) maxTop = top;
    const node = stackBuf[--top];
    count++;
    const left = getLeft(node);
    const right = getRight(node);
    if (right !== -1) stackBuf[top++] = right;
    if (left !== -1) stackBuf[top++] = left;
  }
  return { count, peakStack: maxTop };
}

function dfsHeap(stackBuf, N, startNode = 0) {
  let top = 0;
  let maxTop = 0;
  stackBuf[top++] = startNode;
  let count = 0;
  while (top > 0) {
    if (top > maxTop) maxTop = top;
    const node = stackBuf[--top];
    count++;
    const left = 2 * node + 1;
    const right = 2 * node + 2;
    if (right < N) stackBuf[top++] = right;
    if (left < N) stackBuf[top++] = left;
  }
  return { count, peakStack: maxTop };
}

function dfsPreorder(stackBuf, dfsChildren, startNode = 0) {
  let top = 0;
  let maxTop = 0;
  stackBuf[top++] = startNode;
  let count = 0;
  while (top > 0) {
    if (top > maxTop) maxTop = top;
    const node = stackBuf[--top];
    count++;
    const left = dfsChildren[2 * node];
    const right = dfsChildren[2 * node + 1];
    if (right !== -1) stackBuf[top++] = right;
    if (left !== -1) stackBuf[top++] = left;
  }
  return { count, peakStack: maxTop };
}

module.exports = { dfsGeneric, dfsHeap, dfsPreorder };

function bfsGeneric(queueBuf, getLeft, getRight, startNode = 0) {
  let head = 0, tail = 0;
  let maxSize = 0;
  queueBuf[tail++] = startNode;
  let count = 0;
  while (head < tail) {
    const size = tail - head;
    if (size > maxSize) maxSize = size;
    const node = queueBuf[head++];
    count++;
    const left = getLeft(node);
    const right = getRight(node);
    if (left !== -1) queueBuf[tail++] = left;
    if (right !== -1) queueBuf[tail++] = right;
  }
  return { count, peakQueue: maxSize };
}

function bfsHeap(queueBuf, N, startNode = 0) {
  let head = 0, tail = 0;
  let maxSize = 0;
  queueBuf[tail++] = startNode;
  let count = 0;
  while (head < tail) {
    const size = tail - head;
    if (size > maxSize) maxSize = size;
    const node = queueBuf[head++];
    count++;
    const left = 2 * node + 1;
    const right = 2 * node + 2;
    if (left < N) queueBuf[tail++] = left;
    if (right < N) queueBuf[tail++] = right;
  }
  return { count, peakQueue: maxSize };
}

function bfsPreorder(queueBuf, dfsChildren, startNode = 0) {
  let head = 0, tail = 0;
  let maxSize = 0;
  queueBuf[tail++] = startNode;
  let count = 0;
  while (head < tail) {
    const size = tail - head;
    if (size > maxSize) maxSize = size;
    const node = queueBuf[head++];
    count++;
    const left = dfsChildren[2 * node];
    const right = dfsChildren[2 * node + 1];
    if (left !== -1) queueBuf[tail++] = left;
    if (right !== -1) queueBuf[tail++] = right;
  }
  return { count, peakQueue: maxSize };
}

function bfsCircular(queueBuf, queueCap, getLeft, getRight, startNode = 0) {
  let head = 0, tail = 0;
  let maxSize = 0;
  const queueMask = queueCap - 1;
  queueBuf[tail] = startNode;
  tail = (tail + 1) & queueMask;
  let count = 0;
  while (head !== tail) {
    const size = (tail - head) & queueMask;
    if (size > maxSize) maxSize = size;

    const node = queueBuf[head];
    head = (head + 1) & queueMask;
    count++;

    const left = getLeft(node);
    const right = getRight(node);

    if (left !== -1) {
      queueBuf[tail] = left;
      tail = (tail + 1) & queueMask;
    }
    if (right !== -1) {
      queueBuf[tail] = right;
      tail = (tail + 1) & queueMask;
    }
  }
  return { count, peakQueue: maxSize };
}

module.exports = { bfsGeneric, bfsHeap, bfsPreorder, bfsCircular };

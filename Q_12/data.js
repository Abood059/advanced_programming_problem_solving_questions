module.exports = {
  generateData: function(n, maxValue = 100) {
    const arr = new Array(n + 1); // 1-indexed
    arr[0] = 0; // unused
    for (let i = 1; i <= n; i++) {
        arr[i] = Math.floor(Math.random() * maxValue) + 1;
    }
    return arr;
}
};

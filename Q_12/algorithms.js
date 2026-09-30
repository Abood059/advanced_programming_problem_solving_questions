// -------- (A) Simple recursion without memoization --------
function recursiveNaive(A, n, k) {
    function F(i) {
        if (i <= 0) return 0;
        const skip = F(i - 1);
        const take = A[i] + F(i - k);
        return Math.max(skip, take);
    }
    return F(n);
}

// -------- (B) Recursion + Memoization --------
function recursiveMemo(A, n, k) {
    const memo = new Array(n + 1).fill(-1);
    function F(i) {
        if (i <= 0) return 0;
        if (memo[i] !== -1) return memo[i];
        const skip = F(i - 1);
        const take = A[i] + F(i - k);
        memo[i] = Math.max(skip, take);
        return memo[i];
    }
    return F(n);
}

// -------- (C) Bottom-Up DP --------
function bottomUpDP(A, n, k) {
    const dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        const skip = dp[i - 1];
        let take = A[i];
        if (i - k >= 0) take += dp[i - k];
        dp[i] = Math.max(skip, take);
    }
    return dp[n];
}

// -------- (D) Space Optimized DP (Circular Buffer) --------
function spaceOptimizedDP(A, n, k) {
    const size = k + 1;
    const buffer = new Array(size).fill(0);
    for (let i = 1; i <= n; i++) {
        const skip = buffer[(i - 1) % size];
        let take = A[i];
        if (i - k >= 0) {
            take += buffer[(i - k) % size];
        }
        buffer[i % size] = Math.max(skip, take);
    }
    return buffer[n % size];
}

module.exports = { recursiveNaive, recursiveMemo, bottomUpDP, spaceOptimizedDP };

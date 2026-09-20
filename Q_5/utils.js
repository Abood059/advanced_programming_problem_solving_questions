let seed = 42;
function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

function randomInt(min, max) {
    return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[Math.floor(seededRandom() * arr.length)];
}

function randomSubset(arr, maxSize) {
    const size = randomInt(0, Math.min(maxSize, arr.length));
    const shuffled = [...arr].sort(() => seededRandom() - 0.5);
    return shuffled.slice(0, size);
}

module.exports = {
    seededRandom,
    randomInt,
    randomItem,
    randomSubset
};

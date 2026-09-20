const { WORKDAY_START, WORKDAY_END, LOCATIONS, EQUIPMENT_TYPES } = require('./config');
const { randomInt, randomItem, randomSubset, seededRandom } = require('./utils');

function generateMeetings(count) {
    const meetings = [];
    for (let i = 0; i < count; i++) {
        const duration = randomInt(15, 90);
        const start = randomInt(WORKDAY_START, WORKDAY_END - duration);
        const end = start + duration;
        const requiredCapacity = randomInt(5, 50);
        const requiredEquip = randomSubset(EQUIPMENT_TYPES, 2);
        const forbiddenEquip = randomSubset(EQUIPMENT_TYPES, 1);
        const location = seededRandom() > 0.3 ? randomItem(LOCATIONS) : null;
        meetings.push({
            start,
            end,
            requiredCapacity,
            requiredEquip,
            forbiddenEquip,
            location
        });
    }
    meetings.sort((a, b) => a.start - b.start);
    return meetings;
}

module.exports = generateMeetings;

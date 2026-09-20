const TOTAL_MEETINGS = 10000;
const BUFFER_TIME = 10; // minutes for room cleanup/turnaround
const LOCATIONS = ['Building-A', 'Building-B', 'Building-C'];
const EQUIPMENT_TYPES = ['projector', 'whiteboard', 'video-conference'];
const WORKDAY_START = 9 * 60; // 09:00 in minutes
const WORKDAY_END = 17 * 60;   // 17:00 in minutes

module.exports = {
    TOTAL_MEETINGS,
    BUFFER_TIME,
    LOCATIONS,
    EQUIPMENT_TYPES,
    WORKDAY_START,
    WORKDAY_END
};

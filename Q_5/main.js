const { performance } = require('perf_hooks');
const { TOTAL_MEETINGS, BUFFER_TIME } = require('./config');
const generateMeetings = require('./generator');
const scheduleMeetings = require('./scheduler');

function run() {
    console.log('========== Meeting Room Scheduler ==========');
    console.log(`Generating ${TOTAL_MEETINGS} random meetings...`);
    
    const meetings = generateMeetings(TOTAL_MEETINGS);
    
    console.log('Running algorithm (linear search + Best-Fit)...');
    const start = performance.now();
    const result = scheduleMeetings(meetings);
    const end = performance.now();
    const time = end - start;
    
    console.log('-------------------------------------------');
    console.log(`Total meetings scheduled: ${TOTAL_MEETINGS}`);
    console.log(`Buffer time: ${BUFFER_TIME} minutes`);
    console.log(`Rooms required: ${result.totalRooms}`);
    console.log(`Time taken: ${time.toFixed(2)} ms`);
    console.log('===========================================');
}

run();

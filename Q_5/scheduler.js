const MinHeap = require('./MinHeap');
const Room = require('./Room');
const { BUFFER_TIME } = require('./config');

function scheduleMeetings(meetings) {
    const heap = new MinHeap();
    let totalRooms = 0;
    const availableRooms = [];

    function findBestRoom(meeting) {
        let bestRoom = null;
        let bestDiff = Infinity;

        for (const room of availableRooms) {
            // Check capacity
            if (room.capacity < meeting.requiredCapacity) continue;

            // Check required equipment
            let hasAllRequired = true;
            for (const eq of meeting.requiredEquip) {
                if (!room.equipment.has(eq)) {
                    hasAllRequired = false;
                    break;
                }
            }
            if (!hasAllRequired) continue;

            // Check forbidden equipment
            let hasForbidden = false;
            for (const eq of meeting.forbiddenEquip) {
                if (room.equipment.has(eq)) {
                    hasForbidden = true;
                    break;
                }
            }
            if (hasForbidden) continue;

            // Check location
            if (meeting.location && room.location !== meeting.location) continue;

            // Calculate capacity waste (Best-Fit)
            const diff = room.capacity - meeting.requiredCapacity;
            if (diff < bestDiff) {
                bestDiff = diff;
                bestRoom = room;
            }
        }

        return bestRoom;
    }

    for (const meeting of meetings) {
        // Release rooms that have ended (including buffer time)
        while (heap.size() > 0 && heap.peek().endTime + BUFFER_TIME <= meeting.start) {
            const freedRoom = heap.pop();
            availableRooms.push(freedRoom);
        }

        // Find suitable room
        const chosenRoom = findBestRoom(meeting);

        if (chosenRoom) {
            // Remove from available
            const index = availableRooms.indexOf(chosenRoom);
            if (index !== -1) availableRooms.splice(index, 1);
            // Update end time and push to heap
            chosenRoom.endTime = meeting.end;
            heap.push(chosenRoom);
        } else {
            // No suitable room - rent a new one
            totalRooms++;
            const newRoom = new Room(
                meeting.end,
                meeting.requiredCapacity,
                meeting.requiredEquip,
                meeting.location
            );
            heap.push(newRoom);
        }
    }

    return { totalRooms };
}

module.exports = scheduleMeetings;

class Room {
    constructor(endTime, capacity, equipment, location) {
        this.endTime = endTime;
        this.capacity = capacity;
        this.equipment = new Set(equipment);
        this.location = location;
    }
}

module.exports = Room;

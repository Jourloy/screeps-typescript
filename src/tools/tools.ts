export class tools {
    /**
     * Find room in memory and return it
     */
    public static returnRoomByName(name: string) {
        const room = _.filter(Memory.bot.rooms, (o) => o.name === name)[0];
        return room;
    }

    /**
     * Find room in memory and return index of it
     */
    private static findIndexRoom(name: string): number | undefined {
        for (let i in Memory.bot.rooms) {
            if (Memory.bot.rooms[i].name === name) {
                return Memory.bot.rooms.indexOf(Memory.bot.rooms[i]);
            }
        }
        return undefined;
    }

    /**
     * Change memory room on other
     */
    public static updateRoom(room: RoomType) {
        const index = this.findIndexRoom(room.name);
        if (index) {
            Memory.bot.rooms.splice(index, 1);
            Memory.bot.rooms.push(room);
        }
    }

    /**
     * Get amount creeps which born in this room and have this role
     */
    public static amountCreeps(name: string, role: string): number {
        let count = 0;
        const creeps = Game.creeps;
        for (let i in creeps) {
            if (creeps[i].memory.spawnRoom === name && creeps[i].memory.role === role) count++;
        }
        return count;
    }

    /**
     * Check free or not a object for work
     */
    public static isBusy(id: string): boolean {
        const creeps = Game.creeps;
        for (let i in creeps) {
            if (creeps[i].memory.busy && creeps[i].memory.busy?.id === id) {
                return true;
            }
        }
        return false;
    }
}
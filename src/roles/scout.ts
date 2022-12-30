import { tools } from "tools/tools";

export class scout {
	public static creepInfo: CreepInfo = {
		role: 'scout',
        baseName: 's|p',
        builder: {
			pattern: [],
			mustBe: [MOVE],
			withoutMove: true,
		}
	}

	public static run(creep: Creep) {
		if (creep.memory.spawnRoom === creep.room.name) {
			creep.travelTo(Game.flags[creep.memory.flagID!]);
		} else {
			const rooms = Memory.bot.rooms;
			for (let i in rooms) {
				if (rooms[i].supply && rooms[i].name === creep.room.name) {
					Game.flags[creep.memory.flagID!].remove();
					creep.suicide();
					return;
				}
			}
			const memoryRoom = tools.returnRoomByName(creep.memory.targetRoom!);
			memoryRoom.supply!.name = creep.room.name;
			const enemy = creep.room.find(FIND_HOSTILE_STRUCTURES);
			if (enemy.length > 0) {
				memoryRoom.supply!.enemy = true;
			}
			const sources = creep.room.find(FIND_SOURCES);
			memoryRoom.supply!.sources = sources.length;
			tools.updateRoom(memoryRoom);
		}
	}
}

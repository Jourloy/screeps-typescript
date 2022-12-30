export class Dismantler {
	public static creepInfo: CreepInfo = {
		role: 'dismantler',
		baseName: 'd|a',
		builder: {
			pattern: [WORK],
		},
	};

	private static set(creep: Creep) {
		if (!creep.memory.state) {
			creep.memory.state = {
				empty: false,
			};
		}
		if (!creep.memory.busy) {
			creep.memory.busy = {
				id: null,
				type: null,
				aim: null,
			};
		}
	}

	public static run(creep: Creep) {
		this.set(creep);

		if (creep.room.controller!.level < 3) {
			const walls = creep.room.find(FIND_STRUCTURES, {
				filter: (s) => s.structureType === 'constructedWall',
			});
			if (walls.length > 0) {
				if (creep.memory.busy?.id === null) {
					creep.memory.busy.id = walls[0].id;
					creep.memory.busy.aim = 'dismantle';
				} else {
					const obj = Game.getObjectById(creep.memory.busy!.id);
					if (obj) {
						if (creep.dismantle(obj) === ERR_NOT_IN_RANGE) {
							creep.travelTo(obj);
						}
					} else {
						creep.memory.busy!.id = null;
						creep.memory.busy!.aim = null;
					}
				}
			} else {
				const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
				if (spawn?.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
					creep.travelTo(spawn);
				}
			}
		}
	}
}

import { RoomCollector } from "room/roomCollector";

export class RemouteWorker {
	public static creepInfo: CreepInfo = {
		role: 'remoute_worker',
		baseName: 'r_w|p [VIKING]',
		builder: {
			pattern: [WORK, CARRY],
            count: 6,
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

	private static findForBuild(creep: Creep): boolean {
		const constructionSites = RoomCollector.info[creep.room.name].constructions;
		if (constructionSites.length > 0) {
			if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                creep.travelTo(constructionSites[0], { range: 3 });
            }
            return true;
		}
		return false
	}

	private static switchState(creep: Creep) {
		if (creep.memory.state?.empty && creep.store.getFreeCapacity() === 0) {
			creep.memory.state.empty = false;
		} else if (!creep.memory.state?.empty && creep.store[RESOURCE_ENERGY] === 0) {
			creep.memory.state!.empty = true;
		}
	}

	private static mine(creep: Creep) {
        if (creep.room.name !== creep.memory.targetRoom) {
            creep.travelTo(Game.rooms[creep.memory.targetRoom!].getPositionAt(25, 25)!);
        } else {
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) =>
                    s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 100,
            });
            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(container);
                }
            } else {
                const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (!source) return;
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(source);
                }
            }
        }
	}

	private static work(creep: Creep) {
        if (creep.room.name !== creep.memory.spawnRoom) {
            creep.travelTo(Game.rooms[creep.memory.spawnRoom!].getPositionAt(25, 25)!);
        } else {
            const notFullStructures = RoomCollector.info[creep.room.name].energyStore;
			if (notFullStructures.length > 0) {
				if (creep.transfer(notFullStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.travelTo(notFullStructures[0]);
				}
			} else if (!this.findForBuild(creep)) {
                if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(creep.room.controller!, { range: 3 });
                }
            }
        }
    }

	public static run(creep: Creep) {
		this.set(creep);
		this.switchState(creep);

		if (creep.memory.state?.empty) {
            this.mine(creep);
        } else {
            this.work(creep);
        }
	}
}

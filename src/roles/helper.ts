import { RoomCollector } from 'room/roomCollector';

export class Helper {
	public static creepInfo: CreepInfo = {
		role: 'helper',
		baseName: 'h|p',
		builder: {
			pattern: [WORK, CARRY],
			count: 2,
		},
	};

    private static set(creep: Creep) {
		if (!creep.memory.state) {
			creep.memory.state = {
				empty: false,
			};
		}
	}

    private static switchState(creep: Creep) {
		if (creep.memory.state?.empty && creep.store.getFreeCapacity() === 0) {
			creep.memory.state.empty = false;
		} else if (!creep.memory.state?.empty && creep.store[RESOURCE_ENERGY] === 0) {
			creep.memory.state!.empty = true;
		}
	}

	private static mine(creep: Creep) {
		const ruins = RoomCollector.info[creep.room.name].ruins;
		const storage = RoomCollector.info[creep.room.name].storage;
		if (ruins.length > 0) {
			if (creep.withdraw(ruins[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.travelTo(ruins[0]);
			}
		} else if (storage && storage.store[RESOURCE_ENERGY] > 100) {
			if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.travelTo(storage);
			}
		} else {
			const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
				filter: (r) => r.resourceType === 'energy',
			});
			if (droppedEnergy && droppedEnergy.amount > 100) {
				if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
					creep.travelTo(droppedEnergy);
				}
			} else {
				const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (s) =>
						s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 30,
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
	}

	private static findWork(creep: Creep) {
		if (creep.room.controller!.ticksToDowngrade < 5000) {
			if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
				creep.travelTo(creep.room.controller!, { range: 3 });
			}
		} else {
			const notFullStructures = RoomCollector.info[creep.room.name].energyStore;
			if (notFullStructures.length > 0) {
				if (creep.transfer(notFullStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.travelTo(notFullStructures[0]);
				}
			} else {
				if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
					creep.travelTo(creep.room.controller!);
				}
			}
		}
	}


	private static work(creep: Creep) {
		this.findWork(creep);
	}

	public static run(creep: Creep) {
        this.set(creep);
        this.switchState(creep);
        
		if (creep.room.name !== creep.memory.spawnRoom) {
			creep.travelTo(Game.rooms[creep.memory.spawnRoom].getPositionAt(25, 25)!);
		} else {
			if (creep.memory.state?.empty) {
				this.mine(creep);
			} else {
				this.work(creep);
			}
		}
	}
}

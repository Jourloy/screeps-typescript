import { RoomCollector } from 'room/roomCollector';

export class transporter {
	public static creepInfo: CreepInfo = {
		role: 'transporter',
		baseName: 't|p',
		builder: {
			pattern: [CARRY],
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

	private static switchState(creep: Creep) {
		if (creep.memory.state?.empty && creep.store.getFreeCapacity() === 0) {
			creep.memory.state.empty = false;
		} else if (!creep.memory.state?.empty && creep.store[RESOURCE_ENERGY] === 0) {
			creep.memory.state!.empty = true;
		}
	}

	private static mine(creep: Creep) {
		const ruins = RoomCollector.info[creep.room.name].ruins;
		if (ruins.length > 0) {
			if (creep.withdraw(ruins[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.travelTo(ruins[0]);
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
				if (!creep.memory.busy?.id) {
					const structures = RoomCollector.info[creep.room.name];
					let containers = structures.allStructures.filter<StructureContainer>(
						(str): str is StructureContainer => str.structureType === 'container'
					);
					containers = containers.sort(
						(a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]
					);
					creep.memory.busy!.id = containers[0].id;
				} else {
					const container: StructureContainer = Game.getObjectById(creep.memory.busy.id);
					if (container && container.store[RESOURCE_ENERGY] > 100) {
						if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
							creep.travelTo(container);
						}
					} else creep.memory.busy!.id = null;
				}
			}
		}
	}

	private static work(creep: Creep) {
		const notFullStructures = RoomCollector.info[creep.room.name].energyStoreAll;
		const storage = RoomCollector.info[creep.room.name].storage;
		if (notFullStructures.length > 0) {
			if (creep.transfer(notFullStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.travelTo(notFullStructures[0]);
			}
		} else if (storage && storage.store[RESOURCE_ENERGY] < 100000) {
			if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.travelTo(storage);
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

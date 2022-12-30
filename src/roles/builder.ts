import { RoomCollector } from 'room/roomCollector';
import { tools } from 'tools/tools';

export class builder {
	public static creepInfo: CreepInfo = {
		role: 'builder',
		baseName: 'b|p',
		builder: {
			pattern: [WORK, CARRY],
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
		let constructionSites: any[] = [];
		if (creep.room.controller && creep.room.controller.level < 3) {
			constructionSites = RoomCollector.info[creep.room.name].constructions;
		} else {
			constructionSites = RoomCollector.info[creep.room.name].constructionsAll;
		}
		if (constructionSites.length > 0) {
			_.forEach(constructionSites, (c) => {
				if (creep.memory.busy?.id == null) {
					if (!tools.isBusy(c.id)) {
						creep.memory.busy!.id = c.id;
						creep.memory.busy!.type = c.structureType;
						creep.memory.busy!.aim = 'build';
					}
				}
			});
			if (creep.memory.busy?.id == null && constructionSites.length > 4) {
				if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
					creep.travelTo(constructionSites[0], { range: 3 });
				}
				return true;
			} else {
				return false
			}
		}
		return false
	}

	private static findForRepair(creep: Creep): boolean {
		const repairStructures = RoomCollector.info[creep.room.name].repair;
		if (repairStructures.length > 0) {
			_.forEach(repairStructures, (r) => {
				if (creep.memory.busy?.id == null) {
					if (!tools.isBusy(r.id)) {
						creep.memory.busy!.id = r.id;
						creep.memory.busy!.type = r.structureType;
						creep.memory.busy!.aim = 'repair';
					}
				}
			});
			if (creep.memory.busy?.id == null && repairStructures.length > 4) {
				if (creep.repair(repairStructures[0]) === ERR_NOT_IN_RANGE) {
					creep.travelTo(repairStructures[0], { range: 3 });
				}
				return true;
			} else {
				return false;
			}
		}
		return false;
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
        if (!this.findForBuild(creep)) {
            if (!this.findForRepair(creep)) {
                if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(creep.room.controller!, { range: 3 });
                }
            }
        }
	}

	private static isNeed(creep: Creep): boolean {
		let check = false;
        const constructionSites = RoomCollector.info[creep.room.name].constructionsAll;

		if (creep.memory.busy?.aim === 'build') {
			for (let i in constructionSites) {
				if (constructionSites[i].id === creep.memory.busy.id) check = true;
			}
		}

		if (creep.memory.busy?.aim === 'repair' && constructionSites.length === 0) {
			const repairStructures = RoomCollector.info[creep.room.name].repair;
			for (let i in repairStructures) {
				if (repairStructures[i].id === creep.memory.busy.id) check = true;
			}
		}

		if (!check && creep.memory.busy?.aim === 'build' && creep.memory.busy?.type === 'rampart') {
            const rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType === 'rampart' && s.hits < 100});
            if (rampart) {
                creep.memory.busy.id = rampart.id;
                creep.memory.busy.aim = 'repair';
                creep.memory.busy.type = 'rampart';
            }
        }

		creep.say(creep.memory.busy!.aim!);

		return check;
	}

	public static work(creep: Creep) {
        if (creep.memory.busy == null) this.set(creep);
		else if (creep.memory.busy.id == null) {
			this.findWork(creep);
		} else {
			if (this.isNeed(creep)) {
				const object = Game.getObjectById(creep.memory.busy.id);
				if (creep.memory.busy.aim === 'build') {
					if (creep.build(object) === ERR_NOT_IN_RANGE) {
						creep.travelTo(object, {range: 3});
					}
				} else {
					if (creep.repair(object) === ERR_NOT_IN_RANGE) {
						creep.travelTo(object, {range: 3});
					}
				}
			} else {
				creep.memory.busy = {
					id: null,
					type: null,
					aim: null,
				}
			}
		}
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

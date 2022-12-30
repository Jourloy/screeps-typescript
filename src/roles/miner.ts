export class miner {

    public static creepInfo: CreepInfo = {
		role: 'miner',
        baseName: 'm|p',
        builder: {
			pattern: [WORK],
			count: 6,
            mustBe: [CARRY],
            isForRoad: true,
            skipCarry: true,
		}
	}

    private static set(creep: Creep) {
		if (!creep.memory.state) {
			creep.memory.state = {
				busy: false,
			};
		}
	}

	private static switchState(creep: Creep) {
        const source: Source = Game.getObjectById(creep.memory.sourceID!);
        const container = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER });
        
        if (container.length > 0) {
            if (creep.memory.state?.busy && (creep.pos.x !== container[0].pos.x || creep.pos.y !== container[0].pos.y)) {
                creep.memory.state.busy = false;
            } else if (!creep.memory.state?.busy && (creep.pos.x === container[0].pos.x && creep.pos.y === container[0].pos.y)) {
                creep.memory.state!.busy = true;
            }
        } else {
            if (creep.memory.state?.busy && !creep.pos.inRangeTo(source.pos.x, source.pos.y, 1)) {
                creep.memory.state.busy = false;
            } else if (!creep.memory.state?.busy && creep.pos.inRangeTo(source.pos.x, source.pos.y, 1)) {
                creep.memory.state!.busy = true;
            }
        }
	}

	private static mine(creep: Creep) {
        const source: Source = Game.getObjectById(creep.memory.sourceID!);
        const container = source.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER });

        if (container.length > 0) {
            if (container[0].hits < container[0].hitsMax) {
                creep.repair(container[0]);
            }
        }
        if (container.length > 0) {
            creep.say(`${Math.round(container[0].store[RESOURCE_ENERGY] / 2000 * 100)}%`)
            if (container[0].store[RESOURCE_ENERGY] === 2000) {
                if (container[0].hits < container[0].hitsMax) {
                    if (creep.store[RESOURCE_ENERGY] < 40) {
                        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.memory.state!.busy = false;
                        }
                    }
                    creep.repair(container[0]);
                }
            } else {
                if (container[0].hits < container[0].hitsMax) {
                    creep.repair(container[0]);
                }
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.memory.state!.busy = false;
                }
            }
        } else {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.memory.state!.busy = false;
            }
        }
	}

    private static move(creep: Creep) {
        const source: Source = Game.getObjectById(creep.memory.sourceID!);
        const container = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType == STRUCTURE_CONTAINER });
        if (container.length > 0) creep.travelTo(container[0]);
        else creep.travelTo(source);
    }

	public static run(creep: Creep) {
        if (creep.spawning) return;

        this.set(creep);
        this.switchState(creep);
        if (creep.memory.state?.busy) {
            this.mine(creep);
        } else {
            this.move(creep);
        }
	}
}

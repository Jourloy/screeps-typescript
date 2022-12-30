export class Warrior {
	public static creepInfo: CreepInfo = {
		role: 'warrior',
		baseName: 'w|a',
		builder: {
			pattern: [ATTACK],
			mustBe: [HEAL],
		},
	};

	public static attack(creep: Creep, flag: Flag) {
        const moveParts = creep.body.filter(b => b.type === 'move' && b.hits > 0);
        const movePartsAll = creep.body.filter(b => b.type === 'move');
		const towers = creep.room.find<StructureTower>(FIND_HOSTILE_STRUCTURES, {
			filter: (s) => s.structureType === 'tower' && s.store[RESOURCE_ENERGY] > 0,
		});
		if ((towers.length > 0) || (moveParts.length < movePartsAll.length - 1)) {
			creep.heal(creep);
			creep.travelTo(flag);
		} else {
			const enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2);
			if (enemy.length > 0) {
				if (creep.attack(enemy[0]) === ERR_NOT_IN_RANGE) {
					creep.heal(creep);
					creep.travelTo(enemy[0]);
				}
			} else {
				const strc = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
					filter: (s) => s.structureType !== 'controller',
				});
				if (strc) {
					if (creep.attack(strc) === ERR_NOT_IN_RANGE) {
						creep.heal(creep);
						creep.travelTo(strc);
					}
				} else {
					const enemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
					if (enemy) {
						if (creep.attack(enemy) === ERR_NOT_IN_RANGE) {
							creep.heal(creep);
							creep.travelTo(enemy);
						}
					} else if (
						creep.room.controller &&
						creep.room.controller.sign?.text !== Memory.sign
					) {
						if (
							creep.signController(creep.room.controller, Memory.sign!) ===
							ERR_NOT_IN_RANGE
						) {
							creep.travelTo(creep.room.controller);
						}
					} else {
						creep.heal(creep);
						creep.travelTo(flag);
					}
				}
			}
		}
	}

	public static run(creep: Creep) {
		if (creep.memory.flagID) {
			const flag: Flag | null = Game.flags[creep.memory.flagID];
			if (flag) {
				if (creep.room.name !== flag.room?.name) {
					creep.travelTo(flag);
				} else {
					this.attack(creep, flag);
				}
			} else {
				for (let i in Game.flags) {
					if (
						Game.flags[i].color === COLOR_RED &&
						Game.flags[i].name.split('_')[0] === creep.memory.flagID.split('_')[0]
					) {
						creep.memory.flagID = Game.flags[i].name;
						break;
					}
				}
				if (creep.room.name !== creep.memory.spawnRoom) {
					creep.travelTo(Game.rooms[creep.memory.spawnRoom].getPositionAt(25, 25)!);
				} else {
					const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
					if (spawn?.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
						creep.travelTo(spawn);
					}
				}
			}
		}
	}
}

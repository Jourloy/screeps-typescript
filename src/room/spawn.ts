import { kebabCase } from 'lodash';
import { CreepManager } from 'roles/manager';
import { tools } from 'tools/tools';
import { roomController } from './room';

export class SpawnController {
	private static bodyPriority(body: BodyPartConstant | string) {
		switch (body) {
			case HEAL:
				return -1;
			case MOVE:
				return 2;
			case RANGED_ATTACK:
				return 1;
			case ATTACK:
				return 0;
			case WORK:
				return 7;
			case TOUGH:
				return 10;
			default:
				return 5;
		}
	}

	/**
	 * Generate body
	 *
	 * Thanks `Sergey from slack` for give me code which is base for this function and some other functions
	 */
	private static getBody(room: Room, opt: CreepBuilder): BodyPartConstant[] {
		const mustBe = opt.mustBe || [];
		const skipCarry = opt.skipCarry || false;
		const withoutMove = opt.withoutMove || false;
		const isForRoad = opt.isForRoad || false;

		let count = opt.count || 50;
		let availableEnergy = room.energyCapacityAvailable;
		if (opt.maxEnergy) {
			availableEnergy = opt.maxEnergy;
		}
		let index = 0;
		let moveIndex = 0;
		let step = 1;
		if (isForRoad) {
			step = 2;
		}

		const body: BodyPartConstant[] = [];

		/* Add first needed body parts */
		mustBe.forEach((b) => {
			if (!withoutMove || b !== CARRY || !skipCarry) {
				if (availableEnergy - (BODYPART_COST[b] + BODYPART_COST[MOVE]) < 0) {
					return false;
				}
				if (moveIndex == 0) {
					body.push(MOVE);
					availableEnergy -= BODYPART_COST[MOVE];
				}
				moveIndex = (moveIndex + 1) % step;
			} else {
				if (availableEnergy - BODYPART_COST[b] < 0) {
					return false;
				}
			}
			body.push(b);
			availableEnergy -= BODYPART_COST[b];
			return true;
		});

		/* Add body parts as in pattern */
		if (opt.pattern.length > 0) {
			while (body.length < 50 && count > 0) {
				if (availableEnergy) {
					if (
						availableEnergy -
							(BODYPART_COST[opt.pattern[index]] + BODYPART_COST[MOVE]) <
						0
					) {
						break;
					}
					if (moveIndex == 0) {
						body.push(MOVE);
						availableEnergy -= BODYPART_COST[MOVE];
					}
					moveIndex = (moveIndex + 1) % step;
					body.push(opt.pattern[index]);
					availableEnergy -= BODYPART_COST[opt.pattern[index]];
				} else {
					if (availableEnergy - BODYPART_COST[opt.pattern[index]] < 0) {
						break;
					}
					body.push(opt.pattern[index]);
					availableEnergy -= BODYPART_COST[opt.pattern[index]];
				}
				count--;
				index = (index + 1) % opt.pattern.length;
			}
		}
		return body.sort((a, b) => this.bodyPriority(b) - this.bodyPriority(a));
	}

	public static spawn(spawn: StructureSpawn, role: string) {
		const creepData = CreepManager.roles[role].creepInfo;
		const body = this.getBody(spawn.room, creepData.builder);
		const name = `${creepData.baseName}${_.random(0, 999999)}`;
		if (role === 'miner') {
			const sources = spawn.room.find(FIND_SOURCES);
			let memorySource = sources[0].id;
			const miners = spawn.room.find(FIND_MY_CREEPS, {
				filter: (creep) => {
					return creep.memory.role === 'miner';
				},
			});
			if (miners.length !== 0) {
				if (miners[0].memory.sourceID === memorySource) memorySource = sources[1].id;
			}
			spawn.spawnCreep(body, name, {
				memory: { spawnRoom: spawn.room.name, role: role, sourceID: memorySource },
			});
		} else if (role === 'warrior') {
			let memoryFlag = '';
			let warFlags: Flag[] = [];
			for (let i in Game.flags) {
				if (
					Game.flags[i].color === COLOR_RED &&
					Game.flags[i].secondaryColor === COLOR_RED
				) {
					warFlags.push(Game.flags[i]);
				}
			}
			for (let j in warFlags) {
				let count = 0;
				for (let i in Game.creeps) {
					if (
						Game.creeps[i].memory.spawnRoom === spawn.room.name &&
						Game.creeps[i].memory.role === role &&
						Game.creeps[i].memory.flagID === warFlags[j].name
					) {
						count++;
					}
				}
				if (count < parseInt(warFlags[j].name.split('_')[1])) {
					memoryFlag = warFlags[j].name;
					break;
				}
			}
			spawn.spawnCreep(body, name, {
				memory: { spawnRoom: spawn.room.name, role: role, flagID: memoryFlag },
			});
		} else if (role === 'scout') {
			let memoryFlag = '';
			let scoutFlags: Flag[] = [];
			for (let i in Game.flags) {
				if (
					Game.flags[i].color === COLOR_PURPLE &&
					Game.flags[i].secondaryColor === COLOR_WHITE
				) {
					scoutFlags.push(Game.flags[i]);
				}
			}
			for (let j in scoutFlags) {
				let count = 0;
				for (let i in Game.creeps) {
					if (
						Game.creeps[i].memory.spawnRoom === spawn.room.name &&
						Game.creeps[i].memory.role === role &&
						Game.creeps[i].memory.flagID === scoutFlags[j].name
					) {
						count++;
					}
				}
				if (count === 0) {
					memoryFlag = scoutFlags[j].name;
					break;
				}
			}
			spawn.spawnCreep(body, name, {
				memory: { spawnRoom: spawn.room.name, role: role, flagID: memoryFlag },
			});
		} else if (role === 'claimer' || role === 'remouteWorker') {
			const memoryRoom = tools.returnRoomByName(spawn.room.name);
			let targetRoom = '';
			for (let i in Memory.bot.rooms) {
				if (!Memory.bot.rooms[i].supply) continue;
				let count = 0;
				for (let j in Game.creeps) {
					if (
						Game.creeps[j].memory.spawnRoom === spawn.room.name &&
						Game.creeps[j].memory.role === role &&
						Game.creeps[j].memory.targetRoom === Memory.bot.rooms[i].supply!.name
					) {
						count++;
					}
				}
				if (Memory.bot.rooms[i].supply!.amountCreeps![role] > count) targetRoom = Memory.bot.rooms[i].supply!.name;
			}
			spawn.spawnCreep(body, name, {
				memory: { spawnRoom: spawn.room.name, role: role, targetRoom: targetRoom },
			});
		} else {
			spawn.spawnCreep(body, name, { memory: { spawnRoom: spawn.room.name, role: role } });
		}
	}
}

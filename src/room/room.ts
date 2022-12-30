import { CreepManager } from 'roles/manager';
import { tools } from 'tools/tools';
import { autobuild } from './autobuild';
import { RoomCalculator } from './roomCalculate';
import { RoomCollector } from './roomCollector';
import { SpawnController } from './spawn';
import { TowerController } from './tower';

class RemouteRoomController {
	private static room: Room;
	private static owner: Room;

	public static control(name: string, owner: Room) {
		this.room = Game.rooms[name];
		this.owner = owner;
	}
}

export class roomController {
	private static findExits(room: Room, c: ExitConstant): RoomPosition | null {
		const exits = room.find(c);
		if (exits.length > 0) {
			return _.sample(exits);
		} else {
			return null;
		}
	}

	private static setMemory(room: Room): RoomType {
		let memoryRoom = tools.returnRoomByName(room.name);
		if (Game.time % 16 === 15) {
			const newRoom: RoomType = {
				name: room.name,
				downgrade: false,
				queue: [],
			};
			if (!memoryRoom) {
				Memory.bot.rooms.push(newRoom);
				memoryRoom = newRoom;
			} else {
				tools.updateRoom(newRoom);
			}
		}
		Memory.stats.rooms[room.name] = {
			controllerProgress: Math.round(
				(room.controller!.progress / room.controller!.progressTotal) * 100
			),
			energyCapacity: room.energyAvailable,
			hostileCreeps: 0,
		};
		return memoryRoom;
	}

	private static roomLogic(room: Room) {
		RoomCollector.collect(room);
		RoomCalculator.calculate(room.name);
		
		const memoryRoom = this.setMemory(room);

		autobuild.runBuild(room);

		const controller = room.controller;

		let downgradeMax = 0;
		if (controller?.level === 1) downgradeMax = 20000;
		else if (controller?.level === 2) downgradeMax = 10000;
		else if (controller?.level === 3) downgradeMax = 20000;
		else if (controller?.level === 4) downgradeMax = 40000;
		else if (controller?.level === 5) downgradeMax = 80000;
		else if (controller?.level === 6) downgradeMax = 120000;
		else if (controller?.level === 7) downgradeMax = 150000;
		else if (controller?.level === 8) downgradeMax = 200000;

		const downgrade = Math.floor((room.controller!.ticksToDowngrade / downgradeMax) * 100);
		if (downgrade < 30 && controller!.level > 1) memoryRoom.downgrade = true;

		/* Run spawn code */
		const spawns = room.find(FIND_MY_SPAWNS);
		_.forEach(spawns, (spawn) => {
			if (!spawn.spawning) {
				const role = RoomCalculator.queue[room.name].shift();;
				if (role) {
					SpawnController.spawn(spawn, role);
				}
			}
		});

		/* Run tower code */
		const towers = room.find(FIND_STRUCTURES, {
			filter: (s) => {
				return s.structureType === 'tower';
			},
		});
		_.forEach(towers, (tower: StructureTower) => {
			TowerController.control(tower);
		});

		tools.updateRoom(memoryRoom);
	}

	public static getMyActiveRooms() {
		const allRooms = Game.rooms;
		let myRooms: Room[] = [];
		for (let i in allRooms) {
			if (
				allRooms[i].controller != null &&
				allRooms[i].controller?.my === true &&
				allRooms[i].controller?.level != undefined
			)
				myRooms.push(allRooms[i]);
		}
		return myRooms;
	}

	public static checkAllRooms() {
		const myRooms = this.getMyActiveRooms();

		for (let i in myRooms) {
			this.roomLogic(myRooms[i]);
		}
	}
}

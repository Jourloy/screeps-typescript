import { memory } from 'memory/memory';
import { CreepManager } from 'roles/manager';
import { roomController } from 'room/room';
import { Traveler } from 'imports/Traveler';
import { Doings } from 'prototypes/creep';
import { Profiler } from 'imports/Profile';

export const loop = () => {
	Traveler;
	Doings;

	memory.set();
	roomController.checkAllRooms();
	CreepManager.run();

	Memory.stats.cpuUsed = Game.cpu.getUsed();
};

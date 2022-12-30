export class memory {
	private static clear() {
		for (var name in Memory.creeps) {
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];
			}
		}
	}

	public static set() {
        this.clear();
        
		if (!Memory.AutobuildingInfo) {
			Memory.AutobuildingInfo = {};
		}
		if (!Memory.bot) {
			Memory.bot = {
				rooms: [],
			};
		}
		if (!Memory.sign) {
			Memory.sign = 'VIKINGS';
		}
		if (!Memory.remouteRooms) {
			Memory.remouteRooms = {};
		}
		Memory.stats = {
			cpuUsed: 0,
			amountCreeps: 0,
			rooms: {},
		};
	}
}

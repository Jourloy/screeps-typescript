export class Doings {
	public static findRepair(creep: Creep): AnyStructure[] {
		const repairStructures = creep.room.find(FIND_STRUCTURES, {
			filter: (str) => {
				if (str.structureType === 'constructedWall') {
                    if (str.room.controller?.level === 1) return str.hits < 500;
                    if (str.room.controller?.level === 2) return str.hits < 10000;
                    if (str.room.controller?.level === 3) return str.hits < 300000;
                    if (str.room.controller?.level === 4) return str.hits < 750000;
                    if (str.room.controller?.level === 5) return str.hits < 1500000;
                    if (str.room.controller?.level === 6) return str.hits < 2500000;
                    if (str.room.controller?.level === 7) return str.hits < 3000000;
                    if (str.room.controller?.level === 8) return str.hits < 4000000;
                    return false;
                }
				else if (str.structureType === 'rampart') {
                    if (str.room.controller?.level === 1) return str.hits < 500;
                    if (str.room.controller?.level === 2) return str.hits < 50000;
                    if (str.room.controller?.level! >= 3) return str.hits < 1000000;
                    return false;
                }
				else return str.hits < str.hitsMax;
			},
		});
		repairStructures.sort((a, b) => {
			if (a.structureType === 'rampart') return -1000000000 - (a.hits - a.hitsMax);
			if (a.structureType === 'container') return -900000000 - (a.hits - a.hitsMax);
			if (a.structureType === 'road') return -80000000 - (a.hits - a.hitsMax);
			if (a.structureType === 'constructedWall') return -7000000 - (a.hits - a.hitsMax);
			return 0;
		});

		return repairStructures;
	}
}

Creep.prototype.findRepair = function () {
	return Doings.findRepair(this);
};

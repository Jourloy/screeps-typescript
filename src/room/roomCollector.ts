export class RoomCollector {
	public static info: RoomInfo = {};

	public static collect(room: Room) {
		this.set(room.name);
		
        this.findAllStructures(room);
        this.findRuins(room);
        this.findConstructionSites(room);
		this.findSources(room);

        this.findStoreStructures(room.name);
        this.findRepairStructures(room.name);
        this.findStorage(room.name);
		this.findController(room.name);
	}

	private static set(name: string) {
		this.info[name] = {
			allStructures: [],
			constructionsAll: [],
			constructions: [],
			repairAll: [],
			repair: [],
			sources: [],
			energyStoreAll: [],
			energyStore: [],
			ruins: [],
		};
	}

	private static findAllStructures(room: Room) {
		let structures = room.find(FIND_STRUCTURES);
		this.info[room.name].allStructures = structures;
	}

    private static findRuins(room: Room) {
        let ruins = room.find(FIND_RUINS, { filter: (r) => r.store[RESOURCE_ENERGY] > 0 });
		ruins = ruins.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
		this.info[room.name].ruins = ruins;
    }

	private static findConstructionSites(room: Room) {
		const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
		constructionSites.sort((a, b) => a.progressTotal - b.progressTotal);
		this.info[room.name].constructionsAll = constructionSites;
		const constructions: ConstructionSite[] = [];
		_.forEach(constructionSites, (c) => {
			if (c.structureType !== 'rampart') constructions.push(c);
		});
		this.info[room.name].constructions = constructions;
	}

	private static findSources(room: Room) {
		const sources = room.find(FIND_SOURCES);
		this.info[room.name].sources = sources;
	}

	private static findStoreStructures(name: string) {
		const structures = this.info[name].allStructures;

		const energyStoreAll = structures.filter((structure) => {
			return (
				(structure.structureType == STRUCTURE_EXTENSION ||
					structure.structureType == STRUCTURE_SPAWN ||
					structure.structureType == STRUCTURE_TOWER) &&
				structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			);
		});
		this.info[name].energyStoreAll = energyStoreAll;
		const energyStore = energyStoreAll.filter((strc) => strc.structureType !== 'tower');
		this.info[name].energyStore = energyStore;
	}

	private static findRepairStructures(name: string) {
		const structures = this.info[name].allStructures;

		const repairStructures = structures.filter((str) => {
			if (str.structureType === 'constructedWall') {
				return false;
			} else if (str.structureType === 'rampart') {
				if (str.room.controller?.level === 1) return str.hits < 500;
				if (str.room.controller?.level === 2) return str.hits < 50000;
				if (str.room.controller?.level! >= 3) return str.hits < 100000;
				return false;
			} else return str.hits < str.hitsMax;
		});
		repairStructures.sort((a, b) => a.hits - b.hits);
		this.info[name].repair = repairStructures;
	}

	private static findStorage(name: string) {
		const structures = this.info[name].allStructures;
		const storage = structures.filter((str): str is StructureStorage => {
			if (str.structureType === 'storage') {
				return true;
			} else return false;
		});
		this.info[name].storage = storage[0];
	}

	private static findController(name: string) {
		const structures = this.info[name].allStructures;
		const controller = structures.filter((str): str is StructureController => {
			if (str.structureType === 'controller') {
				return true;
			}
			return false;
		});
		this.info[name].controller = controller[0];
	}
}

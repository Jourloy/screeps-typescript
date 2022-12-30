export class Claimer {
	public static creepInfo: CreepInfo = {
		role: 'claimer',
		baseName: 'c|p [VIKING]',
		builder: {
			pattern: [],
            mustBe: [CLAIM],
		},
	};

	public static run(creep: Creep) {
		if (creep.room.name !== creep.memory.targetRoom) {
            const exitD = creep.room.findExitTo(creep.memory.targetRoom!);
            if (exitD !== -2 && exitD !== -10) {
                const exit = _.sample(creep.room.find(exitD));
                creep.travelTo(exit);
            }
        } else {
            if (creep.reserveController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller!)
            }
        }
	}
}

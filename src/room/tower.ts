export class TowerController {
    public static control(tower: StructureTower) {
        const enemyCreeps = tower.room.find(FIND_HOSTILE_CREEPS);
        Memory.stats.rooms[tower.room.name].hostileCreeps = enemyCreeps.length;
        if (enemyCreeps.length > 0) {
            tower.attack(enemyCreeps[0])
        } else {
            const structures = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: s => {
                    return (s.structureType === 'rampart' && s.hits < 1000);
                }
            });
            if (structures && tower.store.energy > 300) {
                tower.repair(structures);
            }
        }
    }
}
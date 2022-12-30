/**
 * How to add creep
 * 
 * 1. Create file with role creep
 * 2. Class must contain `public static run() {}` and `public static creepInfo = {}`
 * 3. Place role and class in `roles` below
 */

import { builder } from "./builder";
import { Dismantler } from "./dismantler";
import { Helper } from "./helper";
import { miner } from "./miner";
import { Claimer } from "./remoute/claimer";
import { RemouteWorker } from "./remoute/remouteWorker";
import { repairer } from "./repairer";
import { scout } from "./scout";
import { transporter } from "./transporter";
import { Upgrader } from "./upgrader";
import { Warrior } from "./warrior";
import { worker } from "./worker";

export class CreepManager {

    public static roles: RolesContainer = {
        'builder': builder,
        'miner': miner,
        'repairer': repairer,
        'scout': scout,
        'transporter': transporter,
        'upgrader': Upgrader,
        'warrior': Warrior,
        'worker': worker,
        'claimer': Claimer,
        'remoute_worker': RemouteWorker,
        'helper': Helper,
        'dismantler': Dismantler,
    }

    /** 
     * Run code of all creeps
     */
    public static run() {
        let count = 0;
        for (let i in Game.creeps) {
            const creep = Game.creeps[i];
            this.roles[creep.memory.role].run(creep);
            count++;
        }
        Memory.stats.amountCreeps = count;
    }
}
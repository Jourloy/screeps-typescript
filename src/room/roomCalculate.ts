import { CreepManager } from 'roles/manager';
import { tools } from 'tools/tools';
import { RoomCollector } from './roomCollector';

export class RoomCalculator {
	public static creeps: RoomCreeps = {};
	public static queue: RoomQueue = {};

	public static calculate(name: string) {
		this.set(name);

		const info = RoomCollector.info[name];

		let cr: { [name: string]: number } = {};

		if (info.controller) {
			switch (info.controller.level) {
				case 1:
					cr = this.rcl1(name, info);
					break;
				case 2:
					cr = this.rcl2(name, info);
					break;
				case 3:
					cr = this.rcl3(name, info);
					break;
				case 4:
					cr = this.rcl4(name, info);
					break;
				case 5:
					cr = this.rcl5(name, info);
					break;
				case 6:
					cr = this.rcl6(name, info);
					break;
				case 7:
					cr = this.rcl7(name, info);
					break;
				case 8:
					cr = this.rcl8(name, info);
					break;
			}
		} else return;

        if (this.colonyDie(name)) {
            cr['worker'] = 5;
        }

		const nowLive = this.nowLive(name);

        this.queue[name] = [];

		for (let i in cr) {
			if (cr[i] - nowLive[i] > 0) {
				for(let j = 0; j < cr[i] - nowLive[i]; j++) {
                    this.queue[name].push(i);
                }
			}
		}

        this.queue[name] = this.queue[name].sort((a, b) => this.rolePriority(b) - this.rolePriority(a));
	}

    private static colonyDie(name: string) {
        const c = this.nowLive(name);

        if ((c['transporter'] === 0 || c['miner'] === 0) && (c['helper'] === 0 || c['worker'] === 0)) {
            return true;
        }

        return false;
    }

    private static rolePriority(role: string): number {
		switch (role) {
			case 'worker':
				return 1000;
			case 'helper':
				return 900;
			case 'miner':
				return 800;
			case 'transporter':
				return 700;
			default:
				return 0;
		}
	}

	private static set(name: string) {
        if (!this.creeps[name]) {
            this.creeps[name] = {};
        }

        if (!this.queue[name]) {
            this.queue[name] = [];
        }

		for (let i in CreepManager.roles) {
			const creep = CreepManager.roles[i];
			this.creeps[name][creep.creepInfo.role] = 0;
		}
	}

	private static nowLive(name: string) {
		const c: any = {};
		for (let i in this.creeps[name]) {
			c[i] = tools.amountCreeps(name, i);
		}
		return c;
	}

	private static rcl1(name: string, info: RoomInfo[string]) {
		const cr: { [name: string]: number } = {
			worker: 10,
			helper: 5,
		};
		return cr;
	}

	private static rcl2(name: string, info: RoomInfo[string]) {
        const cr: { [name: string]: number } = {
			worker: 20,
			helper: 10,
            builder: 2,
            repairer: 2,
		};
		return cr;
    }

	private static rcl3(name: string, info: RoomInfo[string]) {
        const cr: { [name: string]: number } = {
			builder: 2,
			repairer: 2,
            miner: info.sources.length,
            transporter: info.sources.length,
            upgrader: 2,
            worker: 2,
		};
		return cr;
    }

	private static rcl4(name: string, info: RoomInfo[string]) {
        const cr: { [name: string]: number } = {
			builder: 2,
			repairer: 2,
            miner: info.sources.length,
            transporter: info.sources.length,
            upgrader: 2
		};

        if (info.storage) {
            if (info.storage.store[RESOURCE_ENERGY] > 5000) {
                cr['upgrader'] += 3;
            }
        }

		return cr;
    }

	private static rcl5(name: string, info: RoomInfo[string]) {
        const cr: { [name: string]: number } = {
			builder: 2,
			repairer: 2,
            miner: info.sources.length,
            transporter: info.sources.length,
            upgrader: 2
		};

        if (info.storage) {
            if (info.storage.store[RESOURCE_ENERGY] > 5000) {
                cr['upgrader'] += 3;
            }
        }
		return cr;
    }

	private static rcl6(name: string, info: RoomInfo[string]) {
        const cr: { [name: string]: number } = {
			builder: 2,
			repairer: 2,
            miner: info.sources.length,
            transporter: info.sources.length,
            upgrader: 2
		};

        if (info.storage) {
            if (info.storage.store[RESOURCE_ENERGY] > 5000) {
                cr['upgrader'] += 3;
            }
        }
		return cr;
    }

	private static rcl7(name: string, info: RoomInfo[string]) {
        const cr: { [name: string]: number } = {
			builder: 2,
			repairer: 2,
            miner: info.sources.length,
            transporter: info.sources.length,
            upgrader: 2
		};

        if (info.storage) {
            if (info.storage.store[RESOURCE_ENERGY] > 5000) {
                cr['upgrader'] += 3;
            }
        }
		return cr;
    }

	private static rcl8(name: string, info: RoomInfo[string]) {
        const cr: { [name: string]: number } = {
			builder: 2,
			repairer: 2,
            miner: info.sources.length,
            transporter: info.sources.length,
            upgrader: 2
		};

        if (info.storage) {
            if (info.storage.store[RESOURCE_ENERGY] > 5000) {
                cr['upgrader'] += 3;
            }
        }
		return cr;
    }
}
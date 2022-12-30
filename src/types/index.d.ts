/* <----------- GENERAL -----------> */

interface Console {
    _err: (text: string) => void;
    _warn: (text: string) => void;
    _log: (text: string) => void;
}

/* <----------- MY -----------> */

interface RoomType {
    name: string;
    queue: string[];
    downgrade: boolean;
    autobuid?: {
        finish: boolean;
        top?: number;
        left?: number;
        right?: number;
        bottom?: number;
    },
    supply?: {
        name: string;
        enemy: boolean;
        sources: number;
        amountCreeps: {
            [role: string]: number;
        },
    }
}

interface RoomCreeps {
    [name: string]: {
        [role: string]: number;
    }
}

interface RoomQueue {
    [name: string]: string[];
}

interface RoomInfo {
    [name: string]: {
        allStructures: AnyStructure[];
        constructionsAll: ConstructionSite[];
        constructions: ConstructionSite[];
        repairAll: AnyStructure[];
        repair: AnyStructure[];
        energyStoreAll: AnyStructure[];
        energyStore: AnyStructure[];
        sources: Source[];
        ruins: Ruin[];
        storage?: StructureStorage;
        controller?: StructureController;
        downgrade?: boolean;
    }
}

interface SupplyRoom {
    name: string;
    enemy: boolean;
    sources: number;
    amountCreeps?: {
        [role: string]: number;
    }
}

interface CreepBuilder {
    /** Body pattern, will be insert in result body */
    pattern: BodyPartConstant[];
    /** Maximum of body parts */
    count?: number;
    /** This body parts must be in body, but not need repeat */
    mustBe?: BodyPartConstant[];
    /** Maximum energy for use on spawn */
    maxEnergy?: number;
    /** Remove all move parts */
    withoutMove?: boolean;
    /** Don't calculate carry parts for move */
    skipCarry?: boolean;
    /** Use less move parts */
    isForRoad?: boolean;
}

interface CreepInfo {
    role: string;
    baseName: string;
    builder: CreepBuilder;
}

interface CreepClass {
    run(creep: Creep): void;
    creepInfo: CreepInfo;
}

interface RolesContainer {
    [name: string]: CreepClass;
}

interface BunkerPositions {
    RCL: {
        [level: number]: {
            [name: string]: {
                pos: {x: number, y: number}[];
            }
        }
    },
    rampart: {
        pos: {x: number, y: number}[];
    }
}

interface AmountStructures {
    spawns?: number;
    extensions?: number;
    towers?: number;
    storage?: number;
    terminal?: number;
}

/* <----------- SCREEPS -----------> */

interface Creep {
    travelTo(destination: HasPos|RoomPosition, ops?: TravelToOptions): number;
    findRepair(): AnyStructure[];
}

interface Memory {
    empire?: any;
    bot: {
        rooms: RoomType[];
    }
    AutobuildingInfo: any;
    sign?: string;
    remouteRooms: {
        [name: string]: number;
    }
    stats: {
        cpuUsed: number;
        amountCreeps: number;
        rooms: {
            [name: string]: {
                controllerProgress: number;
                energyCapacity: number;
                hostileCreeps: number;
            }
        }
    }
}

interface CreepMemory {
    state?: {
        empty?: boolean;
        busy?: boolean;
    };
    sourceID?: Id<any>;
    flagID?: string;
    storeID?: Id<any> | null;
    spawnRoom: string;
    targetRoom?: string;
    role: string;
    busy?: {
        id: Id<any> | null;
        type: StructureConstant | 'constructionSite' | null;
        aim: 'build' | 'repair' | 'dismantle' | null;
    }
}

interface RoomMemory {
    avoid?: any;
}

/* <----------- TRAVELER -----------> */

interface PathfinderReturn {
    path: RoomPosition[];
    ops: number;
    cost: number;
    incomplete: boolean;
}

interface TravelToReturnData {
    nextPos?: RoomPosition;
    pathfinderReturn?: PathfinderReturn;
    state?: TravelState;
    path?: string;
}

interface TravelToOptions {
    ignoreRoads?: boolean;
    ignoreCreeps?: boolean;
    ignoreStructures?: boolean;
    preferHighway?: boolean;
    highwayBias?: number;
    allowHostile?: boolean;
    allowSK?: boolean;
    range?: number;
    obstacles?: {pos: RoomPosition}[];
    roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
    routeCallback?: (roomName: string) => number;
    returnData?: TravelToReturnData;
    restrictDistance?: number;
    useFindRoute?: boolean;
    maxOps?: number;
    movingTarget?: boolean;
    freshMatrix?: boolean;
    offRoad?: boolean;
    stuckValue?: number;
    maxRooms?: number;
    repath?: number;
    route?: {[roomName: string]: boolean};
    ensurePath?: boolean;
}

interface TravelData {
    state: any[];
    path: string;
}

interface TravelState {
    stuckCount: number;
    lastCoord: Coord;
    destination: RoomPosition;
    cpu: number;
}

type Coord = {x: number, y: number};
type HasPos = {pos: RoomPosition}
import OperatingSystem from '../lib/OperatingSystem';

export default interface Process {
    id: string,
    callback: Function,
    pid?: number,
}

export type StationStoreType = {
    os: null | OperatingSystem,
    cpu: null | IProcessorType,
    memory: null | IMemoryType,
    storage: IStorageType[],
    frame: number,
    count: number,
    exponent: number,
    isRunning: Boolean,
    callback: (frame: number, count: number, exponent: number) => void,
    toggleGameLoop: () => void,
};

export type MenuStateType = {
    open: boolean,
    toggle: () => void,
};

export enum ProcessorArchitecture {
    risc32 = 'risc32',
    risc64 = 'risc64',
    sca32 = 'sca32',
    sca64 = 'sca64',
    mca32 = 'mca32',
    mca64 = 'mca64',
};

export enum MemoryType {
    sdram = 'SDRAM',
    ddr = 'DDR',
    ddr2 = 'DDR-2',
    ddr3 = 'DDR-3',
    ddr4 = 'DDR-4',
    ddr5 = 'DDR-5',
};

export enum StorageType {
    hdd = 'hdd',
    ssd = 'ssd',
    nvme = 'nvme',
    tape = 'tape',
    floppy = 'floppy',
    optical = 'optical',
    fiberChannel = 'Fiber Channel',
};

export interface IProcessorType {
    flops: number;
    cores: number;
    manufacturer: string;
    model: string;
    speed: string;
    architecture: ProcessorArchitecture;
    toString: () => string;
};

export interface IMemoryType {
    capacity: number;
    speed: string;
    type: MemoryType;
    manufacturer: string;
    model: string;
    toString: () => string;
};

export interface IStorageType {
    capacity: number;
    speed: string;
    type: StorageType;
    manufacturer: string;
    model: string;
    toString: () => string;
}
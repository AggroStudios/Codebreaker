import { ScreenGlowType } from '../components/ScreenGlow';
import { Networking } from '../lib/network';
import OperatingSystem from '../lib/OperatingSystem';

export enum NetworkConnectionType {
    dsl = 'DSL',
    cable = 'Cable',
    fiber = 'Fiber',
    cellular = 'Cellular',
    satellite = 'Satellite',
}

export interface INetworkType {
    connectionType: NetworkConnectionType;
    speedInBps: number;
    toString: () => string;
}

export default interface Process {
    id: string;
    callback: (...args: unknown[]) => unknown;
    pid?: number;
    cores?: number;
    memoryRequired?: number;
    paused?: boolean;
    percentUse?: number;
    size?: number;
}

export type StationStoreType = {
    os: null | OperatingSystem;
    cpu: null | IProcessorType;
    memory: null | IMemoryType;
    storage: IStorageType[];
    network: null | Networking;
    frame: number;
    count: number;
    exponent: number;
    isRunning: boolean;
    setRunning: (running: boolean) => void;
    callback: (frame: number, count: number, exponent: number) => void;
    cpuActivity: { x: number; y: number }[];
    setCpuActivity: (cpuActivity: { x: number; y: number }[]) => void;
    setNetwork: (network: Networking) => void;
    setProcessor: (cpu: IProcessorType) => void;
    reset: () => void;
    glowActive: boolean;
    setGlowActive: (active: boolean) => void;
    glowType: ScreenGlowType;
    setGlowType: (type: ScreenGlowType) => void;
};

export type MenuStateType = {
    open: boolean;
    toggle: () => void;
};

export enum ProcessorArchitecture {
    risc32 = 'risc32',
    risc64 = 'risc64',
    sca32 = 'sca32',
    sca64 = 'sca64',
    mca32 = 'mca32',
    mca64 = 'mca64',
}

export enum MemoryType {
    sdram = 'SDRAM',
    ddr = 'DDR',
    ddr2 = 'DDR-2',
    ddr3 = 'DDR-3',
    ddr4 = 'DDR-4',
    ddr5 = 'DDR-5',
}

export enum StorageType {
    hdd = 'hdd',
    ssd = 'ssd',
    nvme = 'nvme',
    tape = 'tape',
    floppy = 'floppy',
    optical = 'optical',
    fiberChannel = 'Fiber Channel',
}

export interface IProcessorType {
    gigaflops: number;
    cores: number;
    manufacturer: string;
    model: string;
    speed: string;
    architecture: ProcessorArchitecture;
    toString: () => string;
}

export interface IMemoryType {
    capacity: number;
    speed: string;
    type: MemoryType;
    manufacturer: string;
    model: string;
    toString: () => string;
}

export interface IStorageType {
    capacity: number;
    speed: string;
    type: StorageType;
    manufacturer: string;
    model: string;
    toString: () => string;
}
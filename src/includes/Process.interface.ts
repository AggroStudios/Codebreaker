import OperatingSystem from '../lib/OperatingSystem';

export default interface Process {
    id: string,
    callback: Function,
    pid?: number,
}

export type StationStoreType = {
    os: null | OperatingSystem,
    cpu: null | IProcessorType,
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

export interface IProcessorType {
    flops: number;
    cores: number;
    manufacturer: string;
    model: string;
    speed: string;
    architecture: ProcessorArchitecture;
    toString: () => string;
};
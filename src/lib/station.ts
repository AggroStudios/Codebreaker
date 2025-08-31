import { IMemoryType, IProcessorType, IStorageType } from "../includes/Process.interface";
import OperatingSystem from "./OperatingSystem";

export class Station {

    private _processor: IProcessorType;
    private _operatingSystem: OperatingSystem;
    private _memory: IMemoryType;
    private _storage: IStorageType[];

    constructor(processor: IProcessorType, operatingSystem: OperatingSystem, memory: IMemoryType, storage: IStorageType[] = []) {
        this._processor = processor;
        this._operatingSystem = operatingSystem;
        this._memory = memory;
        this._storage = storage;
    }

    public get processor() {
        return this._processor;
    }

    public get operatingSystem() {
        return this._operatingSystem;
    }

    public get memory() {
        return this._memory;
    }

    public get storage() {
        return this._storage;
    }
}
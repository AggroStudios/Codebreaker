import { IProcessorType } from "../includes/Process.interface";
import OperatingSystem from "./OperatingSystem";

export class Station {

    private _processor: IProcessorType;
    private _operatingSystem: OperatingSystem;

    constructor(processor: IProcessorType, operatingSystem: OperatingSystem) {
        this._processor = processor;
        this._operatingSystem = operatingSystem;
    }

    public get processor() {
        return this._processor;
    }

    public get operatingSystem() {
        return this._operatingSystem;
    }
}
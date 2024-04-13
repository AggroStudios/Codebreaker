import { IProcessorType, ProcessorArchitecture } from "../includes/Process.interface";

export class CodiumProcessor implements IProcessorType {
    flops: number = 1000000000;
    cores: number = 4;
    manufacturer: string = 'Codium';
    model: string = 'Codium 1';
    speed: string = '3.2 GHz';
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc32;

    toString() {
        return `${this.manufacturer} ${this.model} ${this.speed} (${this.architecture})`;
    }
}
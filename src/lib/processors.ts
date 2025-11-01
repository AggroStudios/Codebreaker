import { IProcessorType, ProcessorArchitecture } from "../includes/Process.interface";

export class CodiumProcessor implements IProcessorType {
    flops: number = 1000000000;
    cores: number = 4;
    manufacturer: string = 'Codium';
    model: string = 'Brkr 1';
    speed: string = '3.2 GHz';
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc32;

    toString() {
        return `${this.manufacturer} ${this.model} (${this.architecture}) - ${this.cores} cores @ ${this.speed}`;
    }
}

export class CodiumProcessor64 extends CodiumProcessor {
    flops: number = 1300000000;
    model: string = 'Brkr64 1';
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc64;
}
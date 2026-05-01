import {
    IProcessorType,
    ProcessorArchitecture,
} from '../includes/Process.interface';

export class CodiumProcessor implements IProcessorType {
    gigaflops: number = 1;
    cores: number = 4;
    manufacturer: string = 'Codium';
    model: string = 'Brkr 1';
    speed: string = '3.2 GHz';
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc32;

    toString() {
        return `${this.manufacturer} ${this.model} (${this.architecture})`;
    }
}

export class CodiumProcessor64 extends CodiumProcessor {
    gigaflops: number = 2;
    model: string = 'Brkr64 1';
    cores: number = 6;
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc64;
}

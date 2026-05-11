import {
    IProcessorType,
    ProcessorArchitecture,
} from '../includes/Process.interface';

export class CodiumProcessor implements IProcessorType {
    gigaflops: number = 1;
    cores: number = 4;
    manufacturer: string = 'Codium';
    model: string = 'Brkr 1';
    speed: string = '2.6 GHz';
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc32;

    toString() {
        return `${this.manufacturer} ${this.model} (${this.architecture})`;
    }
}

export class CodiumProcessor64 extends CodiumProcessor {
    gigaflops: number = 2;
    model: string = 'Brkr64 1';
    speed: string = '3.4 GHz';
    cores: number = 6;
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc64;
}

export class CodiumProcessorX8 extends CodiumProcessor {
    gigaflops: number = 3.6;
    model: string = 'X8';
    speed: string = '4.2 GHz';
    cores: number = 8;
    architecture: ProcessorArchitecture = ProcessorArchitecture.risc64;
}

export class CodiumProcessorQuantum1 extends CodiumProcessor {
    gigaflops: number = 1.8;
    model: string = 'Quantum-1';
    speed: string = '5.0 GHz';
    cores: number = 16;
    architecture: ProcessorArchitecture = ProcessorArchitecture.quantum;
}

export class CodiumProcessorQuantumX extends CodiumProcessorQuantum1 {
    gigaflops: number = 4;
    model: string = 'Quantum-X';
    speed: string = 'Coherent Qubits';
    cores: number = 40;
}

export class CodiumProcessorSingularity extends CodiumProcessorQuantum1 {
    gigaflops: number = 9.6;
    model: string = 'Singularity';
    speed: string = 'Singularity Core';
    cores: number = 96;
    architecture: ProcessorArchitecture = ProcessorArchitecture.singularity;
}
import { IMemoryType, MemoryType } from "../includes/Process.interface";

export class CodiumMemory implements IMemoryType {
    capacity: number = 16;
    speed: string = '3200 MHz';
    type: MemoryType = MemoryType.ddr4;
    manufacturer: string = 'Codium';
    model: string = 'Codium 1';

    toString() {
        return `${this.manufacturer} ${this.model} ${this.capacity}GB ${this.speed} (${this.type})`;
    }
}

export class CodiumMemory32 extends CodiumMemory {
    capacity: number = 32;
    model: string = 'Codium 32';
}

export class CodiumMemory64 extends CodiumMemory {
    capacity: number = 64;
    model: string = 'Codium 64';
}
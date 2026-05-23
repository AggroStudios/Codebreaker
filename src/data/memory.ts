import { IMemoryType, MemoryType } from '../includes/Process.interface';

export class CodiumMemory implements IMemoryType {
    capacity: number = 16;
    speed: string = '3200 MHz';
    type: MemoryType = MemoryType.ddr4;
    manufacturer: string = 'Codium';
    model: string = 'Mem16';
    maxConcurrentBreaks: number = 2;

    toString() {
        return `${this.manufacturer} ${this.model} ${this.capacity}GB ${this.speed} (${this.type})`;
    }
}

export class CodiumMemory32 extends CodiumMemory {
    capacity: number = 32;
    model: string = 'Mem32';
    maxConcurrentBreaks: number = 3;
}

export class CodiumMemory64 extends CodiumMemory {
    capacity: number = 64;
    type: MemoryType = MemoryType.ddr5;
    model: string = 'Mem64';
    maxConcurrentBreaks: number = 4;
}

export class CodiumMemory128 extends CodiumMemory64 {
    capacity: number = 128;
    model: string = 'Mem128';
    maxConcurrentBreaks: number = 6;
}

export class CodiumMemory256 extends CodiumMemory64 {
    capacity: number = 256;
    model: string = 'Mem256';
    type: MemoryType = MemoryType.nonVolatile;
    maxConcurrentBreaks: number = 8;
}

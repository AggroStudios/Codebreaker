import { IStorageType, StorageType } from "../includes/Process.interface";

export class CodiumStorage implements IStorageType {
    capacity: number = 512;
    speed: string = '6 Gbps';
    type: StorageType = StorageType.ssd;
    manufacturer: string = 'Codium';
    model: string = 'Codium 1';

    toString() {
        return `${this.manufacturer} ${this.model} ${this.capacity}GB ${this.speed} (${this.type})`;
    }
}

export class CodiumStorage2 extends CodiumStorage {
    capacity: number = 1024;
    model: string = 'Codium 2';
}

export class CodiumStorage3 extends CodiumStorage {
    capacity: number = 2048;
    model: string = 'Codium 3';
}

export class CodiumStorageHdd extends CodiumStorage {
    capacity: number = 512;
    speed: string = '3 Gbps';
    type: StorageType = StorageType.hdd;
    model: string = 'Codium 1 HDD';
}
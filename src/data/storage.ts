import { IStorageType, StorageType } from '../includes/Process.interface';

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

export class CodiumStorage1TB extends CodiumStorage {
    capacity: number = 1024;
    speed: string = '10 Gbps';
    type: StorageType = StorageType.nvme;
    model: string = 'Codium 1TB';
}

export class CodiumStorage2TB extends CodiumStorage1TB {
    capacity: number = 2048;
}

export class CodiumStorage4TB extends CodiumStorage1TB {
    capacity: number = 4096;
    model: string = 'Codium 4TB';
}

export class CodiumStorage8TB extends CodiumStorage1TB {
    capacity: number = 8192;
    model: string = 'Codium 8TB';
}

export class CodiumStorageHdd extends CodiumStorage {
    capacity: number = 512;
    speed: string = '3 Gbps';
    type: StorageType = StorageType.hdd;
    model: string = 'Codium 1 HDD';
}

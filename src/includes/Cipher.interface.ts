import Cipher from '../lib/Cipher';
import { ProcessorArchitecture } from './Process.interface';

export enum CipherState {
    IDLE = 'Idle',
    DOWNLOADING = 'Downloading',
    BREAKING = 'Breaking',
    SUCCESS = 'Success',
    CANCELLED = 'Cancelled',
    FAILURE = 'Failure',
    PAUSED = 'Paused',
}

export type CipherProps = {
    state: CipherState;
    progress: number;
};

export enum BlockUnit {
    bytes = 'B',
    kilobytes = 'KB',
    megabytes = 'MB',
    gigabytes = 'GB',
    terabytes = 'TB',
    petabytes = 'PB',
}

export interface ICipherType {
    name: string;
    complexity: number;
    parallelism: number;
    memoryRequired: number;
    block: {
        size: number;
        unit: BlockUnit;
    };
    payout: number;
    xp: number;
    requiredArchitecture: ProcessorArchitecture[];
}

export interface CipherEntry {
    cipher?: Cipher;
    progress: number;
    type?: ICipherType;
    state?: CipherState;
    autoCipher: boolean;
}

export interface CipherBreakState {
    entries: Record<string, CipherEntry>;
    update: (id: string, partial: Partial<CipherEntry>) => void;
    removeEntry: (id: string) => void;
}

export const CipherTypes: ICipherType[] = [
    {
        name: 'Cipher 1',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.megabytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32],
    },
    {
        name: 'Cipher 2',
        complexity: 1.8,
        parallelism: 2,
        memoryRequired: 2048,
        block: {
            size: 2048,
            unit: BlockUnit.megabytes,
        },
        payout: 200,
        xp: 12,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'Cipher 3',
        complexity: 2.5,
        parallelism: 3,
        memoryRequired: 3072,
        block: {
            size: 3072,
            unit: BlockUnit.megabytes,
        },
        payout: 300,
        xp: 17,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'Cipher 4',
        complexity: 3.2,
        parallelism: 4,
        memoryRequired: 4096,
        block: {
            size: 4096,
            unit: BlockUnit.megabytes,
        },
        payout: 400,
        xp: 20,
        requiredArchitecture: [ProcessorArchitecture.risc64],
    },
];

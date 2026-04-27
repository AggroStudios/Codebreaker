import Cipher from '../lib/Cipher';

export enum CipherState {
    IDLE = 'Idle',
    DOWNLOADING = 'Download',
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
    block: {
        size: number;
        unit: BlockUnit;
    };
    payout: number;
    xp: number;
}

export interface IGridItem {
    character: string;
    cssClass: string;
}

export interface CipherEntry {
    cipher?: Cipher;
    grid: IGridItem[];
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
        block: {
            size: 1024,
            unit: BlockUnit.megabytes,
        },
        payout: 100,
        xp: 10,
    },
    {
        name: 'Cipher 2',
        complexity: 1.8,
        parallelism: 2,
        block: {
            size: 2048,
            unit: BlockUnit.megabytes,
        },
        payout: 200,
        xp: 12,
    },
    {
        name: 'Cipher 3',
        complexity: 2.5,
        parallelism: 3,
        block: {
            size: 3072,
            unit: BlockUnit.megabytes,
        },
        payout: 300,
        xp: 17,
    },
];

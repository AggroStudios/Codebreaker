export enum CipherState {
    IDLE,
    DOWNLOADING,
    BREAKING,
    SUCCESS,
    FAILURE,
    PAUSED,
};

export type CipherProps = {
    state: CipherState,
    progress: number,
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
        size: number,
        unit: BlockUnit
    };
    payout: number;
}

export const CipherTypes: ICipherType[] = [
    {
        name: 'Cipher 1',
        complexity: 1,
        parallelism: 1,
        block: {
            size: 1024,
            unit: BlockUnit.bytes,
        },
        payout: 100,
    },
    {
        name: 'Cipher 2',
        complexity: 2,
        parallelism: 2,
        block: {
            size: 2048,
            unit: BlockUnit.bytes,
        },
        payout: 200,
    },
    {
        name: 'Cipher 3',
        complexity: 3,
        parallelism: 3,
        block: {
            size: 3072,
            unit: BlockUnit.bytes,
        },
        payout: 300,
    },
];
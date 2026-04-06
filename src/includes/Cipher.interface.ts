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
}
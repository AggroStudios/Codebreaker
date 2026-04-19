import Cipher from "../lib/Cipher";

export enum CipherState {
    IDLE = undefined,
    DOWNLOADING = "Download",
    BREAKING = "Breaking",
    SUCCESS = "Success",
    CANCELLED = "Cancelled",
    FAILURE = "Failure",
    PAUSED = "Paused",
}

export type CipherProps = {
    state: CipherState;
    progress: number;
};

export enum BlockUnit {
    bytes = "B",
    kilobytes = "KB",
    megabytes = "MB",
    gigabytes = "GB",
    terabytes = "TB",
    petabytes = "PB",
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

export interface CipherBreakState {
    ciphers: Record<string, Cipher | undefined>;
    grids: Record<string, IGridItem[] | undefined>;
    progress: Record<string, number | undefined>;
    types: Record<string, ICipherType | undefined>;
    setCipher: (id: string, cipher: Cipher | undefined) => void;
    setGrid: (id: string, grid: IGridItem[]) => void;
    setProgress: (id: string, progress: number) => void;
    setType: (id: string, type: ICipherType) => void;
}

export const CipherTypes: ICipherType[] = [
    {
        name: "Cipher 1",
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
        name: "Cipher 2",
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
        name: "Cipher 3",
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

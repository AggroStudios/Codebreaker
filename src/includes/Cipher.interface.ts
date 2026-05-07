import Cipher from '../lib/Cipher';
import { ProcessorArchitecture } from './Process.interface';
import { MiniGameProps } from './minigame.interfaces';
import React from 'react';

export enum CipherState {
    IDLE = 'Idle',
    DOWNLOADING = 'Downloading',
    BREAKING = 'Breaking',
    SUCCESS = 'Success',
    CANCELLED = 'Cancelled',
    FAILURE = 'Failed',
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
    cipherTier?: string | null; // The tier ID of the auto-cipher upgrade that can break this cipher type.
    requiredArchitecture: ProcessorArchitecture[];
    manualMode?: React.ComponentType<MiniGameProps>[];
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

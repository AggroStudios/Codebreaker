import { ICipherType } from './Cipher.interface';

export interface IStatisticsCipher {
    cipher: ICipherType;
    success: number;
    failed: number;
}

export interface IStatistics {
    /** Epoch ms of the first run for this save. `0` means uninitialized. */
    startTime: number;
    totalPlayedTime: number;
    /** Keyed by cipher name. */
    totalCiphers: Record<string, IStatisticsCipher>;
    totalMoneyEarned: number;
    totalMoneySpent: number;
    /** Rolling window of recent income-rate samples (oldest -> newest). */
    incomeHistory: number[];
    totalBytesDownloaded: number;
}
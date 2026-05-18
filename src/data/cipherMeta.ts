import { CipherTypes } from './cipherList';
import { ICipherType } from '../includes/Cipher.interface';
import { ServerTier } from '../includes/Servers.interface';

/** Map a `ServerTier` enum value to its 1-based tier index. */
export const tierLevelFromEnum = (tier: ServerTier): number => {
    const order = Object.values(ServerTier) as ServerTier[];
    return order.indexOf(tier) + 1;
};

/** Workload cards shown in the Configure modal. */
export const WORKLOAD_CIPHERS: ICipherType[] = CipherTypes.filter((c) =>
    /^(CRC|MD5|SHA|AES|RSA)/.test(c.name),
);

interface CipherMeta {
    minTier: number;
    /** Multiplier on payout based on how well the server fits the workload. */
    fit: number;
}

const META: Record<string, CipherMeta> = {
    'CRC-32':   { minTier: 1, fit: 1.00 },
    'MD5':      { minTier: 1, fit: 0.95 },
    'SHA-1':    { minTier: 1, fit: 0.85 },
    'SHA-256':  { minTier: 2, fit: 0.75 },
    'AES-128':  { minTier: 2, fit: 0.65 },
    'AES-256':  { minTier: 3, fit: 0.55 },
    'RSA-1024': { minTier: 3, fit: 0.55 },
    'RSA-2048': { minTier: 3, fit: 0.50 },
};

const DEFAULT_META: CipherMeta = { minTier: 1, fit: 0.7 };

export const cipherMeta = (name: string): CipherMeta => META[name] ?? DEFAULT_META;

/** Catalog price-per-cycle helper: take the cipher's payout. */
export const cipherPayout = (cipher: ICipherType): number => cipher.payout;

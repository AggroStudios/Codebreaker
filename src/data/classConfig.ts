import { HackerClassId } from '../includes/Character.interface';

/**
 * Tweakable, gameplay-facing configuration for each operator class.
 *
 * This is the single source of truth for a class's accent color, starting
 * wallet, perk modifiers, and starting kit. `data/hackerClasses.ts` pulls its
 * accent/wallet from here (and keeps the prose/UI copy), while game systems can
 * read `perks`/`startingKit` to apply effects. Adjust values here to retune a
 * class without touching UI code.
 */

/** Named accent per class — Cipherwright green, The Operator blue, Phantom orange. */
export type ClassAccentName = 'green' | 'blue' | 'orange';

/** Numeric perk modifiers. Neutral values are `1` (multipliers) or `0` (additive). */
export interface ClassPerks {
    /** Cipher cycle speed multiplier (1.25 = +25% faster). */
    cipherSpeedMultiplier: number;
    /** Neural-net training XP multiplier (1.5 = +50%). */
    neuralNetXpMultiplier: number;
    /** Free cipher re-rolls granted at the start of a run. */
    freeCipherRerolls: number;
    /** Highest marketplace SKU tier unlocked from day one. */
    marketplaceTierUnlock: number;
    /** Marketplace (server) price multiplier (0.85 = −15%). */
    marketplacePriceMultiplier: number;
    /** Dark-web purchase price multiplier (0.75 = −25%). */
    darkWebBuyMultiplier: number;
    /** Resale payout multiplier (1.15 = +15%). */
    resalePriceMultiplier: number;
    /** Node power-draw multiplier (0.8 = −20%). */
    powerDrawMultiplier: number;
    /** Extra rack slots added to the starting rack. */
    bonusRackSlots: number;
    /** Free zero-downtime node restarts per day. */
    freeDailyRestarts: number;
    /** Dark-web heat/suspicion multiplier (0.6 = −40%). */
    darkWebHeatMultiplier: number;
    /** Extra daily dark-web bounty/contract slots. */
    bonusBountySlots: number;
}

export type StartingKitItemType = 'server' | 'consumable' | 'unlock';

export interface ClassStartingKitItem {
    /** Stable id for the granted item. */
    id: string;
    type: StartingKitItemType;
    /** Human-readable label (mirrors the dossier copy). */
    label: string;
    /** How many to grant. */
    quantity: number;
    /** Type-specific reference: server tier, consumable id, or unlock id. */
    ref?: string;
}

export interface ClassConfig {
    accent: string;
    accentName: ClassAccentName;
    /** Fiat balance seeded on Deploy. */
    startingWallet: number;
    perks: ClassPerks;
    startingKit: ClassStartingKitItem[];
}

const NEUTRAL_PERKS: ClassPerks = {
    cipherSpeedMultiplier: 1,
    neuralNetXpMultiplier: 1,
    freeCipherRerolls: 0,
    marketplaceTierUnlock: 1,
    marketplacePriceMultiplier: 1,
    darkWebBuyMultiplier: 1,
    resalePriceMultiplier: 1,
    powerDrawMultiplier: 1,
    bonusRackSlots: 0,
    freeDailyRestarts: 0,
    darkWebHeatMultiplier: 1,
    bonusBountySlots: 0,
};

export const CLASS_CONFIG: Record<HackerClassId, ClassConfig> = {
    cipherwright: {
        accent: '#0af5b0',
        accentName: 'green',
        startingWallet: 8400,
        perks: {
            ...NEUTRAL_PERKS,
            cipherSpeedMultiplier: 1.25,
            neuralNetXpMultiplier: 1.5,
            freeCipherRerolls: 3,
            marketplaceTierUnlock: 2,
        },
        startingKit: [
            { id: 'ax-220-cipher-engine', type: 'server', label: 'AX-220 Cipher Engine', quantity: 1, ref: 'T2' },
            { id: 'lattice-reference-set', type: 'consumable', label: 'Lattice Reference Set', quantity: 3 },
            { id: 'academic-backchannel', type: 'unlock', label: 'Academic Backchannel', quantity: 1, ref: 'rare-cipher-feed' },
        ],
    },
    operator: {
        accent: '#26c6da',
        accentName: 'blue',
        startingWallet: 12200,
        perks: {
            ...NEUTRAL_PERKS,
            marketplacePriceMultiplier: 0.85,
            powerDrawMultiplier: 0.8,
            bonusRackSlots: 4,
            freeDailyRestarts: 1,
        },
        startingKit: [
            { id: 'r210-ii-rack-unit', type: 'server', label: 'R210-II Rack Unit', quantity: 2, ref: 'T1' },
            { id: 'spare-parts-bin', type: 'consumable', label: 'Spare Parts Bin', quantity: 6 },
            { id: 'workshop-license', type: 'unlock', label: 'Workshop License', quantity: 1, ref: 'crafting-bench' },
        ],
    },
    phantom: {
        accent: '#ff9800',
        accentName: 'orange',
        startingWallet: 5800,
        perks: {
            ...NEUTRAL_PERKS,
            darkWebBuyMultiplier: 0.75,
            resalePriceMultiplier: 1.15,
            darkWebHeatMultiplier: 0.6,
            bonusBountySlots: 2,
        },
        startingKit: [
            { id: 'burner-rig-onion-7', type: 'server', label: 'Burner Rig (Onion-7)', quantity: 1, ref: 'T1' },
            { id: 'false-identity-pack', type: 'consumable', label: 'False Identity Pack', quantity: 5 },
            { id: 'encrypted-backchannel', type: 'unlock', label: 'Encrypted Backchannel', quantity: 1, ref: 'private-contracts' },
        ],
    },
};

/** Resolve a class's config, defaulting to Cipherwright (the default accent). */
export const classConfigFor = (classId: HackerClassId | null | undefined): ClassConfig =>
    CLASS_CONFIG[classId ?? 'cipherwright'] ?? CLASS_CONFIG.cipherwright;

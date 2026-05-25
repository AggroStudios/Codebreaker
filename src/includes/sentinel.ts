import type { IPurchasedUpgrade } from './Player.interface';

export const SENTINEL_PROTOCOL_KEY = 'sentinel-protocol';
export const SENTINEL_MAX_TIERS = 5;
export const SENTINEL_CHANCE_REDUCTION_PER_TIER = 0.01;
export const SENTINEL_ROUNDS_REDUCTION_PER_TIER = 1;
export const THREAT_BASE_ROUNDS = 5;

export const sentinelTierCount = (purchasedUpgrades: IPurchasedUpgrade[]): number =>
    purchasedUpgrades.filter((u) => u.upgradeId === SENTINEL_PROTOCOL_KEY).length;

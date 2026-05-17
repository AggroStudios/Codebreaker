import { Server, ServerFormFactor, ServerTier } from './Servers.interface';

export const TIER_COLORS: Record<number, string> = {
    1: '#9e9e9e',
    2: '#26c6da',
    3: '#0af5b0',
    4: '#ff9800',
    5: '#ba68c8',
};

export interface RackCatalogItem {
    sku: string;
    name: string;
    slots: number;
    price: number;
    power: number;
    cooling: string;
}

export const RACK_CATALOG: RackCatalogItem[] = [
    { sku: 'RK-12U', name: '12U Half Rack', slots: 12, price:  4500, power:  4500, cooling: 'Passive' },
    { sku: 'RK-24U', name: '24U Mid Rack',  slots: 24, price:  9800, power:  9000, cooling: 'Single fan wall' },
    { sku: 'RK-42U', name: '42U Full Rack', slots: 42, price: 18500, power: 16500, cooling: 'Hot/cold aisle' },
    { sku: 'RK-48U', name: '48U Tall Rack', slots: 48, price: 24000, power: 22000, cooling: 'In-row chiller' },
];

const TIER_ORDER: ServerTier[] = Object.values(ServerTier) as ServerTier[];

export const serverTierLevel = (tier: ServerTier): number => TIER_ORDER.indexOf(tier) + 1;

const FORM_FACTOR_SIZE: Record<ServerFormFactor, number> = {
    [ServerFormFactor.ONE_U]:   1,
    [ServerFormFactor.TWO_U]:   2,
    [ServerFormFactor.THREE_U]: 3,
    [ServerFormFactor.FOUR_U]:  4,
    [ServerFormFactor.FIVE_U]:  5,
};

export const serverSize = (server: Server): number => FORM_FACTOR_SIZE[server.formFactor] ?? 1;

/**
 * Every purchased server should already have a unique `name` (assigned by
 * `generateServerName` in the servers store). Fall back to `id` then `model`
 * so duplicates remain distinguishable when called from older save data.
 */
export const serverInstId = (server: Server): string =>
    server.name ?? server.id ?? server.model;

export interface SwitchUnit {
    id: string;
    name: string;
    model: string;
    ports: number;
    used: number;
    throughput: string;
    status: 'UP' | 'DEGRADED' | 'DOWN';
}

export interface UplinkInfo {
    provider: string;
    status: 'UP' | 'DEGRADED' | 'DOWN';
    bandwidth: string;
    latency: string;
    ip: string;
    asn: string;
}

export const INITIAL_SWITCHES: SwitchUnit[] = [
    { id: 'sw-core', name: 'Core-SW-01', model: 'Catalyst 9300X', ports: 48, used: 24, throughput:  '40 Gbps', status: 'UP' },
    { id: 'sw-gpu',  name: 'GPU-SW-01',  model: 'Nexus 9336C',    ports: 36, used: 12, throughput: '100 Gbps', status: 'UP' },
    { id: 'sw-edge', name: 'Edge-SW-01', model: 'MX204',          ports: 16, used:  4, throughput:  '10 Gbps', status: 'DEGRADED' },
];

export const INITIAL_UPLINK: UplinkInfo = {
    provider: 'AggroNet Tier-1',
    status: 'UP',
    bandwidth: '10 Gbps',
    latency: '4 ms',
    ip: '198.51.100.42',
    asn: 'AS64512',
};

export const statusColor = (s: 'UP' | 'DEGRADED' | 'DOWN'): string => {
    if (s === 'UP') return '#0af5b0';
    if (s === 'DEGRADED') return '#ff9800';
    return '#f44336';
};

export const U_HEIGHT = 22;
export const RACK_WIDTH = 280;

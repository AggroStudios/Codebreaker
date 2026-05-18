export type NodeId = string;

export interface NetNode {
    id: NodeId;
    code: string;
    name: string;
    city: string;
    provider: string;
    tier: 'I' | 'II' | 'III' | 'IV' | '—';
    isStation?: boolean;
    uplinkGbps: number;
}

export type LinkType = 'VPN' | 'Public' | 'Private' | 'Dark';
export type LinkStatus = 'ACTIVE' | 'DEGRADED' | 'PROVISIONING' | 'DOWN';

export interface NetLink {
    id: string;
    src: NodeId;
    dst: NodeId;
    type: LinkType;
    gbps: number;
    utilizationPct: number;
    latencyMs: number;
    costDay: number;
    status: LinkStatus;
}

export type FirewallMode = 'PERMISSIVE' | 'BALANCED' | 'STRICT';
export type FirewallStatus = 'ACTIVE' | 'PROVISIONING' | 'DEGRADED' | 'DOWN';

export interface Firewall {
    id: string;
    nodeId: NodeId;
    name: string;
    model: string;
    rulesAllow: number;
    rulesDeny: number;
    threatsBlocked24h: number;
    throughputMbps: number;
    cpuPct: number;
    mode: FirewallMode;
    ips: boolean;
    deepInspect: boolean;
    status: FirewallStatus;
}

export interface LinkTypeDefaults {
    gbps: number;
    costDay: number;
    latencyBoost: number;
    desc: string;
}

export const LINK_TYPE_DEFAULTS: Record<LinkType, LinkTypeDefaults> = {
    VPN:     { gbps: 1,   costDay: 0,    latencyBoost: 0,   desc: 'Cheap encrypted tunnel over the public internet.' },
    Public:  { gbps: 10,  costDay: 180,  latencyBoost: 12,  desc: 'Carrier-grade public peering. Decent speed, shared.' },
    Private: { gbps: 40,  costDay: 480,  latencyBoost: -8,  desc: 'Dedicated private interconnect. Low jitter, low ms.' },
    Dark:    { gbps: 100, costDay: 1450, latencyBoost: -22, desc: 'Dark fiber lease. Maximum throughput.' },
};

export const LINK_TYPE_ORDER: LinkType[] = ['VPN', 'Public', 'Private', 'Dark'];

export const FW_MODES: FirewallMode[] = ['PERMISSIVE', 'BALANCED', 'STRICT'];

/** Latency floor + base used when provisioning a new link. */
export const BASE_LATENCY_MS = 64;
export const MIN_LATENCY_MS = 8;

export const TRAFFIC_SAMPLE_COUNT = 60;

/** Status → chip/dot vocabulary used by both link & firewall rows. */
export const linkStatusChipClass: Record<LinkStatus, 'accent' | 'orange' | 'cyan' | 'warning'> = {
    ACTIVE: 'accent',
    DEGRADED: 'orange',
    PROVISIONING: 'cyan',
    DOWN: 'warning',
};

export const linkStatusDotClass: Record<LinkStatus, '' | 'warn' | 'idle' | 'error'> = {
    ACTIVE: '',
    DEGRADED: 'warn',
    PROVISIONING: 'idle',
    DOWN: 'error',
};

export const fwStatusChipClass: Record<FirewallStatus, 'accent' | 'orange' | 'cyan' | 'warning'> = {
    ACTIVE: 'accent',
    PROVISIONING: 'cyan',
    DEGRADED: 'orange',
    DOWN: 'warning',
};

export const fwStatusDotClass: Record<FirewallStatus, '' | 'warn' | 'idle' | 'error'> = {
    ACTIVE: '',
    PROVISIONING: 'idle',
    DEGRADED: 'warn',
    DOWN: 'error',
};

/** Util > 80 → warn; > 60 → cyan; else accent. */
export const utilBarClass = (util: number): 'accent' | 'cyan' | 'orange' => {
    if (util > 80) return 'orange';
    if (util > 60) return 'cyan';
    return 'accent';
};

/** Sorts so an unordered pair {a,b} always keys the same regardless of direction. */
export const linkPairKey = (a: NodeId, b: NodeId): string =>
    a < b ? `${a}|${b}` : `${b}|${a}`;

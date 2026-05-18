import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
    BASE_LATENCY_MS,
    Firewall,
    FirewallMode,
    LINK_TYPE_DEFAULTS,
    LINK_TYPE_ORDER,
    LinkType,
    MIN_LATENCY_MS,
    NetLink,
    NodeId,
    TRAFFIC_SAMPLE_COUNT,
    linkPairKey,
} from '../includes/networks.interface';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const computeLatency = (boost: number): number =>
    Math.max(MIN_LATENCY_MS, BASE_LATENCY_MS + boost);

const INITIAL_LINKS: NetLink[] = [
    { id: 'l-stn-usw',  src: 'station',     dst: 'us-west',      type: 'VPN',     gbps: 1,   utilizationPct: 38, latencyMs: 18,  costDay: 0,    status: 'ACTIVE' },
    { id: 'l-usw-use',  src: 'us-west',     dst: 'us-east',      type: 'Private', gbps: 40,  utilizationPct: 62, latencyMs: 64,  costDay: 480,  status: 'ACTIVE' },
    { id: 'l-use-euc',  src: 'us-east',     dst: 'eu-central',   type: 'Private', gbps: 25,  utilizationPct: 71, latencyMs: 88,  costDay: 920,  status: 'ACTIVE' },
    { id: 'l-euc-eun',  src: 'eu-central',  dst: 'eu-north',     type: 'Private', gbps: 10,  utilizationPct: 22, latencyMs: 22,  costDay: 220,  status: 'ACTIVE' },
    { id: 'l-use-apn',  src: 'us-east',     dst: 'ap-northeast', type: 'Public',  gbps: 10,  utilizationPct: 84, latencyMs: 142, costDay: 380,  status: 'DEGRADED' },
    { id: 'l-usw-apn',  src: 'us-west',     dst: 'ap-northeast', type: 'Private', gbps: 10,  utilizationPct: 0,  latencyMs: 98,  costDay: 720,  status: 'PROVISIONING' },
];

const INITIAL_FIREWALLS: Firewall[] = [
    { id: 'fw-station', nodeId: 'station',      name: 'Station Perimeter', model: 'CodeWall Pro',  rulesAllow: 18, rulesDeny: 42, threatsBlocked24h: 1284, throughputMbps:   940, cpuPct: 22, mode: 'STRICT',     ips: true,  deepInspect: true,  status: 'ACTIVE' },
    { id: 'fw-usw',     nodeId: 'us-west',      name: 'USW-1 Edge',        model: 'CodeWall Rack', rulesAllow: 12, rulesDeny: 28, threatsBlocked24h:  312, throughputMbps: 22400, cpuPct: 41, mode: 'STRICT',     ips: true,  deepInspect: false, status: 'ACTIVE' },
    { id: 'fw-use',     nodeId: 'us-east',      name: 'USE-1 Edge',        model: 'CodeWall Rack', rulesAllow: 22, rulesDeny: 64, threatsBlocked24h: 2418, throughputMbps: 64200, cpuPct: 58, mode: 'STRICT',     ips: true,  deepInspect: true,  status: 'ACTIVE' },
    { id: 'fw-euc',     nodeId: 'eu-central',   name: 'EUC-1 Edge',        model: 'CodeWall Rack', rulesAllow: 14, rulesDeny: 38, threatsBlocked24h:  884, throughputMbps: 18100, cpuPct: 34, mode: 'BALANCED',   ips: true,  deepInspect: false, status: 'ACTIVE' },
    { id: 'fw-apn',     nodeId: 'ap-northeast', name: 'APN-1 Edge',        model: 'CodeWall Lite', rulesAllow:  8, rulesDeny: 19, threatsBlocked24h:  142, throughputMbps:  6400, cpuPct: 19, mode: 'BALANCED',   ips: false, deepInspect: false, status: 'ACTIVE' },
    { id: 'fw-eun',     nodeId: 'eu-north',     name: 'EUN-1 Edge',        model: 'CodeWall Lite', rulesAllow:  6, rulesDeny: 12, threatsBlocked24h:   38, throughputMbps:  2200, cpuPct:  9, mode: 'PERMISSIVE', ips: false, deepInspect: false, status: 'PROVISIONING' },
];

const zeroSamples = (): number[] => Array(TRAFFIC_SAMPLE_COUNT).fill(0);

let linkCounter = 0;
const makeLinkId = () => {
    linkCounter += 1;
    return `l-${Date.now().toString(36)}-${linkCounter}`;
};

export type NetworksStoreState = {
    links: NetLink[];
    firewalls: Firewall[];
    /** Sliding 60-sample window of Gbps in/out. Transient — not persisted. */
    trafficIn: number[];
    trafficOut: number[];

    provisionLink: (src: NodeId, dst: NodeId, type: LinkType) => void;
    upgradeLink: (id: string) => void;
    removeLink: (id: string) => void;

    setFirewallMode: (id: string, mode: FirewallMode) => void;
    toggleFirewallIPS: (id: string) => void;
    toggleFirewallDeepInspect: (id: string) => void;

    /** Drift `utilizationPct` for each ACTIVE link by ±4% × speed, clamped [2, 98]. */
    tickLinkUtilization: (speed: number) => void;
    /** For each ACTIVE firewall: bump threats by 0..6 × speed; drift CPU ±2.5% × speed, clamped [4, 96]. */
    tickFirewallStats: (speed: number) => void;
    /** Append one new IN + OUT traffic sample, scaled by total active capacity. */
    tickTraffic: (speed: number) => void;

    /** Mark every PROVISIONING link/firewall as ACTIVE — call this after the provisioning timer elapses. */
    activateProvisioning: () => void;
};

export const useNetworksStore = create<NetworksStoreState>()(
    persist(
        (set) => ({
            links: INITIAL_LINKS,
            firewalls: INITIAL_FIREWALLS,
            trafficIn: zeroSamples(),
            trafficOut: zeroSamples(),

            provisionLink: (src, dst, type) => set((state) => {
                if (!src || !dst || src === dst) return state;
                const usedKey = linkPairKey(src, dst);
                if (state.links.some((l) => linkPairKey(l.src, l.dst) === usedKey)) return state;
                const def = LINK_TYPE_DEFAULTS[type];
                const link: NetLink = {
                    id: makeLinkId(),
                    src,
                    dst,
                    type,
                    gbps: def.gbps,
                    utilizationPct: 0,
                    latencyMs: computeLatency(def.latencyBoost),
                    costDay: def.costDay,
                    status: 'PROVISIONING',
                };
                return { links: [...state.links, link] };
            }),

            upgradeLink: (id) => set((state) => ({
                links: state.links.map((l) => {
                    if (l.id !== id) return l;
                    const idx = LINK_TYPE_ORDER.indexOf(l.type);
                    if (idx < 0 || idx >= LINK_TYPE_ORDER.length - 1) return l;
                    const next = LINK_TYPE_ORDER[idx + 1];
                    const def = LINK_TYPE_DEFAULTS[next];
                    const newUtil = Math.max(8, Math.round(l.utilizationPct * l.gbps / def.gbps));
                    return {
                        ...l,
                        type: next,
                        gbps: def.gbps,
                        utilizationPct: newUtil,
                        latencyMs: computeLatency(def.latencyBoost),
                        costDay: def.costDay,
                    };
                }),
            })),

            removeLink: (id) => set((state) => ({
                links: state.links.filter((l) => l.id !== id),
            })),

            setFirewallMode: (id, mode) => set((state) => ({
                firewalls: state.firewalls.map((f) => (f.id === id ? { ...f, mode } : f)),
            })),

            toggleFirewallIPS: (id) => set((state) => ({
                firewalls: state.firewalls.map((f) => (f.id === id ? { ...f, ips: !f.ips } : f)),
            })),

            toggleFirewallDeepInspect: (id) => set((state) => ({
                firewalls: state.firewalls.map((f) =>
                    f.id === id ? { ...f, deepInspect: !f.deepInspect } : f,
                ),
            })),

            tickLinkUtilization: (speed) => set((state) => ({
                links: state.links.map((l) => {
                    if (l.status !== 'ACTIVE') return l;
                    const delta = (Math.random() * 2 - 1) * 4 * speed;
                    return { ...l, utilizationPct: clamp(Math.round(l.utilizationPct + delta), 2, 98) };
                }),
            })),

            tickFirewallStats: (speed) => set((state) => ({
                firewalls: state.firewalls.map((f) => {
                    if (f.status !== 'ACTIVE') return f;
                    const threatsDelta = Math.round(Math.random() * 6 * speed);
                    const cpuDelta = (Math.random() * 2 - 1) * 2.5 * speed;
                    return {
                        ...f,
                        threatsBlocked24h: f.threatsBlocked24h + threatsDelta,
                        cpuPct: clamp(Math.round(f.cpuPct + cpuDelta), 4, 96),
                    };
                }),
            })),

            tickTraffic: (speed) => set((state) => {
                const totalCap = state.links
                    .filter((l) => l.status === 'ACTIVE')
                    .reduce((sum, l) => sum + l.gbps, 0);
                const baseIn = totalCap * 0.45;
                const baseOut = totalCap * 0.30;
                const noise = (Math.random() * 2 - 1) * totalCap * 0.15 * speed;
                const nextIn = Math.max(0, Math.min(totalCap, baseIn + noise));
                const nextOut = Math.max(0, Math.min(totalCap, baseOut + noise * 0.7));
                const trafficIn = [...state.trafficIn.slice(1), nextIn];
                const trafficOut = [...state.trafficOut.slice(1), nextOut];
                return { trafficIn, trafficOut };
            }),

            activateProvisioning: () => set((state) => ({
                links: state.links.map((l) =>
                    l.status === 'PROVISIONING' ? { ...l, status: 'ACTIVE' } : l,
                ),
                firewalls: state.firewalls.map((f) =>
                    f.status === 'PROVISIONING' ? { ...f, status: 'ACTIVE' } : f,
                ),
            })),
        }),
        {
            name: 'networks-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                links: state.links,
                firewalls: state.firewalls,
                // trafficIn / trafficOut intentionally not persisted — transient.
            }),
        },
    ),
);

/** Returns true when the (unordered) pair already has a link. */
export const linkExistsBetween = (links: NetLink[], a: NodeId, b: NodeId): boolean =>
    links.some((l) => linkPairKey(l.src, l.dst) === linkPairKey(a, b));

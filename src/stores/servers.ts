import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NetworkCable, NetworkDSL, NetworkFiber, NetworkFiber10Gbps, Networking } from '../data/network';
import { ServerNamePrefixes } from '../data/servers';
import { NetworkConnectionType } from '../includes/Process.interface';
import { Server, ServerTier } from '../includes/Servers.interface';

export interface DailyDeal {
    server: Server;
    discountPercent: number;
}

type PersistedNetworkLink = {
    connectionType?: NetworkConnectionType | string;
    speedInBps?: number;
};

/** JSON persistence drops class prototypes; rebuild `Networking` + link type from plain objects. */
function reviveNetworkLink(data: PersistedNetworkLink) {
    const speed = Number(data.speedInBps);
    const ct = data.connectionType as string | undefined;
    if (ct === NetworkConnectionType.fiber || ct === 'Fiber') {
        if (speed >= 9_000_000) return new NetworkFiber10Gbps();
        return new NetworkFiber();
    }
    if (ct === NetworkConnectionType.cable || ct === 'Cable') return new NetworkCable();
    if (ct === NetworkConnectionType.dsl || ct === 'DSL') return new NetworkDSL();
    if (speed >= 9_000_000) return new NetworkFiber10Gbps();
    if (speed >= 900_000) return new NetworkFiber();
    if (speed >= 50_000) return new NetworkCable();
    return new NetworkDSL();
}

function reviveNetworking(raw: unknown): Networking {
    if (raw instanceof Networking) return raw;
    const plain = raw as Record<string, unknown>;
    const inner =
        (plain._network as PersistedNetworkLink | undefined) ??
        (plain.connectionType != null && plain.speedInBps != null ? (plain as unknown as PersistedNetworkLink) : null);
    if (!inner || inner.speedInBps === undefined) {
        return new Networking(new NetworkFiber());
    }
    return new Networking(reviveNetworkLink(inner));
}

function reviveServerNetworking(server: Server): Server {
    if (!server?.network) return server;
    return { ...server, network: reviveNetworking(server.network as unknown) };
}

function reviveDailyDeal(deal: DailyDeal | null | undefined): DailyDeal | null {
    if (deal == null) return null;
    return { ...deal, server: reviveServerNetworking(deal.server) };
}

export type ServersStoreState = {
    servers: Server[];
    purchasedServers: Server[];
    dailyDeal: DailyDeal | null;
    setServers: (servers: Server[]) => void;
    setDailyDeal: (dailyDeal: DailyDeal) => void;
    setDailyOffers: (dailyOffers: DailyDeal[]) => void;
    purchaseServer: (server: Server) => void;
    sellServer: (server: Server) => void;
    configureServer: (server: Server, config: NonNullable<Server['config']>) => void;
    restartServer: (server: Server) => void;
};

const generateServerName = (state: ServersStoreState, tier: ServerTier) => {
    const prefixes = ServerNamePrefixes[tier];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = state.purchasedServers.filter((server: Server) => server.tier === tier && server.name?.startsWith(prefix)).length + 1;
    return `${prefix}-${suffix}`;
}

export const useServersStore = create<ServersStoreState>()(
    persist(
        (set) => ({
            servers: [],
            purchasedServers: [],
            dailyDeal: null,
            setServers: (servers: Server[]) => set({ servers }),
            setDailyDeal: (dailyDeal: DailyDeal) => set({ dailyDeal }),
            setDailyOffers: (dailyOffers: DailyDeal[]) => set((state) => {
                const newServers = state.servers.map((server) => {
                    const dailyOffer = dailyOffers.find((dailyOffer) => dailyOffer.server.model === server.model && dailyOffer.server.manufacturer === server.manufacturer);
                    return { ...server, discount: dailyOffer?.discountPercent ?? 0 };
                });
                return { servers: newServers };
             }),
             purchaseServer: (server: Server) => set((state) => {
                const serverName = generateServerName(state, server.tier);
                const enriched: Server = {
                    ...server,
                    name: serverName,
                    util: server.util ?? 0,
                    uptime: server.uptime ?? '—',
                    location: server.location ?? '—',
                    earnings24h: server.earnings24h ?? 0,
                    purchased: server.purchased ?? new Date().toISOString(),
                };
                return { purchasedServers: [...state.purchasedServers, enriched] };
             }),
             sellServer: (server: Server) => set((state) => {
                // Identify by `name` (guaranteed unique by generateServerName) since `id` isn't populated.
                return { purchasedServers: state.purchasedServers.filter((s: Server) => s.name !== server.name) };
             }),
             configureServer: (server: Server, config) => set((state) => ({
                purchasedServers: state.purchasedServers.map((s) =>
                    s.name === server.name ? { ...s, config } : s,
                ),
             })),
             restartServer: (server: Server) => set((state) => ({
                purchasedServers: state.purchasedServers.map((s) =>
                    s.name === server.name
                        ? { ...s, uptime: 'just rebooted', util: 0 }
                        : s,
                ),
             })),
        }),
        {
            name: 'servers-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                servers: state.servers,
                purchasedServers: state.purchasedServers,
                dailyDeal: state.dailyDeal,
            }),
            merge: (persistedState, currentState) => {
                const p = (persistedState ?? {}) as Partial<ServersStoreState>;
                return {
                    ...currentState,
                    ...p,
                    servers: (p.servers ?? currentState.servers).map(reviveServerNetworking),
                    purchasedServers: (p.purchasedServers ?? currentState.purchasedServers).map(reviveServerNetworking),
                    dailyDeal:
                        p.dailyDeal === undefined
                            ? currentState.dailyDeal
                            : reviveDailyDeal(p.dailyDeal),
                };
            },
        },
    ),
);
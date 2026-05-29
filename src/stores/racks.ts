import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Server } from '../includes/Servers.interface';
import {
    Cipher,
    INITIAL_SWITCHES,
    INITIAL_UPLINK,
    RACK_CATALOG,
    SwitchUnit,
    UplinkInfo,
    seedCiphers,
    serverInstId,
    serverSize,
} from '../includes/serverRacks.interface';

export interface InstalledServer {
    /** Stable identifier for this installed instance. Matches `serverInstId(server)`. */
    instId: string;
    server: Server;
    /** Top-most U slot (1-indexed). */
    u: number;
    /** Live cipher cycles running on this instance. Seeded at install time. */
    ciphers?: Cipher[];
}

export interface Rack {
    id: string;
    /** Region/data-center id the rack lives in. */
    dcId: string;
    sku: string;
    name: string;
    slots: number;
    switchId: string | null;
    installed: InstalledServer[];
}

let rackCounter = 0;
const makeRackId = () => {
    rackCounter += 1;
    return `rack-${Date.now().toString(36)}-${rackCounter}`;
};

const STATUS_CYCLE: Record<'UP' | 'DEGRADED' | 'DOWN', 'UP' | 'DEGRADED' | 'DOWN'> = {
    UP: 'DEGRADED',
    DEGRADED: 'DOWN',
    DOWN: 'UP',
};

export type RacksStoreState = {
    racks: Rack[];
    switches: SwitchUnit[];
    uplink: UplinkInfo;
    selectedDcId: string;

    selectDC: (dcId: string) => void;
    installServer: (rackId: string, u: number, server: Server) => void;
    moveServer: (srcRackId: string, dstRackId: string, instId: string, newU: number) => void;
    uninstallServer: (rackId: string, instId: string) => void;
    addRack: (dcId: string, catalogSku?: string) => void;
    removeRack: (rackId: string) => void;
    removeRacksByDc: (dcId: string) => void;
    assignRackToSwitch: (rackId: string, switchId: string | null) => void;
    cycleUplink: () => void;
};

const defaultRacks = (): Rack[] => ([
    {
        id: makeRackId(),
        dcId: 'us-west',
        sku: 'RK-42U',
        name: 'Rack A · Production',
        slots: 42,
        switchId: 'sw-core',
        installed: [],
    },
]);

export const useRacksStore = create<RacksStoreState>()(
    persist(
        (set) => ({
            racks: defaultRacks(),
            switches: INITIAL_SWITCHES,
            uplink: INITIAL_UPLINK,
            selectedDcId: 'us-west',

            selectDC: (dcId) => set({ selectedDcId: dcId }),

            installServer: (rackId, u, server) => set((state) => ({
                racks: state.racks.map((rack) => {
                    if (rack.id !== rackId) return rack;
                    const instId = serverInstId(server);
                    if (rack.installed.some((it) => it.instId === instId)) return rack;
                    // Seed 0–2 mock ciphers so the hover tooltip has something to show.
                    const ciphers: Cipher[] = seedCiphers(Math.floor(Math.random() * 3));
                    return {
                        ...rack,
                        installed: [...rack.installed, { instId, server, u, ciphers }],
                    };
                }),
            })),

            moveServer: (srcRackId, dstRackId, instId, newU) => set((state) => {
                const src = state.racks.find((r) => r.id === srcRackId);
                const installed = src?.installed.find((it) => it.instId === instId);
                if (!installed) return state;
                return {
                    racks: state.racks.map((rack) => {
                        if (rack.id === srcRackId && srcRackId === dstRackId) {
                            return {
                                ...rack,
                                installed: rack.installed.map((it) =>
                                    it.instId === instId ? { ...it, u: newU } : it,
                                ),
                            };
                        }
                        if (rack.id === srcRackId) {
                            return {
                                ...rack,
                                installed: rack.installed.filter((it) => it.instId !== instId),
                            };
                        }
                        if (rack.id === dstRackId) {
                            return {
                                ...rack,
                                installed: [...rack.installed, { ...installed, u: newU }],
                            };
                        }
                        return rack;
                    }),
                };
            }),

            uninstallServer: (rackId, instId) => set((state) => ({
                racks: state.racks.map((rack) =>
                    rack.id === rackId
                        ? { ...rack, installed: rack.installed.filter((it) => it.instId !== instId) }
                        : rack,
                ),
            })),

            addRack: (dcId, catalogSku) => set((state) => {
                const tpl = RACK_CATALOG.find((c) => c.sku === catalogSku) ?? RACK_CATALOG[0];
                const dcRackCount = state.racks.filter((r) => r.dcId === dcId).length;
                const letter = String.fromCharCode(65 + dcRackCount);
                return {
                    racks: [
                        ...state.racks,
                        {
                            id: makeRackId(),
                            dcId,
                            sku: tpl.sku,
                            name: `Rack ${letter}`,
                            slots: tpl.slots,
                            switchId: null,
                            installed: [],
                        },
                    ],
                };
            }),

            removeRack: (rackId) => set((state) => ({
                racks: state.racks.filter((r) => r.id !== rackId),
            })),

            removeRacksByDc: (dcId) => set((state) => ({
                racks: state.racks.filter((r) => r.dcId !== dcId),
            })),

            assignRackToSwitch: (rackId, switchId) => set((state) => ({
                racks: state.racks.map((r) => (r.id === rackId ? { ...r, switchId } : r)),
            })),

            cycleUplink: () => set((state) => ({
                uplink: { ...state.uplink, status: STATUS_CYCLE[state.uplink.status] },
            })),
        }),
        {
            name: 'racks-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                racks: state.racks,
                switches: state.switches,
                uplink: state.uplink,
                selectedDcId: state.selectedDcId,
            }),
            merge: (persisted, current) => {
                const p = (persisted ?? {}) as Partial<RacksStoreState>;
                // Old saves don't have `dcId` on Rack — fall back to the
                // legacy `selectedDcId` (or 'us-west').
                const fallbackDc = p.selectedDcId ?? current.selectedDcId ?? 'us-west';
                const racks: Rack[] = (p.racks ?? current.racks).map((r) => ({
                    ...r,
                    dcId: (r as Rack).dcId ?? fallbackDc,
                }));
                return { ...current, ...p, racks };
            },
        },
    ),
);

/** Returns the set of instIds currently installed across all racks. */
export const useInstalledInstIds = (): Set<string> => {
    const racks = useRacksStore((s) => s.racks);
    const ids = new Set<string>();
    racks.forEach((r) => r.installed.forEach((it) => ids.add(it.instId)));
    return ids;
};

/** Racks installed in the given data center. */
export const useRacksByDc = (dcId: string | null | undefined): Rack[] => {
    const racks = useRacksStore((s) => s.racks);
    if (!dcId) return [];
    return racks.filter((r) => r.dcId === dcId);
};

/** Bounds + overlap check. ignoreInstId lets a server "overlap with itself" while moving. */
export const canPlace = (
    rack: Rack,
    startU: number,
    size: number,
    ignoreInstId?: string,
): boolean => {
    if (startU < 1 || startU + size - 1 > rack.slots) return false;
    const startA = startU;
    const endA = startU + size - 1;
    return rack.installed.every((it) => {
        if (ignoreInstId != null && it.instId === ignoreInstId) return true;
        const itemSize = serverSize(it.server);
        const startB = it.u;
        const endB = it.u + itemSize - 1;
        return endA < startB || startA > endB;
    });
};

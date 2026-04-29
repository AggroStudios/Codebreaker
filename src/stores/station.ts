import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StationStoreType } from '../includes/Process.interface';
import { Station } from '../lib/station';
import { storeProxy } from '../utils/storeProxy';

/**
 * Creates a zustand hook bound to a specific Station instance. Called once
 * during app bootstrap in `App`.
 */
export const createStationStore = (station: Station) =>
    create<StationStoreType>()(
        persist(
            (set) => ({
                os: station.operatingSystem,
                cpu: station.processor,
                memory: station.memory,
                storage: station.storage,
                network: station.network,
                frame: 0,
                count: 0,
                exponent: 0,
                isRunning: false,
                setRunning: (running: boolean) => set(() => ({ isRunning: running })),
                callback: (frame: number, count: number, exponent: number) =>
                    set(() => ({ frame, count, exponent })),
                cpuActivity: [],
                setCpuActivity: (cpuActivity: { x: number; y: number }[]) =>
                    set(() => ({ cpuActivity })),
            }),
            {
                name: 'station-store',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    isRunning: state.isRunning,
                    exponent: state.exponent,
                    cpu: state.cpu,
                    memory: state.memory,
                    storage: state.storage,
                    // Serialize only the INetworkType data — Networking._stack holds
                    // Process callbacks that create circular references.
                    networkType: state.network?.network,
                }),
                // Merge persisted plain-object data onto the existing class instances
                // so prototype methods (toString etc.) are preserved.
                merge: (persisted, current) => {
                    const p = persisted as any;
                    if (p.cpu) Object.assign(current.cpu, p.cpu);
                    if (p.memory) Object.assign(current.memory, p.memory);
                    if (p.storage) {
                        p.storage.forEach((s: any, i: number) => {
                            if (current.storage[i]) Object.assign(current.storage[i], s);
                        });
                    }
                    if (p.networkType) {
                        Object.assign((current.network as any)._network, p.networkType);
                    }
                    return {
                        ...current,
                        isRunning: p.isRunning ?? current.isRunning,
                        exponent: p.exponent ?? current.exponent,
                    };
                },
                onRehydrateStorage: () => (state) => {
                    if (state?.exponent) {
                        state.os?.setExponent(state.exponent);
                    }
                    if (state?.isRunning) {
                        state.os?.startGameLoop();
                    }
                },
            },
        ),
    );

export type UseStationStore = ReturnType<typeof createStationStore>;

export const makeStationProxy = (store: UseStationStore): StationStoreType =>
    storeProxy(store);

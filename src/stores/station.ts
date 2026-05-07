import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IMemoryType, IProcessorType, IStorageType, StationStoreType } from '../includes/Process.interface';
import { storeProxy } from '../utils/storeProxy';
import { NetworkDSL, Networking } from '../lib/network';
import { CodiumMemory } from '../lib/memory';
import { CodiumStorageHdd } from '../lib/storage';
import { CodiumProcessor } from '../lib/processors';
import { ScreenGlowType } from '../components/ScreenGlow';

const makeDefaults = () => ({
    cpu: new CodiumProcessor(),
    memory: new CodiumMemory(),
    storage: [new CodiumStorageHdd()] as IStorageType[],
    network: new Networking(new NetworkDSL()),
});

/**
 * Creates a zustand hook bound to a specific Station instance. Called once
 * during app bootstrap in `App`.
 */
export const createStationStore = () =>
    create<StationStoreType>()(
        persist(
            (set) => ({
                os: null,
                ...makeDefaults(),
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
                setNetwork: (network: Networking) => set(() => ({ network })),
                setProcessor: (cpu: IProcessorType) => set(() => ({ cpu })),
                setMemory: (memory: IMemoryType) => set(() => ({ memory })),
                reset: () => set(() => ({ ...makeDefaults(), isRunning: false, exponent: 0 })),
                glowActive: false,
                setGlowActive: (active: boolean) => set(() => ({ glowActive: active })),
                glowType: ScreenGlowType.ACTIVE,
                setGlowType: (type: ScreenGlowType) => set(() => ({ glowType: type })),
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
                // Merge persisted plain-object data onto fresh class instances so
                // prototype methods (toString etc.) are preserved without mutating
                // any shared default objects.
                merge: (persisted, current) => {
                    const p = persisted as any;
                    const d = makeDefaults();
                    if (p.cpu) Object.assign(d.cpu, p.cpu);
                    if (p.memory) Object.assign(d.memory, p.memory);
                    if (p.storage) {
                        p.storage.forEach((s: any, i: number) => {
                            if (d.storage[i]) Object.assign(d.storage[i], s);
                            else d.storage.push(Object.assign(new CodiumStorageHdd(), s));
                        });
                    }
                    if (p.networkType) {
                        Object.assign((d.network as any)._network, p.networkType);
                    }
                    return {
                        ...current,
                        cpu: d.cpu,
                        memory: d.memory,
                        storage: d.storage,
                        network: d.network,
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

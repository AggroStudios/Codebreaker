import { create } from 'zustand';
import { StationStoreType } from '../includes/Process.interface';
import { Station } from '../lib/station';
import { storeProxy } from '../utils/storeProxy';

/**
 * Creates a zustand hook bound to a specific Station instance. Called once
 * during app bootstrap in `App`.
 */
export const createStationStore = (station: Station) =>
    create<StationStoreType>((set) => ({
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
    }));

export type UseStationStore = ReturnType<typeof createStationStore>;

export const makeStationProxy = (store: UseStationStore): StationStoreType =>
    storeProxy(store);

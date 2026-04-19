import { create } from 'zustand';
import { CounterState } from '../includes/Counter.interface';
import { StationStoreType } from '../includes/Process.interface';

export const useCipherStore = create<CounterState>((set) => ({
    runningProcesses: [],
    addProcess: (id: string) =>
        set((state) => ({
            runningProcesses: [...state.runningProcesses, id],
        })
    ),
    removeProcess: (id: string) =>
        set((state) => ({
            runningProcesses: state.runningProcesses.filter((p) => p !== id),
        })
    ),
    station: null as unknown as StationStoreType,
    setStation: (station: StationStoreType) => set(() => ({ station })),
}));

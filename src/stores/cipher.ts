import { create } from 'zustand';
import { CounterState } from '../includes/Counter.interface';
import { StationStoreType } from '../includes/Process.interface';
import { CipherBreakState, CipherEntry, ICipherType } from '../includes/Cipher.interface';

const DEFAULT_ENTRY: CipherEntry = { progress: 0, autoCipher: false };

export const cipherGridRenderers = new Map<
    string,
    (chars: Uint8Array, classes: Uint8Array) => void
>();

export const downloadTickHandlers = new Map<string, (frame: number) => void>();

export const useCipherStore = create<CounterState>((set) => ({
    runningProcesses: [],
    addProcess: (id: string, type: ICipherType) =>
        set((state) => ({
            runningProcesses: [...state.runningProcesses, { id, type }],
        })),
    removeProcess: (id: string) =>
        set((state) => ({
            runningProcesses: state.runningProcesses.filter((p) => p.id !== id),
        })),
    station: null as unknown as StationStoreType,
    setStation: (station: StationStoreType) => set(() => ({ station })),
}));

export const useCipherBreakStore = create<CipherBreakState>((set) => ({
    entries: {},
    update: (id, partial) =>
        set((state) => ({
            entries: {
                ...state.entries,
                [id]: { ...(state.entries[id] ?? DEFAULT_ENTRY), ...partial },
            },
        })),
    removeEntry: (id) =>
        set((state) => {
            const entries = { ...state.entries };
            delete entries[id];
            return { entries };
        }),
}));

import { create } from 'zustand';
import { CounterState } from '../includes/Counter.interface';
import { StationStoreType } from '../includes/Process.interface';
import { CipherBreakState, ICipherType, IGridItem } from '../includes/Cipher.interface';
import Cipher from '../lib/Cipher';

export const useCipherStore = create<CounterState>((set) => ({
    runningProcesses: [],
    addProcess: (id: string, type: ICipherType) =>
        set((state) => ({
            runningProcesses: [...state.runningProcesses, { id, type }],
        })
    ),
    removeProcess: (id: string) =>
        set((state) => ({
            runningProcesses: state.runningProcesses.filter((p) => p.id !== id),
        })
    ),
    station: null as unknown as StationStoreType,
    setStation: (station: StationStoreType) => set(() => ({ station })),
}));

export const useCipherBreakStore = create<CipherBreakState>((set) => ({
    ciphers: {},
    grids: {},
    progress: {},
    types: {},
    setCipher: (id: string, cipher: Cipher | undefined) =>
        set((state) => ({
            ciphers: { ...state.ciphers, [id]: cipher },
        })),
    setGrid: (id: string, grid: IGridItem[]) =>
        set((state) => ({
            grids: { ...state.grids, [id]: grid },
        })),
    setProgress: (id: string, progress: number) =>
        set((state) => ({
            progress: { ...state.progress, [id]: progress },
        })),
    setType: (id: string, type: ICipherType) =>
        set((state) => ({
            types: { ...state.types, [id]: type },
        })),
}));
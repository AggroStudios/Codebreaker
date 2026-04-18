import { create } from 'zustand';
import Cipher from '../lib/Cipher';
import { CounterState } from '../includes/Counter.interface';
import { StationStoreType } from '../includes/Process.interface';

export const useCipherStore = create<CounterState>((set) => ({
    runningCiphers: [],
    addCipher: (cipher: Cipher) =>
        set((state) => ({
            runningCiphers: [...state.runningCiphers, cipher],
        })),
    removeCipher: (cipher: Cipher) =>
        set((state) => ({
            runningCiphers: state.runningCiphers.filter((c) => c !== cipher),
        })),
    updateCipher: (oldCipher: Cipher, newCipher: Cipher) =>
        set((state) => {
            const oldIndex = state.runningCiphers.indexOf(oldCipher);
            if (oldIndex === -1) {
                return state;
            }
            return {
                runningCiphers: [
                    ...state.runningCiphers.slice(0, oldIndex),
                    newCipher,
                    ...state.runningCiphers.slice(oldIndex + 1),
                ],
            };
        }),
    station: null as unknown as StationStoreType,
    setStation: (station: StationStoreType) => set(() => ({ station })),
}));

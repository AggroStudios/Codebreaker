import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IApplication } from '../includes/Terminal.interface';
import { steamCloudStorage } from '../lib/steamCloudStorage';

type StorageStoreState = {
    storedFiles: IApplication[];
    pushFile: (file: IApplication) => void;
    removeFile: (directory: string, filename: string) => void;
    clearFiles: () => void;
};

export const useStorageStore = create<StorageStoreState>()(
    persist(
        (set) => ({
            storedFiles: [],
            pushFile: (file) => set((state) => ({ storedFiles: [...state.storedFiles, file] })),
            removeFile: (directory, filename) =>
                set((state) => ({
                    storedFiles: state.storedFiles.filter(
                        (f) => !(f.path === directory && f.cmd === filename),
                    ),
                })),
            clearFiles: () => set({ storedFiles: [] }),
        }),
        {
            name: 'storage-store.json',
            storage: createJSONStorage(() => steamCloudStorage),
            partialize: (state) => ({ storedFiles: state.storedFiles }),
        },
    ),
);

import { create } from 'zustand';

type AppReadyState = {
    isAppReady: boolean;
    setAppReady: () => void;
};

export const useAppReadyStore = create<AppReadyState>()((set) => ({
    isAppReady: false,
    setAppReady: () => set({ isAppReady: true }),
}));

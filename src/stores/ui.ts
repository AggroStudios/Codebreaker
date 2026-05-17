import { create } from 'zustand';

type UIState = {
    settingsOpen: boolean;
    aboutOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
    openAbout: () => void;
    closeAbout: () => void;
};

export const useUIStore = create<UIState>()((set) => ({
    settingsOpen: false,
    aboutOpen: false,
    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),
    openAbout: () => set({ aboutOpen: true }),
    closeAbout: () => set({ aboutOpen: false }),
}));

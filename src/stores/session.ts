import { create } from 'zustand';

/**
 * Session-only flag (not persisted) — true once the user has passed through
 * the title screen this page load. Guards against deep-linked / bookmarked
 * URLs booting straight into Layout without the title-screen hand-off.
 */
type SessionState = {
    isInitialized: boolean;
    setInitialized: () => void;
};

export const useSessionStore = create<SessionState>()((set) => ({
    isInitialized: false,
    setInitialized: () => set({ isInitialized: true }),
}));

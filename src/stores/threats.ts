import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThreatMiniGame = 'simon' | 'turnTwo';

type ThreatsState = {
    /** Total threats encountered across the run. Persisted. */
    threatCount: number;
    /** Whether a threat is currently active and blocking the station. */
    active: boolean;
    /** The mini-game randomly selected for the current threat. */
    miniGame: ThreatMiniGame | null;
    /** Bumped each time the player retries — used to remount the mini-game. */
    attempt: number;
    triggerThreat: (miniGame: ThreatMiniGame) => void;
    retryThreat: () => void;
    resolveThreat: () => void;
    reset: () => void;
};

const pickMiniGame = (): ThreatMiniGame =>
    Math.random() < 0.5 ? 'simon' : 'turnTwo';

export const pickRandomMiniGame = pickMiniGame;

export const useThreatsStore = create<ThreatsState>()(
    persist(
        (set) => ({
            threatCount: 0,
            active: false,
            miniGame: null,
            attempt: 0,
            triggerThreat: (miniGame) =>
                set((state) => ({
                    threatCount: state.threatCount + 1,
                    active: true,
                    miniGame,
                    attempt: 0,
                })),
            retryThreat: () =>
                set((state) => ({
                    miniGame: pickMiniGame(),
                    attempt: state.attempt + 1,
                })),
            resolveThreat: () =>
                set(() => ({ active: false, miniGame: null, attempt: 0 })),
            reset: () =>
                set(() => ({
                    threatCount: 0,
                    active: false,
                    miniGame: null,
                    attempt: 0,
                })),
        }),
        {
            name: 'threats-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ threatCount: state.threatCount }),
        },
    ),
);

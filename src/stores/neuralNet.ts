import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LibraryEntry {
    seconds: number;
    sessions: number;
    lastTrained: string;
}

export type Library = Record<string, LibraryEntry>;

const emptyEntry = (): LibraryEntry => ({ seconds: 0, sessions: 0, lastTrained: '—' });

const TICK_SPEED = 1; // points/sec multiplier; surfaced for future upgrades

export type NeuralNetState = {
    library: Library;
    currentCipher: string | null;
    active: boolean;
    sessionSeconds: number;

    tick: (dtSeconds: number) => void;
    selectCipher: (name: string) => void;
    switchCipher: (name: string) => void;
    commitSession: () => void;
    resetCipher: (name: string) => void;
    togglePause: () => void;
    setActive: (active: boolean) => void;
};

const bankIntoLibrary = (
    library: Library,
    cipher: string,
    sessionSeconds: number,
): Library => {
    if (sessionSeconds <= 0) return library;
    const prev = library[cipher] ?? emptyEntry();
    return {
        ...library,
        [cipher]: {
            seconds: prev.seconds + sessionSeconds,
            sessions: prev.sessions + 1,
            lastTrained: 'just now',
        },
    };
};

export const useNeuralNetStore = create<NeuralNetState>()(
    persist(
        (set) => ({
            library: {},
            currentCipher: null,
            active: false,
            sessionSeconds: 0,

            tick: (dtSeconds) => set((state) => {
                if (!state.active || !state.currentCipher) return state;
                return { sessionSeconds: state.sessionSeconds + dtSeconds * TICK_SPEED };
            }),

            selectCipher: (name) => set((state) => {
                if (state.currentCipher === name) return state;
                const library = bankIntoLibrary(state.library, state.currentCipher ?? '', state.sessionSeconds);
                return { library, currentCipher: name, sessionSeconds: 0 };
            }),

            switchCipher: (name) => set((state) => {
                if (state.currentCipher === name) return state;
                const library = bankIntoLibrary(state.library, state.currentCipher ?? '', state.sessionSeconds);
                return { library, currentCipher: name, sessionSeconds: 0 };
            }),

            commitSession: () => set((state) => {
                if (state.sessionSeconds < 1 || !state.currentCipher) return state;
                return {
                    library: bankIntoLibrary(state.library, state.currentCipher, state.sessionSeconds),
                    sessionSeconds: 0,
                };
            }),

            resetCipher: (name) => set((state) => {
                const library = { ...state.library, [name]: emptyEntry() };
                if (state.currentCipher === name) {
                    return { library, sessionSeconds: 0 };
                }
                return { library };
            }),

            togglePause: () => set((state) => ({ active: !state.active })),
            setActive: (active) => set({ active }),
        }),
        {
            name: 'neural-net-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                library: state.library,
                currentCipher: state.currentCipher,
                active: state.active,
                // sessionSeconds intentionally not persisted — start each session at 0.
            }),
        },
    ),
);

// ── Derived math ───────────────────────────────────────────────────────────
export const pointsAt = (seconds: number): number =>
    seconds <= 0 ? 0 : Math.floor(Math.pow(1.05, seconds / 5) - 1);

export const bonusFromPoints = (pts: number): number =>
    Math.round(Math.log10(pts + 1) * 8 * 10) / 10;

export const modelLevelFromTotal = (totalPts: number): number =>
    totalPts <= 0 ? 0 : Math.floor(Math.log2(totalPts + 1));

/** Total banked + in-flight points across every cipher. */
export const computeTotalPoints = (state: NeuralNetState): number => {
    let total = 0;
    Object.entries(state.library).forEach(([name, entry]) => {
        const inFlight = name === state.currentCipher ? state.sessionSeconds : 0;
        total += pointsAt(entry.seconds + inFlight);
    });
    if (state.currentCipher && state.library[state.currentCipher] == null) {
        total += pointsAt(state.sessionSeconds);
    }
    return total;
};

/**
 * Returns the speed-bonus multiplier (1.0 = no bonus, 1.12 = +12%) for the
 * given cipher name. Read from outside React via
 * `useNeuralNetStore.getState()`.
 */
export const cipherSpeedMultiplier = (name: string): number => {
    const state = useNeuralNetStore.getState();
    const entry = state.library[name];
    const banked = entry?.seconds ?? 0;
    const inFlight = state.currentCipher === name ? state.sessionSeconds : 0;
    const pts = pointsAt(banked + inFlight);
    return 1 + bonusFromPoints(pts) / 100;
};

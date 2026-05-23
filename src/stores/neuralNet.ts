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

/**
 * Tunable knobs for the training curve. Sqrt-based so each additional point
 * costs progressively more session time — point N requires ~N² / POINTS_K²
 * seconds. Never overflows the way the legacy `1.05^(s/5)` formula did.
 */
const POINTS_K = 4;
/** Hard ceiling so a save with millions of seconds can't blow up downstream math. */
const POINTS_CAP = 1_000_000;

export const pointsAt = (seconds: number): number => {
    if (!Number.isFinite(seconds) || seconds <= 0) return 0;
    return Math.min(POINTS_CAP, Math.floor(POINTS_K * Math.sqrt(seconds)));
};

export const bonusFromPoints = (pts: number): number => {
    if (!Number.isFinite(pts) || pts <= 0) return 0;
    return Math.round(Math.log10(pts + 1) * 8 * 10) / 10;
};

export const modelLevelFromTotal = (totalPts: number): number =>
    totalPts <= 0 ? 0 : Math.floor(Math.log2(totalPts + 1));

// ── Epoch curve ────────────────────────────────────────────────────────────
// Each successive epoch takes EPOCH_GROWTH× longer than the previous one,
// starting from EPOCH_BASE seconds. So epoch 1 lasts 30s, epoch 2 lasts 48s,
// epoch 3 lasts ~77s, epoch 10 lasts ~1800s. Progress is exponentially
// harder as the player advances — the user-requested pacing.
const EPOCH_BASE = 30;
const EPOCH_GROWTH = 1.6;
const EPOCH_CAP = 9999;

/** Cumulative seconds required to start epoch `n` (n=0 → 0). */
const epochStart = (n: number): number =>
    n <= 0 ? 0 : (EPOCH_BASE * (Math.pow(EPOCH_GROWTH, n) - 1)) / (EPOCH_GROWTH - 1);

export interface EpochSnapshot {
    /** Completed epoch count at this session time. */
    count: number;
    /** 0..100 percent through the *current* epoch. */
    progress: number;
    /** Whole-seconds remaining until the next epoch crosses over. */
    remaining: number;
    /** Total length (s) of the current epoch — handy for the "next epoch" label. */
    duration: number;
}

export const epochProgressAt = (seconds: number): EpochSnapshot => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return { count: 0, progress: 0, remaining: EPOCH_BASE, duration: EPOCH_BASE };
    }
    const rawN =
        Math.log(1 + (seconds * (EPOCH_GROWTH - 1)) / EPOCH_BASE) / Math.log(EPOCH_GROWTH);
    const count = Math.min(EPOCH_CAP, Math.floor(rawN));
    const start = epochStart(count);
    const end = epochStart(count + 1);
    const duration = end - start;
    const progress = duration > 0 ? Math.min(100, ((seconds - start) / duration) * 100) : 0;
    const remaining = Math.max(0, Math.ceil(end - seconds));
    return { count, progress, remaining, duration };
};

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
 * given cipher name. Always finite ≥ 1 — never returns Infinity / NaN so
 * downstream cipher-break math can't hang.
 */
export const cipherSpeedMultiplier = (name: string): number => {
    const state = useNeuralNetStore.getState();
    const entry = state.library[name];
    const banked = entry?.seconds ?? 0;
    const inFlight = state.currentCipher === name ? state.sessionSeconds : 0;
    const pts = pointsAt(banked + inFlight);
    const bonus = bonusFromPoints(pts);
    const mult = 1 + bonus / 100;
    return Number.isFinite(mult) ? mult : 1;
};

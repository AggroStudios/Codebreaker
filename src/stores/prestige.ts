import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SkillId } from '../includes/prestige.interface';
import { SKILLS, SKILLS_BY_ID } from '../data/prestigeSkills';

export type PrestigeState = {
    /** SkillId → allocated. Genesis is always allocated. */
    allocated: Record<SkillId, boolean>;

    allocate: (id: SkillId, available: number) => boolean;
    refund: (id: SkillId) => void;
    refundAll: () => void;
};

const INITIAL_ALLOCATED: Record<SkillId, boolean> = { genesis: true };

/**
 * Walks the allocation graph and unsets any skill whose prereqs are no longer
 * met. Repeats until stable. Returns the new allocation map.
 */
const cascadeRefund = (allocated: Record<SkillId, boolean>): Record<SkillId, boolean> => {
    let next = { ...allocated };
    let changed = true;
    while (changed) {
        changed = false;
        for (const skill of SKILLS) {
            if (!next[skill.id]) continue;
            if (skill.requires.length === 0) continue;
            const allPrereqsMet = skill.requires.every((req) => next[req]);
            if (!allPrereqsMet) {
                next = { ...next, [skill.id]: false };
                changed = true;
            }
        }
    }
    return next;
};

export const usePrestigeStore = create<PrestigeState>()(
    persist(
        (set) => ({
            allocated: INITIAL_ALLOCATED,

            allocate: (id, available) => {
                const skill = SKILLS_BY_ID[id];
                if (!skill) return false;
                let didAllocate = false;
                set((state) => {
                    if (state.allocated[id]) return state;
                    if (!skill.requires.every((req) => state.allocated[req])) return state;
                    if (skill.cost > available) return state;
                    didAllocate = true;
                    return { allocated: { ...state.allocated, [id]: true } };
                });
                return didAllocate;
            },

            refund: (id) => set((state) => {
                if (id === 'genesis') return state;
                if (!state.allocated[id]) return state;
                return { allocated: cascadeRefund({ ...state.allocated, [id]: false }) };
            }),

            refundAll: () => set({ allocated: { ...INITIAL_ALLOCATED } }),
        }),
        {
            name: 'prestige-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ allocated: state.allocated }),
            merge: (persisted, current) => {
                const p = (persisted ?? {}) as Partial<PrestigeState>;
                return {
                    ...current,
                    ...p,
                    allocated: { ...INITIAL_ALLOCATED, ...(p.allocated ?? {}) },
                };
            },
        },
    ),
);

/** Total PP spent across every allocated non-root skill. */
export const totalSpentPP = (allocated: Record<SkillId, boolean>): number =>
    SKILLS.reduce((sum, s) => sum + (allocated[s.id] ? s.cost : 0), 0);

/** Count of allocated skills (including Genesis). */
export const skillsAllocated = (allocated: Record<SkillId, boolean>): number =>
    SKILLS.reduce((n, s) => n + (allocated[s.id] ? 1 : 0), 0);

/**
 * Cipher-speed multiplier from allocated prestige skills.
 * - `n1` ("Quick Break") adds +10%.
 * - `n4` ("Quantum Pipelines") adds +20%. Both stack — the skill catalog
 *   explicitly notes Quantum Pipelines "compounds with Quick Break for
 *   total +30% throughput."
 *
 * Returns `1` when neither skill is allocated. Read from outside React
 * via `usePrestigeStore.getState()`.
 */
export const prestigeCipherSpeedMultiplier = (): number => {
    const { allocated } = usePrestigeStore.getState();
    let mult = 1;
    if (allocated.n1) mult += 0.10;
    if (allocated.n4) mult += 0.20;
    return mult;
};

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
    AvatarVariantId,
    CharacterIdentity,
    HackerClassId,
    HomeBaseId,
    OriginId,
} from '../includes/Character.interface';

export interface CharacterDraft {
    step: 1 | 2 | 3;
    classId: HackerClassId;
    callsign: string;
    avatarVariant: AvatarVariantId;
    origin: OriginId | null;
    homeBase: HomeBaseId | null;
}

export interface CharacterStoreState {
    identity: CharacterIdentity | null;
    draft: CharacterDraft;

    setStep: (step: 1 | 2 | 3) => void;
    setDraft: (patch: Partial<CharacterDraft>) => void;
    /** Commits the draft into `identity`, stamping `createdAt`. Returns the new identity, or null if invalid. */
    deploy: () => CharacterIdentity | null;
    /** Clears `identity` and resets the draft to the initial values. */
    reset: () => void;
}

const INITIAL_DRAFT: CharacterDraft = {
    step: 1,
    classId: 'operator',
    callsign: '',
    avatarVariant: 'a',
    origin: null,
    homeBase: null,
};

export const useCharacterStore = create<CharacterStoreState>()(
    persist(
        (set, get) => ({
            identity: null,
            draft: INITIAL_DRAFT,

            setStep: (step) => set((s) => ({ draft: { ...s.draft, step } })),

            setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

            deploy: () => {
                const { draft } = get();
                if (!draft.origin || !draft.homeBase) return null;
                if (draft.callsign.trim().length < 3) return null;
                const identity: CharacterIdentity = {
                    classId: draft.classId,
                    callsign: draft.callsign.trim(),
                    avatarVariant: draft.avatarVariant,
                    origin: draft.origin,
                    homeBase: draft.homeBase,
                    createdAt: Date.now(),
                };
                set({ identity });
                return identity;
            },

            reset: () => set({ identity: null, draft: INITIAL_DRAFT }),
        }),
        {
            name: 'character-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                identity: state.identity,
                draft: state.draft,
            }),
            merge: (persisted, current) => {
                const p = (persisted ?? {}) as Partial<CharacterStoreState>;
                return {
                    ...current,
                    ...p,
                    draft: { ...INITIAL_DRAFT, ...(p.draft ?? {}) },
                };
            },
        },
    ),
);

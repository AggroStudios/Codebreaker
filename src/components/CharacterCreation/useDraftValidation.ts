import { useCharacterStore } from '../../stores/character';
import { validateCallsign } from '../../data/callsignPool';

export interface DraftValidation {
    canAdvance: boolean;
    blockReason: string | null;
}

export const useDraftValidation = (): DraftValidation => {
    const { step, classId, callsign, origin, homeBase } = useCharacterStore((s) => s.draft);

    if (step === 1) {
        if (!classId) return { canAdvance: false, blockReason: 'Pick an operator' };
        return { canAdvance: true, blockReason: null };
    }

    if (step === 2) {
        const v = validateCallsign(callsign);
        if (v.kind === 'empty') return { canAdvance: false, blockReason: 'Pick a callsign' };
        if (v.kind === 'too-short') return { canAdvance: false, blockReason: 'Callsign too short · 3 char min' };
        if (v.kind === 'invalid-chars') return { canAdvance: false, blockReason: 'Callsign has invalid characters' };
        if (v.kind === 'reserved') return { canAdvance: false, blockReason: 'Callsign is reserved' };
        if (!origin) return { canAdvance: false, blockReason: 'Pick an origin' };
        if (!homeBase) return { canAdvance: false, blockReason: 'Pick a home base' };
        return { canAdvance: true, blockReason: null };
    }

    // Step 3: always allowed once gated by step 2.
    return { canAdvance: true, blockReason: null };
};

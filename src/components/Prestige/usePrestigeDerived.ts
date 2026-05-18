import {
    LEVEL_REQUIREMENT_DEFAULT,
    XP_PER_POINT_DEFAULT,
} from '../../includes/prestige.interface';
import { usePlayerStore } from '../../stores/player';
import {
    skillsAllocated,
    totalSpentPP,
    usePrestigeStore,
} from '../../stores/prestige';

export interface PrestigeDerived {
    level: number;
    careerXp: number;
    lifetimePrestiges: number;
    allocated: Record<string, boolean>;
    levelRequirement: number;
    xpPerPoint: number;
    minted: number;
    baseStipend: number;
    totalEarned: number;
    totalSpent: number;
    available: number;
    skillsAllocatedCount: number;
    canPrestige: boolean;
    /** XP banked toward the next PP. */
    xpTowardNext: number;
    xpToGo: number;
}

export const usePrestigeDerived = (): PrestigeDerived => {
    const level = usePlayerStore((s) => s.player.level);
    const careerXp = usePlayerStore((s) => s.player.careerXp);
    const lifetimePrestiges = usePlayerStore((s) => s.player.lifetimePrestiges);
    const allocated = usePrestigeStore((s) => s.allocated);

    const levelRequirement = LEVEL_REQUIREMENT_DEFAULT;
    const xpPerPoint = XP_PER_POINT_DEFAULT;

    const minted = Math.floor(careerXp / xpPerPoint);
    const baseStipend = 5 + lifetimePrestiges * 2;
    const totalEarned = minted + baseStipend;
    const totalSpent = totalSpentPP(allocated);
    const available = Math.max(0, totalEarned - totalSpent);
    const canPrestige = Math.floor(level) >= levelRequirement;

    const xpTowardNext = careerXp % xpPerPoint;
    const xpToGo = xpPerPoint - xpTowardNext;

    return {
        level,
        careerXp,
        lifetimePrestiges,
        allocated,
        levelRequirement,
        xpPerPoint,
        minted,
        baseStipend,
        totalEarned,
        totalSpent,
        available,
        skillsAllocatedCount: skillsAllocated(allocated),
        canPrestige,
        xpTowardNext,
        xpToGo,
    };
};

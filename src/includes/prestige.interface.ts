import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';

export type SkillId = string;
export type BranchId = 'root' | 'N' | 'E' | 'S' | 'W';

export interface BranchInfo {
    color: string;
    label: string;
}

export const BRANCHES: Record<BranchId, BranchInfo> = {
    root: { color: '#0af5b0', label: 'CORE' },
    N:    { color: '#26c6da', label: 'THROUGHPUT' },
    E:    { color: '#0af5b0', label: 'WEALTH' },
    S:    { color: '#b39ddb', label: 'AUTOMATION' },
    W:    { color: '#ff9800', label: 'RECON' },
};

export type Skill = {
    id: SkillId;
    branch: BranchId;
    x: number;
    y: number;
    cost: number;
    name: string;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    short: string;
    requires: SkillId[];
    desc: string;
    capstone?: true;
};

export type SkillStatus = 'allocated' | 'available' | 'unaffordable' | 'locked';

export const WORLD_W = 1600;
export const WORLD_H = 1200;
export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 2.4;
export const ZOOM_STEP = 1.12;
export const FIT_PAD = 0.92;

export const LEVEL_REQUIREMENT_DEFAULT = 50;
export const XP_PER_POINT_DEFAULT = 25_000;

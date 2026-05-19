import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export type IconComponent = OverridableComponent<SvgIconTypeMap<object, 'svg'>>;

export type HackerClassId = 'cipherwright' | 'operator' | 'phantom';
export type StatKey = 'cryptography' | 'hardware' | 'stealth' | 'networking';
export type OriginId = 'basement' | 'dropout' | 'sysadmin';
export type HomeBaseId = 'tyo' | 'rkv' | 'gru' | 'lgs';
export type AvatarVariantId = 'a' | 'b' | 'c' | 'd';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface Perk {
    icon: IconComponent;
    label: string;
    desc: string;
}

export interface StartingKitItem {
    icon: IconComponent;
    name: string;
    qty: string;
    meta: string;
}

export interface SignatureAbility {
    name: string;
    cooldown: string;
    desc: string;
    icon: IconComponent;
}

export interface HackerClass {
    id: HackerClassId;
    callsign: string;
    realName: string;
    classification: string;
    glyph: IconComponent;
    portraitId: string;
    accent: string;
    accentSoft: string;
    accentEdge: string;
    difficulty: DifficultyLevel;
    tagline: string;
    bio: string;
    stats: Record<StatKey, number>;
    perks: Perk[];
    startingKit: StartingKitItem[];
    signature: SignatureAbility;
    recommended: string[];
    /** Starting wallet seeded by Deploy when this class is chosen. */
    startingWallet: number;
}

export interface Origin {
    id: OriginId;
    name: string;
    sub: string;
    bonus: { stat: StatKey; amt: number };
    icon: IconComponent;
    blurb: string;
}

export interface HomeBase {
    id: HomeBaseId;
    city: string;
    name: string;
    meta: string;
    color: string;
}

export interface AvatarVariant {
    id: AvatarVariantId;
    label: string;
    /** Hue-rotate degrees, may be negative. */
    tint: number;
    frame: 'solid' | 'dashed' | 'redact';
}

export interface StatKeyDef {
    key: StatKey;
    label: string;
    icon: IconComponent;
}

/** Persisted on the player after Deploy. */
export interface CharacterIdentity {
    classId: HackerClassId;
    callsign: string;
    avatarVariant: AvatarVariantId;
    origin: OriginId;
    homeBase: HomeBaseId;
    createdAt: number;
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    1: 'NOVICE',
    2: 'EASY',
    3: 'MODERATE',
    4: 'HARD',
    5: 'BRUTAL',
};

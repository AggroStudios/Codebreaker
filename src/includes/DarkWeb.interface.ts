import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { ICipherType } from './Cipher.interface';

export enum RiskTier {
    low = 'Low',
    medium = 'Medium',
    high = 'High',
}

export interface FactionBonus {
    cipher: ICipherType;
    multiplier: number;
}

export interface FactionRelationship {
    faction: IDarkWebFaction;
    relationship: 'friend' | 'enemy';
    reputationFactor: number;
}

export enum ReputationTiers {
    Unknown = 'Unknown',
    Contact = 'Contact',
    Associate = 'Associate',
    Trusted = 'Trusted',
    Insider = 'Insider',
    Kingpin = 'Kingpin',
}

export interface FactionColor {
    color: string;
    className: string;
}

export interface FactionReputation {
    reputation: number;
    reputationTier: ReputationTiers;
}

export interface IDarkWebFaction {
    id: string;
    name: string;
    handle: string;
    glyph: string;
    //glyph: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    color: FactionColor;
    region: string;
    blurb: string;
    reputation?: FactionReputation | null;
    riskTier: RiskTier;
    online: boolean;
    bonus?: FactionBonus[] | null;
    acceptedCiphers: ICipherType[];
    lastActivity?: string | null;
    synergies?: FactionRelationship[] | null;
}

export interface IDarkWebBonus {
    name: string;
    description: string;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    color: string;
    value: number;
}
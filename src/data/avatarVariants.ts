import { AvatarVariant } from '../includes/Character.interface';

export const AVATAR_VARIANTS: AvatarVariant[] = [
    { id: 'a', label: 'Standard', tint:   0, frame: 'solid' },
    { id: 'b', label: 'Negative', tint: -22, frame: 'solid' },
    { id: 'c', label: 'Recon',    tint:  18, frame: 'dashed' },
    { id: 'd', label: 'Redacted', tint:  44, frame: 'redact' },
];

export const AVATAR_VARIANT_BY_ID: Record<string, AvatarVariant> = Object.fromEntries(
    AVATAR_VARIANTS.map((v) => [v.id, v]),
);

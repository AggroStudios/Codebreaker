import { Box, Typography } from '@mui/material';

import { AvatarVariant, IconComponent } from '../../includes/Character.interface';

export type PortraitSize = 'mini' | 'hero' | 'badge' | 'recap';

interface ClassPortraitProps {
    glyph: IconComponent;
    accent: string;
    accentEdge: string;
    portraitId?: string;
    /** Mini=96, hero=168, badge=fills container, recap=64. */
    size?: PortraitSize;
    variant?: AvatarVariant;
}

const DIMENSIONS: Record<PortraitSize, number | string> = {
    mini: 96,
    recap: 40,
    hero: 168,
    badge: '100%',
};

const RADII: Record<PortraitSize, number> = {
    mini: 10,
    recap: 10,
    hero: 12,
    badge: 12,
};

const GLYPH_SCALE: Record<PortraitSize, number> = {
    mini: 56,
    recap: 24,
    hero: 100,
    badge: 88,
};


export default function ClassPortrait({
    glyph: Glyph,
    accent,
    accentEdge,
    portraitId,
    size = 'mini',
    variant,
}: ClassPortraitProps) {
    const dim = DIMENSIONS[size];
    const isBadge = size === 'badge';
    const tint = variant?.tint ?? 0;
    const frame = variant?.frame ?? 'solid';

    return (
        <Box
            sx={{
                position: 'relative',
                width: dim,
                height: isBadge ? undefined : dim,
                aspectRatio: isBadge ? '1 / 1' : undefined,
                borderRadius: `${RADII[size]}px`,
                background: `linear-gradient(135deg, ${accent}26, rgba(0,0,0,0.55))`,
                backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px), linear-gradient(135deg, ${accent}26, rgba(0,0,0,0.55))`,
                border: frame === 'dashed' ? `1px dashed ${accentEdge}` : `1px solid ${accentEdge}`,
                boxShadow: `inset 0 0 ${size === 'hero' ? 48 : 32}px ${accent}1f`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                filter: tint !== 0 ? `hue-rotate(${tint}deg)` : 'none',
                flexShrink: 0,
            }}
        >
            <Glyph
                sx={{
                    fontSize: GLYPH_SCALE[size],
                    color: accent,
                    opacity: 0.88,
                    filter: `drop-shadow(0 0 ${size === 'hero' ? 18 : 12}px ${accent}66)`,
                }}
            />

            {frame === 'redact' && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '40%',
                        left: '8%',
                        right: '8%',
                        height: 8,
                        background: '#000',
                    }}
                />
            )}

            {portraitId && size !== 'badge' && (
                <Typography
                    sx={{
                        position: 'absolute',
                        bottom: 6,
                        left: 8,
                        fontFamily: 'Fira Code, monospace',
                        fontSize: size === 'hero' ? 9 : 8,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        color: accent,
                        opacity: 0.85,
                    }}
                >
                    {portraitId}
                </Typography>
            )}
        </Box>
    );
}

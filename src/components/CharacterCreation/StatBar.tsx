import { Box, Typography } from '@mui/material';

import { IconComponent } from '../../includes/Character.interface';

interface StatBarProps {
    icon: IconComponent;
    label: string;
    /** 0–100 base value. */
    value: number;
    accent: string;
}

const SEGMENTS = 20;

export default function StatBar({ icon: Icon, label, value, accent }: StatBarProps) {
    const lit = Math.round(value / 5);
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Icon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.55)',
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        color: accent,
                        textShadow: `0 0 8px ${accent}55`,
                    }}
                >
                    {value}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: SEGMENTS }, (_, i) => {
                    const on = i < lit;
                    // Topmost 4 lit segments use a softer accent.
                    const isTop = on && i >= lit - 4;
                    const color = on
                        ? isTop
                            ? `${accent}cc`
                            : accent
                        : 'rgba(255,255,255,0.10)';
                    return (
                        <Box
                            key={i}
                            sx={{
                                flex: 1,
                                height: 6,
                                background: color,
                                boxShadow: on ? `0 0 4px ${accent}66` : 'none',
                                borderRadius: 0.5,
                            }}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}

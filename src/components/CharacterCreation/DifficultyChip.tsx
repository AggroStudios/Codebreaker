import { Box, Typography } from '@mui/material';

import { DIFFICULTY_LABELS, DifficultyLevel } from '../../includes/Character.interface';

interface DifficultyChipProps {
    level: DifficultyLevel;
    accent: string;
}

export default function DifficultyChip({ level, accent }: DifficultyChipProps) {
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1,
                py: 0.5,
                borderRadius: 9999,
                background: `${accent}1c`,
                border: `1px solid ${accent}55`,
            }}
        >
            <Box sx={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }, (_, i) => {
                    const on = i < level;
                    return (
                        <Box
                            key={i}
                            sx={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: on ? accent : 'rgba(255,255,255,0.18)',
                                boxShadow: on ? `0 0 6px ${accent}aa` : 'none',
                            }}
                        />
                    );
                })}
            </Box>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: accent,
                }}
            >
                {DIFFICULTY_LABELS[level]}
            </Typography>
        </Box>
    );
}

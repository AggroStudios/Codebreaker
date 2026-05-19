import { Box, Typography } from '@mui/material';
import { CheckTwoTone } from '@mui/icons-material';

import { useCharacterStore } from '../../stores/character';

const STEP_LABELS: Record<1 | 2 | 3, string> = {
    1: 'Choose Operator',
    2: 'Forge Identity',
    3: 'Final Briefing',
};

export default function CharacterStepper() {
    const step = useCharacterStore((s) => s.draft.step);
    const setStep = useCharacterStore((s) => s.setStep);

    return (
        <Box
            sx={{
                display: 'inline-flex',
                gap: 0.5,
                p: 0.5,
                background: 'rgba(25,25,25,0.80)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9999,
            }}
        >
            {[1, 2, 3].map((n) => {
                const idx = n as 1 | 2 | 3;
                const isActive = step === idx;
                const isCompleted = step > idx;
                const isPending = step < idx;
                const clickable = isCompleted;
                return (
                    <Box
                        key={idx}
                        onClick={() => clickable && setStep(idx)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 9999,
                            background: isActive
                                ? 'rgba(10,245,176,0.16)'
                                : 'transparent',
                            color: isActive
                                ? '#0af5b0'
                                : isCompleted
                                    ? 'rgba(10,245,176,0.8)'
                                    : 'rgba(255,255,255,0.4)',
                            cursor: clickable ? 'pointer' : 'default',
                            pointerEvents: clickable ? 'auto' : 'none',
                            transition: 'all 200ms ease',
                        }}
                    >
                        {isCompleted ? (
                            <CheckTwoTone sx={{ fontSize: 14 }} />
                        ) : (
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: isActive
                                        ? '#0af5b0'
                                        : 'rgba(255,255,255,0.18)',
                                    boxShadow: isActive ? '0 0 6px #0af5b0' : 'none',
                                }}
                            />
                        )}
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }}
                        >
                            0{idx} · {isPending ? 'PENDING' : STEP_LABELS[idx]}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

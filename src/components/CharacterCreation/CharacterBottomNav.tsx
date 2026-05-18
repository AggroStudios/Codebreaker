import { Box, Button, Divider, Typography } from '@mui/material';
import {
    ArrowForwardTwoTone,
    CheckCircleTwoTone,
    RocketLaunchTwoTone,
    WarningAmberTwoTone,
} from '@mui/icons-material';

import { useCharacterStore } from '../../stores/character';
import { HACKER_CLASS_BY_ID } from '../../data/hackerClasses';
import { useDraftValidation } from './useDraftValidation';
import ClassPortrait from './ClassPortrait';

interface CharacterBottomNavProps {
    onBack: () => void;
    onAdvance: () => void;
    onOpenDossier: () => void;
}

export default function CharacterBottomNav({
    onBack,
    onAdvance,
    onOpenDossier,
}: CharacterBottomNavProps) {
    const { step, classId, callsign } = useCharacterStore((s) => s.draft);
    const klass = HACKER_CLASS_BY_ID[classId];
    const { canAdvance, blockReason } = useDraftValidation();

    const accent = klass.accent;
    const accentEdge = klass.accentEdge;
    const isDeploy = step === 3;
    const cta = isDeploy ? 'Deploy' : 'Continue';
    const CtaIcon = isDeploy ? RocketLaunchTwoTone : ArrowForwardTwoTone;
    const showDossier = step === 1;

    return (
        <Box
            sx={{
                mt: 3.5,
                p: '16px 22px',
                background: 'rgba(25,25,25,0.88)',
                border: `1px solid ${accentEdge}`,
                borderRadius: '14px',
                boxShadow: `0 0 24px ${accent}22`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, flexShrink: 0 }}>
                    <ClassPortrait
                        glyph={klass.glyph}
                        accent={klass.accent}
                        accentEdge={klass.accentEdge}
                        size="recap"
                    />
                </Box>
                <Box>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            color: accent,
                            textTransform: 'uppercase',
                        }}
                    >
                        Selected · {callsign.trim() || klass.callsign}
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                        {klass.classification}
                    </Typography>
                </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 220 }}>
                {canAdvance ? (
                    <>
                        <CheckCircleTwoTone sx={{ fontSize: 16, color: '#0af5b0' }} />
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 12,
                                color: '#0af5b0',
                            }}
                        >
                            Step {step} ready
                        </Typography>
                    </>
                ) : (
                    <>
                        <WarningAmberTwoTone sx={{ fontSize: 16, color: '#ff9800' }} />
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 12,
                                color: '#ff9800',
                            }}
                        >
                            {blockReason}
                        </Typography>
                    </>
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showDossier && (
                    <Button
                        variant="outlined"
                        onClick={onOpenDossier}
                        sx={{
                            color: accent,
                            borderColor: `${accent}55`,
                            '&:hover': { borderColor: accent, background: `${accent}10` },
                        }}
                    >
                        View Dossier
                    </Button>
                )}
                <Button onClick={onBack} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    disabled={!canAdvance}
                    onClick={onAdvance}
                    startIcon={isDeploy ? <RocketLaunchTwoTone /> : null}
                    endIcon={!isDeploy ? <CtaIcon /> : null}
                    sx={{
                        bgcolor: canAdvance ? accent : 'rgba(255,255,255,0.10)',
                        color: canAdvance ? '#0a0f0d' : 'rgba(255,255,255,0.5)',
                        fontWeight: 700,
                        fontSize: isDeploy ? 16 : 14,
                        boxShadow: canAdvance ? `0 0 24px ${accent}77` : 'none',
                        '&:hover': canAdvance
                            ? { bgcolor: accent, filter: 'brightness(1.15)' }
                            : {},
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(255,255,255,0.10)',
                            color: 'rgba(255,255,255,0.5)',
                        },
                    }}
                >
                    {cta}
                </Button>
            </Box>
        </Box>
    );
}

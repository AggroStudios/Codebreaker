import { Box, Button, Divider, Typography } from '@mui/material';
import { CheckTwoTone } from '@mui/icons-material';

import { HACKER_CLASSES } from '../../data/hackerClasses';
import { STAT_KEYS } from '../../data/statKeys';
import { HackerClass } from '../../includes/Character.interface';
import { useCharacterStore } from '../../stores/character';
import ClassPortrait from './ClassPortrait';
import DifficultyChip from './DifficultyChip';
import StatBar from './StatBar';

interface ChooseOperatorStepProps {
    onOpenDossier: () => void;
}

interface OperatorCardProps {
    klass: HackerClass;
    selected: boolean;
    onSelect: () => void;
    onOpenDossier: () => void;
}

function OperatorCard({ klass, selected, onSelect, onOpenDossier }: OperatorCardProps) {
    const accent = klass.accent;
    return (
        <Box
            onClick={onSelect}
            sx={{
                position: 'relative',
                cursor: 'pointer',
                background: selected
                    ? `linear-gradient(180deg, ${accent}10, rgba(25,25,25,0.92))`
                    : 'rgba(25,25,25,0.82)',
                backdropFilter: 'blur(6px)',
                border: selected ? `1px solid ${klass.accentEdge}` : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                boxShadow: selected
                    ? `0 2px 12px rgba(0,0,0,0.6), 0 0 0 1px ${accent}40 inset, 0 0 32px ${accent}22`
                    : '0 2px 12px rgba(0,0,0,0.6)',
                transform: selected ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 225ms cubic-bezier(0,0,0.2,1), background 225ms, border-color 225ms, box-shadow 225ms',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: selected
                        ? `0 6px 24px rgba(0,0,0,0.8), 0 0 0 1px ${accent}40 inset, 0 0 38px ${accent}33`
                        : '0 6px 24px rgba(0,0,0,0.8)',
                },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Top accent rail */}
            {selected && (
                <Box
                    sx={{
                        height: 3,
                        background: accent,
                        boxShadow: `0 0 12px ${accent}aa`,
                    }}
                />
            )}

            {selected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        borderRadius: 9999,
                        background: accent,
                        color: '#0a0f0d',
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                    }}
                >
                    <CheckTwoTone sx={{ fontSize: 12 }} /> SELECTED
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, p: '20px 20px 16px' }}>
                <ClassPortrait
                    glyph={klass.glyph}
                    accent={klass.accent}
                    accentEdge={klass.accentEdge}
                    portraitId={klass.portraitId}
                    size="mini"
                />
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.20em',
                            color: accent,
                        }}
                    >
                        CLASS · {klass.id.toUpperCase()}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            color: 'rgba(255,255,255,0.96)',
                            lineHeight: 1.1,
                        }}
                    >
                        {klass.callsign}
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            color: 'rgba(255,255,255,0.55)',
                        }}
                    >
                        {klass.classification}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                        <DifficultyChip level={klass.difficulty} accent={accent} />
                    </Box>
                </Box>
            </Box>

            <Box sx={{ px: 2.5, pt: 1.75, pb: 0.5 }}>
                <Typography
                    sx={{
                        fontStyle: 'italic',
                        color: 'rgba(255,255,255,0.78)',
                        fontSize: 13,
                    }}
                >
                    “{klass.tagline}”
                </Typography>
            </Box>

            <Box sx={{ p: 2.5, pt: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {STAT_KEYS.map((k) => (
                    <StatBar
                        key={k.key}
                        icon={k.icon}
                        label={k.label}
                        value={klass.stats[k.key]}
                        accent={accent}
                    />
                ))}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <Box sx={{ p: 2.5 }}>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        color: 'rgba(255,255,255,0.55)',
                        mb: 1,
                    }}
                >
                    // TOP PERKS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {klass.perks.slice(0, 2).map((p) => {
                        const Icon = p.icon;
                        return (
                            <Box key={p.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon sx={{ fontSize: 14, color: accent }} />
                                <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
                                    {p.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
                <Typography
                    sx={{
                        mt: 1,
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.45)',
                        letterSpacing: '0.06em',
                    }}
                >
                    + {klass.perks.length - 2} more · {klass.startingKit.length}-item starting kit
                </Typography>
            </Box>

            <Box sx={{ p: 2.5, pt: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenDossier();
                    }}
                    sx={{
                        borderColor: 'rgba(255,255,255,0.18)',
                        color: 'rgba(255,255,255,0.85)',
                    }}
                >
                    View Dossier
                </Button>
                {selected ? (
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: `${accent}55`,
                            color: accent,
                            '&:hover': { borderColor: accent, background: `${accent}10` },
                        }}
                    >
                        Selected
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                        sx={{
                            bgcolor: accent,
                            color: '#0a0f0d',
                            fontWeight: 700,
                            '&:hover': { bgcolor: accent, filter: 'brightness(1.15)' },
                        }}
                    >
                        Select
                    </Button>
                )}
            </Box>
        </Box>
    );
}

export default function ChooseOperatorStep({ onOpenDossier }: ChooseOperatorStepProps) {
    const classId = useCharacterStore((s) => s.draft.classId);
    const setDraft = useCharacterStore((s) => s.setDraft);

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 2.25,
                alignItems: 'stretch',
            }}
        >
            {HACKER_CLASSES.map((c) => (
                <OperatorCard
                    key={c.id}
                    klass={c}
                    selected={classId === c.id}
                    onSelect={() => setDraft({ classId: c.id })}
                    onOpenDossier={() => {
                        setDraft({ classId: c.id });
                        onOpenDossier();
                    }}
                />
            ))}
        </Box>
    );
}

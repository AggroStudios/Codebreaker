import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import { CheckCircleTwoTone, CloseTwoTone, InfoTwoTone } from '@mui/icons-material';

import { HackerClass } from '../../includes/Character.interface';
import { STAT_KEYS } from '../../data/statKeys';
import ClassPortrait from './ClassPortrait';
import DifficultyChip from './DifficultyChip';
import StatBar from './StatBar';

interface ProfileDossierModalProps {
    open: boolean;
    klass: HackerClass;
    isSelected: boolean;
    onClose: () => void;
    onSelect: () => void;
}

export default function ProfileDossierModal({
    open,
    klass,
    isSelected,
    onClose,
    onSelect,
}: ProfileDossierModalProps) {
    const accent = klass.accent;
    const Sig = klass.signature.icon;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                backdrop: {
                    sx: { background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(6px)' },
                },
                paper: {
                    sx: {
                        width: '100%',
                        maxWidth: 880,
                        maxHeight: 'calc(100vh - 40px)',
                        background: 'rgba(22,22,22,0.96)',
                        border: `1px solid ${klass.accentEdge}`,
                        borderRadius: '14px',
                        boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 32px ${accent}26`,
                    },
                },
                transition: { timeout: { enter: 220, exit: 160 } },
            }}
        >
            {/* Hero header */}
            <Box
                sx={{
                    position: 'relative',
                    p: 3,
                    display: 'flex',
                    gap: 3,
                    background: `linear-gradient(135deg, ${accent}18 0%, transparent 55%), linear-gradient(180deg, ${accent}10, transparent)`,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <ClassPortrait
                        glyph={klass.glyph}
                        accent={klass.accent}
                        accentEdge={klass.accentEdge}
                        size="hero"
                        portraitId={klass.portraitId}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            color: accent,
                        }}
                    >
                        DOSSIER · {klass.portraitId}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 30,
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
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.55)',
                            letterSpacing: '0.04em',
                        }}
                    >
                        {klass.classification}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                        <DifficultyChip level={klass.difficulty} accent={accent} />
                        <MetaChip label={`AKA ${klass.realName}`} />
                        <MetaChip label={`SIG · ${klass.signature.cooldown} CD`} accent={accent} />
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.7)',
                        background: 'rgba(0,0,0,0.30)',
                    }}
                >
                    <CloseTwoTone fontSize="small" />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ p: '20px 24px', display: 'flex', flexDirection: 'column', gap: 2.5, overflow: 'auto' }}>
                <Box>
                    <SectionLabel>// BACKGROUND</SectionLabel>
                    <Typography
                        sx={{
                            fontSize: 14,
                            lineHeight: 1.65,
                            color: 'rgba(255,255,255,0.80)',
                        }}
                    >
                        {klass.bio}
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box
                        sx={{
                            p: 2,
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        <SectionLabel>// ATTRIBUTES</SectionLabel>
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
                    <Box
                        sx={{
                            p: 2,
                            background: `linear-gradient(180deg, ${accent}10, rgba(0,0,0,0.30))`,
                            border: `1px solid ${accent}33`,
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                        }}
                    >
                        <SectionLabel>// SIGNATURE ABILITY</SectionLabel>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '10px',
                                    background: `${accent}1c`,
                                    border: `1px solid ${accent}55`,
                                    color: accent,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Sig sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                                    {klass.signature.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: '0.18em',
                                        color: accent,
                                    }}
                                >
                                    COOLDOWN · {klass.signature.cooldown}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)' }}>
                            {klass.signature.desc}
                        </Typography>
                    </Box>
                </Box>

                <Box>
                    <SectionLabel>// CLASS PERKS</SectionLabel>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        {klass.perks.map((p) => {
                            const Icon = p.icon;
                            return (
                                <Box
                                    key={p.label}
                                    sx={{
                                        display: 'flex',
                                        gap: 1.25,
                                        p: 1.25,
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            background: `${accent}1c`,
                                            border: `1px solid ${accent}55`,
                                            color: accent,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 16 }} />
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                                            {p.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.6)' }}>
                                            {p.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 2 }}>
                    <Box>
                        <SectionLabel>// STARTING KIT</SectionLabel>
                        <Box
                            sx={{
                                background: 'rgba(0,0,0,0.30)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                px: 1.5,
                            }}
                        >
                            {klass.startingKit.map((it, i) => {
                                const Icon = it.icon;
                                const isLast = i === klass.startingKit.length - 1;
                                return (
                                    <Box
                                        key={it.name}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.25,
                                            py: 1.25,
                                            borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: '6px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.10)',
                                                color: 'rgba(255,255,255,0.78)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon sx={{ fontSize: 14 }} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>
                                                {it.name}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Fira Code, monospace',
                                                    fontSize: 10,
                                                    color: 'rgba(255,255,255,0.5)',
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {it.meta}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontFamily: 'Fira Code, monospace',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: accent,
                                            }}
                                        >
                                            {it.qty}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                    <Box>
                        <SectionLabel>// RECOMMENDED FOR</SectionLabel>
                        <Box
                            sx={{
                                p: 1.5,
                                background: 'rgba(0,0,0,0.30)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            {klass.recommended.map((r) => (
                                <Box key={r} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleTwoTone sx={{ fontSize: 16, color: accent }} />
                                    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                                        {r}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: '14px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1 }}>
                    <InfoTwoTone sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            color: 'rgba(255,255,255,0.45)',
                            textTransform: 'uppercase',
                        }}
                    >
                        CLASS LOCKS IN AT PRESTIGE 0 · CAN BE RESPEC'D
                    </Typography>
                </Box>
                <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Back
                </Button>
                {isSelected ? (
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{ borderColor: `${accent}55`, color: accent }}
                    >
                        Currently Selected
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={onSelect}
                        sx={{
                            bgcolor: accent,
                            color: '#0a0f0d',
                            fontWeight: 700,
                            boxShadow: `0 0 24px ${accent}55`,
                            '&:hover': { bgcolor: accent, filter: 'brightness(1.15)' },
                        }}
                    >
                        Select This Operator
                    </Button>
                )}
            </Box>
        </Dialog>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
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
            {children}
        </Typography>
    );
}

function MetaChip({ label, accent }: { label: string; accent?: string }) {
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1,
                py: 0.5,
                borderRadius: 9999,
                background: accent ? `${accent}1c` : 'rgba(255,255,255,0.05)',
                border: accent ? `1px solid ${accent}55` : '1px solid rgba(255,255,255,0.10)',
                color: accent ?? 'rgba(255,255,255,0.75)',
                fontFamily: 'Fira Code, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.14em',
            }}
        >
            {label}
        </Box>
    );
}

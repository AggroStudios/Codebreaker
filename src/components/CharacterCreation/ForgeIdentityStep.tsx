import { Box, Button, InputBase, Typography } from '@mui/material';
import {
    CheckCircleTwoTone,
    ShuffleTwoTone,
    WarningAmberTwoTone,
} from '@mui/icons-material';

import { AVATAR_VARIANTS } from '../../data/avatarVariants';
import { HOME_BASES } from '../../data/homeBases';
import { ORIGINS } from '../../data/origins';
import { HACKER_CLASS_BY_ID } from '../../data/hackerClasses';
import { STAT_KEYS } from '../../data/statKeys';
import { useCharacterStore } from '../../stores/character';
import { randomCallsign, validateCallsign } from '../../data/callsignPool';
import { StatKey } from '../../includes/Character.interface';
import ClassPortrait from './ClassPortrait';

function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
            }}
        >
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                }}
            >
                {children}
            </Typography>
            {right}
        </Box>
    );
}

function IdBadgePreview() {
    const { classId, callsign, avatarVariant, origin, homeBase } = useCharacterStore(
        (s) => s.draft,
    );
    const klass = HACKER_CLASS_BY_ID[classId];
    const variant = AVATAR_VARIANTS.find((v) => v.id === avatarVariant);
    const originData = origin ? ORIGINS.find((o) => o.id === origin) : null;
    const baseData = homeBase ? HOME_BASES.find((b) => b.id === homeBase) : null;
    const validity = validateCallsign(callsign);
    const accent = klass.accent;

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 20,
                background: 'rgba(25,25,25,0.82)',
                border: `1px solid ${accent}33`,
                borderRadius: '14px',
                overflow: 'hidden',
                backdropFilter: 'blur(6px)',
            }}
        >
            <Box
                sx={{
                    px: 1.75,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: `${accent}1a`,
                    borderBottom: `1px solid ${accent}33`,
                }}
            >
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        color: accent,
                    }}
                >
                    OPERATOR ID · PREVIEW
                </Typography>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.55)',
                    }}
                >
                    {klass.portraitId}-{avatarVariant.toUpperCase()}
                </Typography>
            </Box>
            <Box sx={{ p: 1.75 }}>
                <ClassPortrait
                    glyph={klass.glyph}
                    accent={klass.accent}
                    accentEdge={klass.accentEdge}
                    size="badge"
                    variant={variant}
                />
            </Box>
            <Box sx={{ p: 1.75, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            color: accent,
                        }}
                    >
                        $ HANDLE
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 22,
                            fontWeight: 700,
                            color: validity.kind === 'ok' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)',
                            lineHeight: 1.2,
                        }}
                    >
                        {validity.kind === 'ok' ? callsign : '— unset —'}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                        {klass.callsign} · {klass.classification.split(' · ')[0]}
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box
                        sx={{
                            p: 1,
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                color: 'rgba(255,255,255,0.55)',
                                mb: 0.5,
                            }}
                        >
                            ORIGIN
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                            {originData?.name ?? '—'}
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 10,
                                color: 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {originData ? `+${originData.bonus.amt} ${originData.bonus.stat}` : 'unset'}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 1,
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                color: 'rgba(255,255,255,0.55)',
                                mb: 0.5,
                            }}
                        >
                            BASE
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: baseData?.color ?? 'rgba(255,255,255,0.85)',
                            }}
                        >
                            {baseData?.city ?? '—'}
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 10,
                                color: 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {baseData?.name ?? 'unset'}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function CallsignField() {
    const callsign = useCharacterStore((s) => s.draft.callsign);
    const setDraft = useCharacterStore((s) => s.setDraft);
    const validity = validateCallsign(callsign);

    const borderColor =
        validity.kind === 'ok'
            ? '#0af5b0'
            : validity.kind === 'reserved'
                ? '#f44336'
                : validity.kind === 'empty'
                    ? 'rgba(255,255,255,0.18)'
                    : '#ff9800';

    const statusFor = (): { color: string; label: string; icon?: React.ReactNode } | null => {
        switch (validity.kind) {
            case 'empty':
                return {
                    color: 'rgba(255,255,255,0.55)',
                    label: '3–20 chars · letters, numbers, & . _ -',
                };
            case 'too-short':
                return { color: '#ff9800', label: 'TOO SHORT · 3 char min', icon: <WarningAmberTwoTone fontSize="inherit" /> };
            case 'invalid-chars':
                return { color: '#ff9800', label: 'INVALID CHARACTER', icon: <WarningAmberTwoTone fontSize="inherit" /> };
            case 'reserved':
                return { color: '#f44336', label: 'HANDLE TAKEN · pick another', icon: <WarningAmberTwoTone fontSize="inherit" /> };
            case 'ok':
                return { color: '#0af5b0', label: 'AVAILABLE · routing to leaderboard…', icon: <CheckCircleTwoTone fontSize="inherit" /> };
        }
    };

    const status = statusFor();

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 1.75,
                    py: 1.25,
                    background: 'rgba(0,0,0,0.40)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderBottom: `2px solid ${borderColor}`,
                    borderRadius: '8px 8px 0 0',
                }}
            >
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 18,
                        color: '#0af5b0',
                        flexShrink: 0,
                    }}
                >
                    $
                </Typography>
                <InputBase
                    fullWidth
                    value={callsign}
                    onChange={(e) => setDraft({ callsign: e.target.value })}
                    inputProps={{ maxLength: 20, spellCheck: false }}
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.92)',
                    }}
                />
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.45)',
                        flexShrink: 0,
                    }}
                >
                    {callsign.length}/20
                </Typography>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShuffleTwoTone />}
                    onClick={() => setDraft({ callsign: randomCallsign(callsign) })}
                    sx={{
                        borderColor: 'rgba(255,255,255,0.18)',
                        color: 'rgba(255,255,255,0.85)',
                        flexShrink: 0,
                    }}
                >
                    Shuffle
                </Button>
            </Box>
            {status && (
                <Box
                    sx={{
                        px: 1.75,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        background: `${status.color}14`,
                        border: `1px solid ${status.color}30`,
                        borderRadius: '0 0 8px 8px',
                        color: status.color,
                    }}
                >
                    {status.icon}
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            color: status.color,
                        }}
                    >
                        {status.label}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

function AvatarPicker() {
    const { classId, avatarVariant } = useCharacterStore((s) => s.draft);
    const setDraft = useCharacterStore((s) => s.setDraft);
    const klass = HACKER_CLASS_BY_ID[classId];

    return (
        <Box
            sx={{
                p: 1.5,
                background: 'rgba(0,0,0,0.30)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
            }}
        >
            <SectionLabel>// AVATAR VARIANT</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {AVATAR_VARIANTS.map((v) => {
                    const active = avatarVariant === v.id;
                    return (
                        <Box
                            key={v.id}
                            onClick={() => setDraft({ avatarVariant: v.id })}
                            sx={{
                                cursor: 'pointer',
                                p: 0.75,
                                background: active ? `${klass.accent}1c` : 'rgba(255,255,255,0.03)',
                                border: active
                                    ? `1px solid ${klass.accentEdge}`
                                    : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                                filter: active ? 'none' : 'saturate(0.7) brightness(0.85)',
                                transition: 'all 225ms cubic-bezier(0,0,0.2,1)',
                            }}
                        >
                            <ClassPortrait
                                glyph={klass.glyph}
                                accent={klass.accent}
                                accentEdge={klass.accentEdge}
                                size="recap"
                                variant={v}
                            />
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: '0.14em',
                                    color: active ? klass.accent : 'rgba(255,255,255,0.55)',
                                }}
                            >
                                {v.label.toUpperCase()}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function HomeBasePicker() {
    const homeBase = useCharacterStore((s) => s.draft.homeBase);
    const setDraft = useCharacterStore((s) => s.setDraft);

    return (
        <Box
            sx={{
                p: 1.5,
                background: 'rgba(0,0,0,0.30)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
            }}
        >
            <SectionLabel>// HOME BASE</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {HOME_BASES.map((b) => {
                    const active = homeBase === b.id;
                    return (
                        <Box
                            key={b.id}
                            onClick={() => setDraft({ homeBase: b.id })}
                            sx={{
                                cursor: 'pointer',
                                p: 1.25,
                                background: active ? `${b.color}1c` : 'rgba(255,255,255,0.03)',
                                border: active ? `1px solid ${b.color}55` : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': { background: active ? `${b.color}26` : 'rgba(255,255,255,0.06)' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    background: b.color,
                                    boxShadow: `0 0 6px ${b.color}aa`,
                                }}
                            />
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: active ? b.color : 'rgba(255,255,255,0.85)',
                                    }}
                                >
                                    {b.city}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 10,
                                        letterSpacing: '0.06em',
                                        color: 'rgba(255,255,255,0.55)',
                                    }}
                                >
                                    {b.name} · {b.meta}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

const STAT_LABEL: Record<StatKey, string> = {
    cryptography: 'CRYPTO',
    hardware: 'HARDWARE',
    stealth: 'STEALTH',
    networking: 'NETWORK',
};

function OriginPicker() {
    const origin = useCharacterStore((s) => s.draft.origin);
    const classId = useCharacterStore((s) => s.draft.classId);
    const setDraft = useCharacterStore((s) => s.setDraft);
    const klass = HACKER_CLASS_BY_ID[classId];

    return (
        <Box>
            <SectionLabel right={
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.35)',
                        letterSpacing: '0.06em',
                    }}
                >
                    +5 starting attribute · cosmetic flavor
                </Typography>
            }>
                // ORIGIN STORY
            </SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {ORIGINS.map((o) => {
                    const active = origin === o.id;
                    const Icon = o.icon;
                    const StatIcon = STAT_KEYS.find((s) => s.key === o.bonus.stat)?.icon;
                    return (
                        <Box
                            key={o.id}
                            onClick={() => setDraft({ origin: o.id })}
                            sx={{
                                cursor: 'pointer',
                                p: 1.75,
                                background: active ? `${klass.accent}10` : 'rgba(255,255,255,0.03)',
                                border: active ? `1px solid ${klass.accentEdge}` : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                boxShadow: active ? `0 0 24px ${klass.accent}22` : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                position: 'relative',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '8px',
                                        background: active ? `${klass.accent}1c` : 'rgba(255,255,255,0.05)',
                                        border: active ? `1px solid ${klass.accent}55` : '1px solid rgba(255,255,255,0.10)',
                                        color: active ? klass.accent : 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
                                        {o.name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: 'Fira Code, monospace',
                                            fontSize: 10,
                                            letterSpacing: '0.06em',
                                            color: 'rgba(255,255,255,0.5)',
                                        }}
                                    >
                                        {o.sub}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    lineHeight: 1.5,
                                    color: 'rgba(255,255,255,0.70)',
                                }}
                            >
                                {o.blurb}
                            </Typography>
                            <Box sx={{ mt: 'auto' }}>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 9999,
                                        background: active ? klass.accent : `${klass.accent}1c`,
                                        color: active ? '#0a0f0d' : klass.accent,
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: '0.14em',
                                    }}
                                >
                                    {StatIcon && <StatIcon sx={{ fontSize: 12 }} />}
                                    +{o.bonus.amt} {STAT_LABEL[o.bonus.stat]}
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default function ForgeIdentityStep() {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)',
                gap: 2.75,
                alignItems: 'flex-start',
            }}
        >
            <IdBadgePreview />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                    <SectionLabel>// CALLSIGN</SectionLabel>
                    <CallsignField />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.25 }}>
                    <AvatarPicker />
                    <HomeBasePicker />
                </Box>
                <OriginPicker />
            </Box>
        </Box>
    );
}

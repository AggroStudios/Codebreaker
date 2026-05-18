import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import {
    AssignmentTwoTone,
    CheckCircleTwoTone,
    PriorityHighTwoTone,
    TagTwoTone,
} from '@mui/icons-material';

import { AVATAR_VARIANT_BY_ID } from '../../data/avatarVariants';
import { HACKER_CLASS_BY_ID } from '../../data/hackerClasses';
import { HOME_BASE_BY_ID } from '../../data/homeBases';
import { ORIGIN_BY_ID } from '../../data/origins';
import { useCharacterStore } from '../../stores/character';
import ClassPortrait from './ClassPortrait';

function TransmissionTerminal() {
    const { classId, callsign, origin, homeBase } = useCharacterStore((s) => s.draft);
    const klass = HACKER_CLASS_BY_ID[classId];
    const accent = klass.accent;
    const originData = origin ? ORIGIN_BY_ID[origin] : null;
    const baseData = homeBase ? HOME_BASE_BY_ID[homeBase] : null;

    const lines: { kind: 'mute' | 'sys' | 'cyan' | 'white' | 'ok'; text: ReactNode }[] = [
        { kind: 'mute', text: '$ ssh handler@cb-station.onion' },
        { kind: 'sys', text: '[ OK ] tunnel established · ed25519 · 2048-bit' },
        {
            kind: 'cyan',
            text: (
                <>
                    handshake: hi{' '}
                    <span style={{ color: accent, textShadow: `0 0 8px ${accent}66` }}>
                        {callsign || klass.callsign.toLowerCase()}
                    </span>
                    , welcome to the floor.
                </>
            ),
        },
        { kind: 'mute', text: '—' },
        {
            kind: 'white',
            text: (
                <>
                    The grid wants names like yours. You came up out of{' '}
                    <strong>{originData?.name ?? 'somewhere quiet'}</strong> and that's exactly the
                    kind of profile we move ciphers through.
                </>
            ),
        },
        {
            kind: 'white',
            text: (
                <>
                    You'll run as a{' '}
                    <em style={{ color: 'rgba(255,255,255,0.92)' }}>
                        {klass.callsign.toLowerCase()}
                    </em>
                    {baseData
                        ? ` out of ${baseData.city} (${baseData.name}).`
                        : " — pick a home base when you're ready."}{' '}
                    Stay quiet. Stay paid.
                </>
            ),
        },
        { kind: 'mute', text: '—' },
        {
            kind: 'ok',
            text: (
                <>
                    [ ✓ ] Briefing complete · awaiting{' '}
                    <Box
                        component="span"
                        sx={{
                            background: accent,
                            color: '#0a0f0d',
                            px: 0.5,
                            borderRadius: '2px',
                            fontWeight: 700,
                            fontFamily: 'Fira Code, monospace',
                        }}
                    >
                        DEPLOY
                    </Box>
                </>
            ),
        },
    ];

    return (
        <Box
            sx={{
                background: 'rgba(0,0,0,0.40)',
                border: `1px solid ${accent}33`,
                borderRadius: '10px',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    px: 1.75,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.04)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                        className="char-live-dot"
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: accent,
                            boxShadow: `0 0 6px ${accent}aa`,
                        }}
                    />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            color: accent,
                        }}
                    >
                        INCOMING TRANSMISSION
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                        <Box
                            key={c}
                            sx={{ width: 8, height: 8, borderRadius: '50%', background: c }}
                        />
                    ))}
                </Box>
            </Box>
            <Box
                sx={{
                    background: '#000',
                    p: 2,
                    minHeight: 220,
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                }}
            >
                {lines.map((l, i) => {
                    const color =
                        l.kind === 'mute'
                            ? 'rgba(255,255,255,0.45)'
                            : l.kind === 'sys'
                                ? 'rgba(255,255,255,0.55)'
                                : l.kind === 'cyan'
                                    ? '#26c6da'
                                    : l.kind === 'ok'
                                        ? accent
                                        : 'rgba(255,255,255,0.92)';
                    return (
                        <Box key={i} sx={{ color }}>
                            {l.text}
                        </Box>
                    );
                })}
                <Box
                    className="char-cursor"
                    sx={{
                        display: 'inline-block',
                        width: 8,
                        height: 14,
                        background: accent,
                        mt: 0.5,
                    }}
                />
            </Box>
        </Box>
    );
}

function FirstContractCard() {
    return (
        <Box
            sx={{
                p: 2,
                background: 'rgba(25,25,25,0.82)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <AssignmentTwoTone sx={{ fontSize: 16, color: '#26c6da' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            color: 'rgba(255,255,255,0.85)',
                            textTransform: 'uppercase',
                        }}
                    >
                        First Contract
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 9999,
                        background: 'rgba(40,255,40,0.12)',
                        border: '1px solid rgba(40,255,40,0.45)',
                        color: '#28ff28',
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                    }}
                >
                    RISK · LOW
                </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 1.5, alignItems: 'center' }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '10px',
                        background: 'radial-gradient(circle at 50% 50%, rgba(10,245,176,0.30), transparent 70%)',
                        border: '1px solid rgba(10,245,176,0.45)',
                        color: '#0af5b0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TagTwoTone sx={{ fontSize: 26 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
                        Crack a CRC-32 checksum
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.55)',
                            letterSpacing: '0.04em',
                        }}
                    >
                        JOB-0001 · ~45s · payout in fiat · no heat
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography
                        sx={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#28ff28',
                            textShadow: '0 0 10px rgba(40,255,40,0.6)',
                            lineHeight: 1.1,
                        }}
                    >
                        + $250
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            color: 'rgba(255,255,255,0.4)',
                        }}
                    >
                        +25 XP
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

function DefRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                '&:last-of-type': { borderBottom: 'none' },
                gap: 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.55)' }}>
                {icon}
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{label}</Typography>
            </Box>
            <Box>{value}</Box>
        </Box>
    );
}

function IdentityRecap() {
    const { classId, callsign, avatarVariant, origin, homeBase } = useCharacterStore((s) => s.draft);
    const klass = HACKER_CLASS_BY_ID[classId];
    const variant = AVATAR_VARIANT_BY_ID[avatarVariant];
    const originData = origin ? ORIGIN_BY_ID[origin] : null;
    const baseData = homeBase ? HOME_BASE_BY_ID[homeBase] : null;
    const accent = klass.accent;

    return (
        <Box
            sx={{
                p: 2,
                background: 'rgba(25,25,25,0.82)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
            }}
        >
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.55)',
                    mb: 1.5,
                }}
            >
                // IDENTITY DOSSIER
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <ClassPortrait
                    glyph={klass.glyph}
                    accent={klass.accent}
                    accentEdge={klass.accentEdge}
                    size="recap"
                    variant={variant}
                />
                <Box>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.92)',
                            lineHeight: 1.1,
                        }}
                    >
                        {callsign || '—'}
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            color: accent,
                        }}
                    >
                        {klass.callsign}
                    </Typography>
                </Box>
            </Box>
            <DefRow
                label="Class"
                value={
                    <Typography sx={{ fontFamily: 'Fira Code, monospace', fontSize: 13, fontWeight: 500, color: accent }}>
                        {klass.callsign}
                    </Typography>
                }
            />
            <DefRow
                label="Origin"
                icon={originData ? <originData.icon sx={{ fontSize: 14 }} /> : null}
                value={
                    <Typography sx={{ fontFamily: 'Fira Code, monospace', fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>
                        {originData?.name ?? '—'}
                    </Typography>
                }
            />
            <DefRow
                label="Base"
                value={
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 13,
                            color: baseData?.color ?? 'rgba(255,255,255,0.92)',
                        }}
                    >
                        {baseData ? `${baseData.city} · ${baseData.name}` : '—'}
                    </Typography>
                }
            />
            <DefRow
                label="Bonus"
                value={
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 13,
                            color: '#28ff28',
                            textShadow: '0 0 8px rgba(40,255,40,0.6)',
                        }}
                    >
                        {originData ? `+${originData.bonus.amt} ${originData.bonus.stat.toUpperCase()}` : '—'}
                    </Typography>
                }
            />
            <DefRow
                label="Signature"
                value={
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 13,
                            color: accent,
                        }}
                    >
                        {klass.signature.name} · {klass.signature.cooldown} CD
                    </Typography>
                }
            />
        </Box>
    );
}

interface ChecklistRow {
    kind: 'ok' | 'warn';
    label: string;
    sub?: string;
}

function PreflightChecklist() {
    const { classId } = useCharacterStore((s) => s.draft);
    const klass = HACKER_CLASS_BY_ID[classId];

    const rows: ChecklistRow[] = [
        { kind: 'ok', label: 'Operator class assigned' },
        { kind: 'ok', label: 'Callsign reserved' },
        { kind: 'ok', label: 'Starting kit transferred', sub: `${klass.startingKit.length} items + seed wallet` },
        { kind: 'ok', label: 'Tunnel encrypted', sub: 'ed25519 · 2048-bit' },
        { kind: 'warn', label: 'Tutorial mission queued', sub: 'can be skipped from Settings' },
    ];

    return (
        <Box
            sx={{
                p: 2,
                background: 'rgba(25,25,25,0.82)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.55)',
                    mb: 0.5,
                }}
            >
                // PRE-FLIGHT
            </Typography>
            {rows.map((r) => {
                const color = r.kind === 'ok' ? '#0af5b0' : '#ff9800';
                const Icon = r.kind === 'ok' ? CheckCircleTwoTone : PriorityHighTwoTone;
                return (
                    <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '6px',
                                background: `${color}1c`,
                                border: `1px solid ${color}66`,
                                color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Icon sx={{ fontSize: 12 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                                {r.label}
                            </Typography>
                            {r.sub && (
                                <Typography
                                    sx={{
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 11,
                                        color: 'rgba(255,255,255,0.55)',
                                    }}
                                >
                                    {r.sub}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

export default function FinalBriefingStep() {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
                gap: 2.75,
                alignItems: 'flex-start',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                <TransmissionTerminal />
                <FirstContractCard />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                <IdentityRecap />
                <PreflightChecklist />
            </Box>
        </Box>
    );
}

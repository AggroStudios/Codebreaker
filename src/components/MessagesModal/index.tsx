import { useMemo, useState, type ReactNode } from 'react';

import {
    Box,
    Button,
    Dialog,
    IconButton,
    InputBase,
    LinearProgress,
    MenuItem,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

import MarkEmailUnreadTwoTone from '@mui/icons-material/MarkEmailUnreadTwoTone';
import EditTwoTone from '@mui/icons-material/EditTwoTone';
import RemoveTwoTone from '@mui/icons-material/RemoveTwoTone';
import CropSquareTwoTone from '@mui/icons-material/CropSquareTwoTone';
import CloseTwoTone from '@mui/icons-material/CloseTwoTone';
import SearchTwoTone from '@mui/icons-material/SearchTwoTone';
import FilterAltOffTwoTone from '@mui/icons-material/FilterAltOffTwoTone';
import SelectAllTwoTone from '@mui/icons-material/SelectAllTwoTone';
import AttachFileTwoTone from '@mui/icons-material/AttachFileTwoTone';
import LockTwoTone from '@mui/icons-material/LockTwoTone';
import LockOpenTwoTone from '@mui/icons-material/LockOpenTwoTone';
import WarningTwoTone from '@mui/icons-material/WarningTwoTone';
import PriorityHighTwoTone from '@mui/icons-material/PriorityHighTwoTone';
import VerifiedTwoTone from '@mui/icons-material/VerifiedTwoTone';
import ForumTwoTone from '@mui/icons-material/ForumTwoTone';
import ReplyTwoTone from '@mui/icons-material/ReplyTwoTone';
import ReplyAllTwoTone from '@mui/icons-material/ReplyAllTwoTone';
import ForwardTwoTone from '@mui/icons-material/ForwardTwoTone';
import BookmarkAddTwoTone from '@mui/icons-material/BookmarkAddTwoTone';
import ArchiveTwoTone from '@mui/icons-material/ArchiveTwoTone';
import LocalFireDepartmentTwoTone from '@mui/icons-material/LocalFireDepartmentTwoTone';
import DescriptionTwoTone from '@mui/icons-material/DescriptionTwoTone';
import DataObjectTwoTone from '@mui/icons-material/DataObjectTwoTone';
import ExtensionTwoTone from '@mui/icons-material/ExtensionTwoTone';
import InsertDriveFileTwoTone from '@mui/icons-material/InsertDriveFileTwoTone';
import SendTwoTone from '@mui/icons-material/SendTwoTone';
import AddTwoTone from '@mui/icons-material/AddTwoTone';
import SaveTwoTone from '@mui/icons-material/SaveTwoTone';
import DeleteTwoTone from '@mui/icons-material/DeleteTwoTone';
// Faction sigil glyphs (mirrors the dark-web faction registry's glyph strings).
import Memory from '@mui/icons-material/Memory';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import LocalFireDepartmentOutlined from '@mui/icons-material/LocalFireDepartmentOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import GavelRounded from '@mui/icons-material/GavelRounded';
import HubOutlined from '@mui/icons-material/HubOutlined';

import { LiveDot } from '../common';
import GlyphWall from '../common/GlyphWall';
import { darkWebFactions } from '../../data/darkWebFactions';
import {
    MESSAGE_FOLDERS,
    factionById,
    toFactionMessage,
} from '../../data/factionMessages';
import { SAMPLE_MESSAGES } from '../../data/sampleMessages';
import { IDarkWebFaction, RiskTier } from '../../includes/DarkWeb.interface';
import {
    FactionMessage,
    MessageBodyBlock,
    MessageAttachment,
} from '../../includes/messages.interface';
import { usePlayerStore } from '../../stores/player';
import { classConfigFor } from '../../data/classConfig';

type SvgIcon = OverridableComponent<SvgIconTypeMap<object, 'svg'>>;

const MONO = 'var(--font-code)';
const UI = 'var(--font-ui)';
const DANGER = '#ff5f6d';
const VIOLET = '#9b8cff';

/**
 * The active operator class's accent hex (e.g. `#26c6da`), matching the app-wide
 * accent driven by `player.classId`. Returned as a hex so the `${ACCENT}<alpha>`
 * concatenations used throughout the modal stay valid. Each component reads it
 * via `const ACCENT = useAccent();`.
 */
const useAccent = (): string =>
    classConfigFor(usePlayerStore((s) => s.player.classId)).accent;

const FACTION_GLYPHS: Record<string, SvgIcon> = {
    Memory,
    SecurityOutlined,
    LocalFireDepartmentOutlined,
    VisibilityOffOutlined,
    GavelRounded,
    HubOutlined,
};

const RISK_LABEL: Record<RiskTier, { label: string; color: string }> = {
    [RiskTier.low]: { label: 'LOW', color: '#0af5b0' },
    [RiskTier.medium]: { label: 'MED', color: '#26c6da' },
    [RiskTier.high]: { label: 'HIGH', color: '#ff9800' },
};

export interface MessagesModalProps {
    open: boolean;
    onClose: () => void;
    /** Mark a store message read by its index (fired on thread-row select). */
    onSelectMessage: (index: number) => void;
    /** Dispatch a composed transmission (routes through OperatingSystem.sendMessage). */
    onTransmit: (recipient: string, body: string) => void;
}

// ── shared atoms ────────────────────────────────────────────────────────────

function ChromeChip({
    children,
    color,
    sx,
}: {
    children: ReactNode;
    color?: string;
    sx?: SxProps<Theme>;
}) {
    return (
        <Box
            component="span"
            sx={{
                px: '8px',
                py: '4px',
                fontSize: 10,
                fontFamily: MONO,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: color || 'rgba(255,255,255,0.7)',
                border: `1px solid ${color ? color + '55' : 'rgba(255,255,255,0.16)'}`,
                borderRadius: '3px',
                background: color ? color + '14' : 'rgba(255,255,255,0.03)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                whiteSpace: 'nowrap',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

function FactionSigil({
    faction,
    size = 28,
    glyphSize,
}: {
    faction?: IDarkWebFaction;
    size?: number;
    glyphSize?: number;
}) {
    const g = glyphSize ?? Math.round(size * 0.55);
    const radius = `${Math.max(4, Math.round(size / 6))}px`;
    if (!faction) {
        return (
            <Box
                sx={{
                    width: size,
                    height: size,
                    flexShrink: 0,
                    borderRadius: radius,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)',
                }}
            >
                <ForumTwoTone sx={{ fontSize: g }} />
            </Box>
        );
    }
    const color = faction.color.color;
    const Icon = FACTION_GLYPHS[faction.glyph] ?? ForumTwoTone;
    return (
        <Box
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: radius,
                background: `linear-gradient(180deg, ${color}33, ${color}0a)`,
                border: `1px solid ${color}66`,
                boxShadow: `0 0 ${Math.round(size / 3)}px ${color}33, inset 0 0 ${Math.round(size / 4)}px ${color}1a`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
            }}
        >
            <Icon sx={{ fontSize: g }} />
        </Box>
    );
}

function RiskTag({ tier }: { tier: RiskTier }) {
    const { label, color } = RISK_LABEL[tier];
    return <ChromeChip color={color}>{label} RISK</ChromeChip>;
}

function PriorityDot({ msg }: { msg: FactionMessage }) {
    const color = msg.flagged
        ? DANGER
        : msg.priority === 'high'
          ? '#ff9800'
          : msg.priority === 'low'
            ? 'rgba(255,255,255,0.20)'
            : 'rgba(255,255,255,0.45)';
    const glow = msg.flagged || msg.priority === 'high';
    return (
        <Box
            component="span"
            sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: color,
                boxShadow: glow ? `0 0 6px ${color}` : 'none',
                display: 'inline-block',
                flexShrink: 0,
            }}
        />
    );
}

function SectionLabel({ children }: { children: ReactNode }) {
    const ACCENT = useAccent();
    return (
        <Box
            sx={{
                fontSize: 10,
                fontFamily: MONO,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.42)',
                p: '6px 8px 10px',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Box
                component="span"
                sx={{
                    width: 6,
                    height: 6,
                    background: ACCENT,
                    borderRadius: '50%',
                    mr: 1,
                    boxShadow: `0 0 6px ${ACCENT}`,
                }}
            />
            {children}
        </Box>
    );
}

// ── window chrome ─────────────────────────────────────────────────────────

function WindowChrome({ onClose, onCompose }: { onClose: () => void; onCompose: () => void }) {
    const ACCENT = useAccent();
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                p: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                    sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '4px',
                        background: `linear-gradient(180deg, ${ACCENT}, #003d35)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 10px ${ACCENT}66`,
                    }}
                >
                    <MarkEmailUnreadTwoTone sx={{ fontSize: 13, color: '#0a0f0d' }} />
                </Box>
                <Box
                    sx={{
                        fontFamily: MONO,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: ACCENT,
                        textShadow: `0 0 8px ${ACCENT}55`,
                    }}
                >
                    SECURE_COMMS
                </Box>
                <Box component="span" sx={{ color: 'rgba(255,255,255,0.18)' }}>
                    /
                </Box>
                <Box
                    sx={{
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        color: 'rgba(255,255,255,0.55)',
                        textTransform: 'uppercase',
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    Faction Mail
                </Box>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                <LiveDot color="green" online />
                <Box
                    sx={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.65)',
                    }}
                >
                    Onion routed · 7 hops · AES-256-GCM
                </Box>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Button
                onClick={onCompose}
                startIcon={<EditTwoTone />}
                sx={{
                    background: `linear-gradient(90deg, ${ACCENT}26, ${ACCENT}08)`,
                    border: `1px solid ${ACCENT}55`,
                    color: ACCENT,
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    p: '6px 12px',
                    borderRadius: '4px',
                    textShadow: `0 0 8px ${ACCENT}55`,
                    '&:hover': { background: `linear-gradient(90deg, ${ACCENT}40, ${ACCENT}12)` },
                }}
            >
                Compose
            </Button>

            <Box sx={{ display: 'flex', gap: 0.5, ml: 0.5 }}>
                {[RemoveTwoTone, CropSquareTwoTone].map((Icon, i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.10)',
                            color: 'rgba(255,255,255,0.55)',
                            display: { xs: 'none', sm: 'flex' },
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon sx={{ fontSize: 14 }} />
                    </Box>
                ))}
                <IconButton
                    onClick={onClose}
                    aria-label="Close messages"
                    sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        color: DANGER,
                        p: 0,
                        '&:hover': {
                            background: 'rgba(255,95,109,0.18)',
                            borderColor: 'rgba(255,95,109,0.5)',
                        },
                    }}
                >
                    <CloseTwoTone sx={{ fontSize: 14 }} />
                </IconButton>
            </Box>
        </Box>
    );
}

// ── left rail ───────────────────────────────────────────────────────────────

function LeftRail({
    folderId,
    onFolder,
    factionFilter,
    onFactionFilter,
    folderCounts,
    unreadByFaction,
}: {
    folderId: string;
    onFolder: (id: string) => void;
    factionFilter: string | null;
    onFactionFilter: (id: string | null) => void;
    folderCounts: Record<string, number>;
    unreadByFaction: Record<string, number>;
}) {
    const ACCENT = useAccent();
    return (
        <Box
            sx={{
                width: 240,
                flexShrink: 0,
                borderRight: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent 30%)',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ p: '14px 14px 8px', overflow: 'auto', flex: 1 }}>
                <SectionLabel>Folders</SectionLabel>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '1px', mb: 2.25 }}>
                    {MESSAGE_FOLDERS.map((f) => {
                        const Icon = f.icon;
                        const active = folderId === f.id;
                        const count = folderCounts[f.id] ?? 0;
                        return (
                            <Box
                                component="li"
                                key={f.id}
                                onClick={() => onFolder(f.id)}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '20px 1fr auto',
                                    alignItems: 'center',
                                    gap: 1.25,
                                    p: '8px 10px 8px 12px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    borderLeft: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                                    background: active ? `linear-gradient(90deg, ${ACCENT}1c, ${ACCENT}03 90%)` : 'transparent',
                                    color: active ? ACCENT : 'rgba(255,255,255,0.78)',
                                    fontFamily: MONO,
                                    fontSize: 12,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    fontWeight: active ? 600 : 500,
                                    textShadow: active ? `0 0 8px ${ACCENT}55` : 'none',
                                    transition: 'background 150ms ease, color 150ms ease',
                                    '&:hover': active ? {} : { background: 'rgba(255,255,255,0.04)' },
                                }}
                            >
                                <Icon sx={{ fontSize: 16 }} />
                                <span>{f.label}</span>
                                {count > 0 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: active ? ACCENT : 'rgba(255,255,255,0.55)',
                                            background: active ? `${ACCENT}1c` : 'rgba(255,255,255,0.05)',
                                            p: '2px 6px',
                                            borderRadius: '3px',
                                            minWidth: 22,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {count}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>

                <SectionLabel>
                    Factions
                    <Box
                        component="span"
                        sx={{ ml: 1, fontSize: 9, fontFamily: MONO, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}
                    >
                        · {darkWebFactions.length} contacts
                    </Box>
                </SectionLabel>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <Box
                        component="li"
                        onClick={() => onFactionFilter(null)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            p: '7px 10px 7px 12px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderLeft: !factionFilter ? `2px solid ${ACCENT}` : '2px solid transparent',
                            background: !factionFilter ? 'rgba(10,245,176,0.08)' : 'transparent',
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: !factionFilter ? ACCENT : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        <SelectAllTwoTone sx={{ fontSize: 14 }} />
                        <span>All factions</span>
                    </Box>
                    {darkWebFactions.map((f) => {
                        const active = factionFilter === f.id;
                        const unread = unreadByFaction[f.id] ?? 0;
                        return (
                            <Box
                                component="li"
                                key={f.id}
                                onClick={() => onFactionFilter(active ? null : f.id)}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '22px 1fr auto',
                                    alignItems: 'center',
                                    gap: 1.25,
                                    p: '7px 10px 7px 12px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    borderLeft: active ? `2px solid ${f.color.color}` : '2px solid transparent',
                                    background: active ? `linear-gradient(90deg, ${f.color.color}1c, transparent 90%)` : 'transparent',
                                    transition: 'background 150ms ease',
                                    '&:hover': active ? {} : { background: 'rgba(255,255,255,0.04)' },
                                }}
                            >
                                <FactionSigil faction={f} size={22} glyphSize={12} />
                                <Box sx={{ minWidth: 0 }}>
                                    <Box sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {f.name}
                                    </Box>
                                    <Box sx={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {f.handle}
                                    </Box>
                                </Box>
                                {unread > 0 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            fontSize: 9,
                                            fontWeight: 700,
                                            fontFamily: MONO,
                                            color: f.color.color,
                                            background: `${f.color.color}1c`,
                                            p: '2px 5px',
                                            borderRadius: '3px',
                                            border: `1px solid ${f.color.color}44`,
                                            minWidth: 18,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {unread}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Box
                sx={{
                    p: '10px 14px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(0,0,0,0.32)',
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    color: 'rgba(255,255,255,0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>STORAGE</span>
                    <Box component="span" sx={{ color: 'rgba(255,255,255,0.75)' }}>23%</Box>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={23}
                    sx={{
                        height: 3,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': { background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` },
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <span>NODE</span>
                    <Box component="span" sx={{ color: 'rgba(255,255,255,0.75)' }}>aggro-04</Box>
                </Box>
            </Box>
        </Box>
    );
}

// ── thread list ─────────────────────────────────────────────────────────────

function ThreadRow({
    msg,
    selected,
    onSelect,
}: {
    msg: FactionMessage;
    selected: boolean;
    onSelect: () => void;
}) {
    const ACCENT = useAccent();
    const faction = factionById(msg.factionId);
    return (
        <Box
            component="li"
            onClick={onSelect}
            sx={{
                position: 'relative',
                p: '14px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
                background: selected
                    ? `linear-gradient(90deg, ${ACCENT}14, ${ACCENT}03 90%)`
                    : msg.unread
                      ? 'rgba(255,255,255,0.025)'
                      : 'transparent',
                borderLeft: selected ? `2px solid ${ACCENT}` : '2px solid transparent',
                transition: 'background 120ms ease',
                '&:hover': selected ? {} : { background: 'rgba(255,255,255,0.045)' },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FactionSigil faction={faction} size={22} glyphSize={12} />
                <Box
                    component="span"
                    sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: msg.unread ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.7)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                    }}
                >
                    {msg.factionName}
                </Box>
                <PriorityDot msg={msg} />
                <Box component="span" sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)' }}>
                    {msg.time}
                </Box>
            </Box>

            <Box
                sx={{
                    mt: 0.75,
                    fontSize: 13,
                    fontWeight: msg.unread ? 600 : 500,
                    color: msg.unread ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.65)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {msg.unread && (
                    <Box
                        component="span"
                        sx={{ display: 'inline-block', width: 6, height: 6, background: ACCENT, borderRadius: '50%', mr: 1, boxShadow: `0 0 6px ${ACCENT}`, verticalAlign: 'middle' }}
                    />
                )}
                {msg.warning && <WarningTwoTone sx={{ fontSize: 13, color: '#ff9800', mr: 0.75, verticalAlign: 'middle' }} />}
                {msg.subject}
            </Box>

            <Box
                sx={{
                    mt: 0.5,
                    fontSize: 11.5,
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.45,
                    fontFamily: msg.locked ? MONO : UI,
                    letterSpacing: msg.locked ? '0.04em' : 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    filter: msg.locked ? 'blur(3px)' : 'none',
                }}
            >
                {msg.preview}
            </Box>

            <Box sx={{ mt: 1, display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                {msg.encrypted && (
                    <Box component="span" sx={{ fontSize: 9, fontFamily: MONO, color: ACCENT, letterSpacing: '0.16em', display: 'inline-flex', alignItems: 'center', gap: 0.375 }}>
                        {msg.locked ? <LockTwoTone sx={{ fontSize: 11 }} /> : <LockOpenTwoTone sx={{ fontSize: 11 }} />}
                        {msg.locked ? 'SEALED' : 'ENCRYPTED'}
                    </Box>
                )}
                {msg.attachments.length > 0 && (
                    <Box component="span" sx={{ fontSize: 9, fontFamily: MONO, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em', display: 'inline-flex', alignItems: 'center', gap: 0.375 }}>
                        <AttachFileTwoTone sx={{ fontSize: 11 }} />
                        {msg.attachments.length}
                    </Box>
                )}
                <Box component="span" sx={{ flex: 1 }} />
                <Box component="span" sx={{ fontSize: 9, fontFamily: MONO, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.10em' }}>
                    {msg.id}
                </Box>
            </Box>
        </Box>
    );
}

function ThreadList({
    messages,
    selectedId,
    onSelect,
    query,
    onQuery,
}: {
    messages: FactionMessage[];
    selectedId: string | undefined;
    onSelect: (msg: FactionMessage) => void;
    query: string;
    onQuery: (q: string) => void;
}) {
    const ACCENT = useAccent();
    return (
        <Box
            sx={{
                width: { xs: '100%', md: 360 },
                flexShrink: 0,
                borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(0,0,0,0.18)',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ p: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: '7px 10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: '4px',
                    }}
                >
                    <SearchTwoTone sx={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }} />
                    <InputBase
                        value={query}
                        onChange={(e) => onQuery(e.target.value)}
                        placeholder="grep inbox…"
                        sx={{ flex: 1, color: 'rgba(255,255,255,0.92)', fontFamily: MONO, fontSize: 12, letterSpacing: '0.04em', '& input': { p: 0 } }}
                    />
                    {query && (
                        <IconButton onClick={() => onQuery('')} sx={{ p: 0, color: 'rgba(255,255,255,0.4)' }}>
                            <CloseTwoTone sx={{ fontSize: 14 }} />
                        </IconButton>
                    )}
                </Box>
                <Box
                    sx={{
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.45)',
                    }}
                >
                    <span>{messages.length} thread{messages.length === 1 ? '' : 's'}</span>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Sort: <Box component="span" sx={{ color: ACCENT }}>newest ↓</Box>
                    </Box>
                </Box>
            </Box>

            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, overflow: 'auto', flex: 1 }}>
                {messages.length === 0 ? (
                    <Box
                        component="li"
                        sx={{
                            p: '40px 20px',
                            textAlign: 'center',
                            fontFamily: MONO,
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                        }}
                    >
                        <FilterAltOffTwoTone sx={{ fontSize: 28, color: 'rgba(255,255,255,0.2)', display: 'block', m: '0 auto 10px' }} />
                        no threads match
                    </Box>
                ) : (
                    messages.map((m) => (
                        <ThreadRow key={m.id} msg={m} selected={selectedId === m.id} onSelect={() => onSelect(m)} />
                    ))
                )}
            </Box>
        </Box>
    );
}

// ── message body ────────────────────────────────────────────────────────────

function MetaCell({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
    const ACCENT = useAccent();
    return (
        <>
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
                {label}
            </Box>
            <Box component="span" sx={{ color: accent ? ACCENT : 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value}
            </Box>
        </>
    );
}

function BodyBlock({ block, prevType }: { block: MessageBodyBlock; prevType?: string }) {
    const ACCENT = useAccent();
    switch (block.type) {
        case 'line':
            return <Box sx={{ mb: 1.5 }}>{block.text}</Box>;
        case 'para':
            return <Box component="p" sx={{ m: '0 0 14px', color: 'rgba(255,255,255,0.82)' }}>{block.text}</Box>;
        case 'callout':
            return (
                <Box sx={{ my: 2, p: '14px 16px', border: `1px dashed ${ACCENT}66`, background: `linear-gradient(90deg, ${ACCENT}14, ${ACCENT}05)`, borderRadius: '6px' }}>
                    <Box sx={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: ACCENT, mb: 0.75, fontWeight: 700 }}>
                        {block.label}
                    </Box>
                    <Box sx={{ fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.02em' }}>{block.text}</Box>
                </Box>
            );
        case 'warn':
            return (
                <Box sx={{ my: 1.75, p: '12px 14px', background: 'rgba(255,95,109,0.08)', border: '1px solid rgba(255,95,109,0.4)', borderRadius: '6px', color: '#ffb3ba', fontWeight: 500, display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                    <WarningTwoTone sx={{ fontSize: 18, color: DANGER, mt: 0.25 }} />
                    <span>{block.text}</span>
                </Box>
            );
        case 'table':
            return (
                <Box sx={{ my: 1.75, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', fontFamily: MONO, fontSize: 13 }}>
                    {block.rows.map((r, j) => (
                        <Box
                            key={j}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                p: '8px 12px',
                                background: j % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                borderBottom: j === block.rows.length - 1 ? 0 : '1px solid rgba(255,255,255,0.04)',
                            }}
                        >
                            <Box component="span" sx={{ color: 'rgba(255,255,255,0.85)' }}>{r[0]}</Box>
                            <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{r[1]}</Box>
                            <Box component="span" sx={{ color: r[2].startsWith('-') ? DANGER : '#28ff28' }}>{r[2]}</Box>
                        </Box>
                    ))}
                </Box>
            );
        case 'sig':
            return (
                <Box sx={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', mt: prevType === 'sig' ? '2px' : '18px' }}>
                    {block.text}
                </Box>
            );
        case 'locked':
            return (
                <Box sx={{ my: 1.5, p: '14px 16px', background: 'rgba(155,140,255,0.06)', border: '1px solid rgba(155,140,255,0.4)', borderRadius: '6px', color: 'rgba(255,255,255,0.85)', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <LockTwoTone sx={{ fontSize: 20, color: VIOLET }} />
                    <span>{block.text}</span>
                </Box>
            );
        default:
            return null;
    }
}

function SealedView({ faction }: { faction?: IDarkWebFaction }) {
    return (
        <Box
            sx={{
                p: '36px 24px',
                textAlign: 'center',
                maxWidth: 480,
                mx: 'auto',
                border: '1px dashed rgba(155,140,255,0.5)',
                background: 'linear-gradient(180deg, rgba(155,140,255,0.08), rgba(0,0,0,0.2))',
                borderRadius: '8px',
            }}
        >
            <LockTwoTone sx={{ fontSize: 42, color: VIOLET, display: 'block', m: '0 auto 12px' }} />
            <Box sx={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: VIOLET, mb: 1.25, fontWeight: 700 }}>
                Sealed Transmission
            </Box>
            <Box sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, mb: 2.25 }}>
                {faction?.name ?? 'This contact'} requires proof-of-skill before this message decrypts. Solve the embedded challenge to reveal contents.
            </Box>
            <Button
                sx={{
                    p: '10px 18px',
                    background: 'rgba(155,140,255,0.16)',
                    border: '1px solid rgba(155,140,255,0.5)',
                    color: '#cfc6ff',
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                }}
            >
                Begin Challenge →
            </Button>
        </Box>
    );
}

function AttachmentCard({ att }: { att: MessageAttachment }) {
    const ACCENT = useAccent();
    // `contract` tracks the class accent; `data`/`challenge` are semantic colors.
    const palette: Record<string, { Icon: SvgIcon; color: string }> = {
        contract: { Icon: DescriptionTwoTone, color: ACCENT },
        data: { Icon: DataObjectTwoTone, color: '#26c6da' },
        challenge: { Icon: ExtensionTwoTone, color: VIOLET },
    };
    const { Icon, color } = palette[att.kind] ?? { Icon: InsertDriveFileTwoTone, color: 'rgba(255,255,255,0.6)' };
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '6px',
                minWidth: 200,
                cursor: 'pointer',
                transition: 'border-color 150ms ease, background 150ms ease',
                '&:hover': { borderColor: `${color}88`, background: `${color}08` },
            }}
        >
            <Box sx={{ width: 30, height: 30, borderRadius: '5px', background: `${color}1a`, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                <Icon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.88)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                    {att.name}
                </Box>
                <Box sx={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', mt: 0.25 }}>
                    {att.kind} · {att.size}
                </Box>
            </Box>
        </Box>
    );
}

function ActionButton({
    icon: Icon,
    children,
    onClick,
    tone,
}: {
    icon: SvgIcon;
    children: ReactNode;
    onClick?: () => void;
    tone?: 'accent' | 'danger';
}) {
    const ACCENT = useAccent();
    const isAccent = tone === 'accent';
    const isDanger = tone === 'danger';
    const color = isAccent ? ACCENT : isDanger ? DANGER : 'rgba(255,255,255,0.78)';
    const bg = isAccent ? `linear-gradient(90deg, ${ACCENT}22, ${ACCENT}06)` : isDanger ? 'rgba(255,95,109,0.06)' : 'rgba(255,255,255,0.04)';
    const border = isAccent ? `${ACCENT}55` : isDanger ? 'rgba(255,95,109,0.4)' : 'rgba(255,255,255,0.12)';
    return (
        <Button
            onClick={onClick}
            startIcon={<Icon />}
            sx={{
                p: '8px 12px',
                background: bg,
                border: `1px solid ${border}`,
                color,
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                borderRadius: '4px',
                textShadow: isAccent ? `0 0 8px ${ACCENT}55` : 'none',
                '&:hover': {
                    background: isAccent ? `linear-gradient(90deg, ${ACCENT}40, ${ACCENT}10)` : isDanger ? 'rgba(255,95,109,0.14)' : 'rgba(255,255,255,0.08)',
                },
            }}
        >
            {children}
        </Button>
    );
}

function MessageBody({ msg, onReply }: { msg: FactionMessage | null; onReply: () => void }) {
    const ACCENT = useAccent();
    if (!msg) {
        return (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, p: 5, color: 'rgba(255,255,255,0.3)', fontFamily: MONO, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 12 }}>
                <ForumTwoTone sx={{ fontSize: 56, color: 'rgba(255,255,255,0.15)' }} />
                <div>No message selected</div>
            </Box>
        );
    }
    const faction = factionById(msg.factionId);
    const factionColor = faction?.color.color ?? 'rgba(255,255,255,0.3)';

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <Box sx={{ p: '18px 22px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: `linear-gradient(180deg, ${factionColor}10 0%, transparent 100%)`, position: 'relative', overflow: 'hidden' }}>
                {faction && <GlyphWall color={faction.color.className} count={14} />}
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', mb: 1.25, display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                        <Box component="span" sx={{ color: factionColor }}>{msg.id}</Box>
                        <Box component="span" sx={{ color: 'rgba(255,255,255,0.2)' }}>·</Box>
                        <span>received {msg.relTime}</span>
                        <Box component="span" sx={{ color: 'rgba(255,255,255,0.2)' }}>·</Box>
                        <span>thread depth 1</span>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
                        <FactionSigil faction={faction} size={44} glyphSize={22} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25, mb: 0.5, flexWrap: 'wrap' }}>
                                <Box component="span" sx={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{msg.factionName}</Box>
                                <Box component="span" sx={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{msg.from}</Box>
                            </Box>
                            <Typography component="h2" sx={{ m: 0, fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em', fontWeight: 600, color: 'rgba(255,255,255,0.96)' }}>
                                {msg.flagged && <PriorityHighTwoTone sx={{ fontSize: 20, color: DANGER, mr: 0.75, verticalAlign: 'middle' }} />}
                                {msg.subject}
                            </Typography>
                        </Box>
                        {faction && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
                                <RiskTag tier={faction.riskTier} />
                                <Box component="span" sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)' }}>{faction.region}</Box>
                            </Box>
                        )}
                    </Box>

                    <Box
                        sx={{
                            mt: 1.75,
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto 1fr',
                            gap: '4px 14px',
                            fontFamily: MONO,
                            fontSize: 10.5,
                            letterSpacing: '0.06em',
                            pt: 1.5,
                            borderTop: '1px dashed rgba(255,255,255,0.08)',
                        }}
                    >
                        <MetaCell label="ROUTE" value={`onion · ${msg.hops} hops`} />
                        <MetaCell label="CIPHER" value={msg.cipher} accent />
                        <MetaCell label="FINGERPRINT" value={msg.fingerprint} />
                        <MetaCell
                            label="VERIFY"
                            value={
                                <Box component="span" sx={{ color: ACCENT, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                    <VerifiedTwoTone sx={{ fontSize: 12 }} /> SIGNED
                                </Box>
                            }
                        />
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: '22px 26px' }}>
                {msg.locked ? (
                    <SealedView faction={faction} />
                ) : (
                    <Box sx={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.82)', maxWidth: 720 }}>
                        {msg.body.map((b, i) => (
                            <BodyBlock key={i} block={b} prevType={msg.body[i - 1]?.type} />
                        ))}
                    </Box>
                )}

                {msg.attachments.length > 0 && (
                    <Box sx={{ mt: 3.5 }}>
                        <Box sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', mb: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFileTwoTone sx={{ fontSize: 12, color: ACCENT }} />
                            Attachments · {msg.attachments.length}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                            {msg.attachments.map((a, i) => (
                                <AttachmentCard key={i} att={a} />
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>

            <Box sx={{ p: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <ActionButton icon={ReplyTwoTone} tone="accent" onClick={onReply}>Reply</ActionButton>
                <ActionButton icon={ReplyAllTwoTone}>Reply All</ActionButton>
                <ActionButton icon={ForwardTwoTone}>Forward</ActionButton>
                <Box sx={{ flex: 1 }} />
                <ActionButton icon={BookmarkAddTwoTone}>Flag</ActionButton>
                <ActionButton icon={ArchiveTwoTone}>Archive</ActionButton>
                <ActionButton icon={LocalFireDepartmentTwoTone} tone="danger">Burn</ActionButton>
            </Box>
        </Box>
    );
}

// ── compose view ──────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 1.75, alignItems: 'center', p: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Box component="span" sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', fontWeight: 700 }}>
                {label}
            </Box>
            <Box>{children}</Box>
        </Box>
    );
}

const CIPHERS = ['AES-256-GCM', 'ChaCha20-Poly1305', 'XChaCha20+ECDH'];
const HOPS = [3, 5, 7, 9, 12];

function ComposeView({
    accentInitialFaction,
    initialSubject,
    replyTo,
    onSend,
    onDiscard,
}: {
    accentInitialFaction: string;
    initialSubject: string;
    replyTo: string | null;
    onSend: (recipient: string, body: string) => void;
    onDiscard: () => void;
}) {
    const ACCENT = useAccent();
    const [factionId, setFactionId] = useState(accentInitialFaction);
    const [subject, setSubject] = useState(initialSubject);
    const [body, setBody] = useState('');
    const [cipher, setCipher] = useState(CIPHERS[0]);
    const [hops, setHops] = useState(7);
    const [attached, setAttached] = useState<string[]>([]);
    const faction = factionById(factionId || null);
    const canSend = Boolean(factionId) && subject.trim().length > 0;

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <Box sx={{ p: '18px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: `linear-gradient(180deg, ${(faction?.color.color ?? ACCENT)}10 0%, transparent 100%)`, position: 'relative' }}>
                {faction && <GlyphWall color={faction.color.className} count={14} />}
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: ACCENT, mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <LiveDot color="green" online />
                        {replyTo ? `Reply · ${replyTo}` : 'New transmission'}
                        <Box component="span" sx={{ color: 'rgba(255,255,255,0.2)' }}>·</Box>
                        <Box component="span" sx={{ color: 'rgba(255,255,255,0.5)' }}>auto-encrypted</Box>
                    </Box>

                    <FieldRow label="TO">
                        <Select
                            value={factionId}
                            onChange={(e) => setFactionId(e.target.value)}
                            displayEmpty
                            variant="standard"
                            disableUnderline
                            renderValue={(val) => {
                                const f = factionById((val as string) || null);
                                if (!f) return <Box component="span" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Select recipient…</Box>;
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                        <FactionSigil faction={f} size={22} glyphSize={12} />
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Box sx={{ fontSize: 13, fontWeight: 600 }}>{f.name}</Box>
                                            <Box sx={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{f.handle} · {f.region}</Box>
                                        </Box>
                                    </Box>
                                );
                            }}
                            sx={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.10)',
                                borderRadius: '4px',
                                p: '4px 8px',
                                '& .MuiSelect-select': { p: 0, display: 'flex', alignItems: 'center' },
                            }}
                        >
                            {darkWebFactions.map((f) => (
                                <MenuItem key={f.id} value={f.id} sx={{ gap: 1.25 }}>
                                    <FactionSigil faction={f} size={22} glyphSize={12} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ fontSize: 12, fontWeight: 600 }}>{f.name}</Box>
                                        <Box sx={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{f.handle} · {f.region}</Box>
                                    </Box>
                                    <ChromeChip color={RISK_LABEL[f.riskTier].color}>{RISK_LABEL[f.riskTier].label}</ChromeChip>
                                </MenuItem>
                            ))}
                        </Select>
                    </FieldRow>

                    <FieldRow label="SUBJECT">
                        <InputBase
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Untitled transmission…"
                            sx={{ width: '100%', color: 'rgba(255,255,255,0.92)', fontSize: 16, fontWeight: 500, fontFamily: UI, '& input': { p: '6px 0' } }}
                        />
                    </FieldRow>

                    <FieldRow label="CIPHER">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                            <ToggleButtonGroup
                                exclusive
                                value={cipher}
                                onChange={(_, v) => v && setCipher(v)}
                                sx={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.10)',
                                    borderRadius: '4px',
                                    p: '2px',
                                    '& .MuiToggleButton-root': {
                                        border: 0,
                                        color: 'rgba(255,255,255,0.65)',
                                        fontFamily: MONO,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: '0.14em',
                                        textTransform: 'uppercase',
                                        borderRadius: '3px',
                                        p: '5px 10px',
                                    },
                                    '& .Mui-selected': {
                                        background: `${ACCENT}26 !important`,
                                        color: `${ACCENT} !important`,
                                        textShadow: `0 0 6px ${ACCENT}55`,
                                    },
                                }}
                            >
                                {CIPHERS.map((c) => (
                                    <ToggleButton key={c} value={c}>{c}</ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            <Box component="span" sx={{ color: 'rgba(255,255,255,0.18)' }}>·</Box>
                            <Box component="span" sx={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Hops</Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                {HOPS.map((h) => (
                                    <Box
                                        component="button"
                                        key={h}
                                        onClick={() => setHops(h)}
                                        sx={{
                                            width: 28,
                                            height: 24,
                                            p: 0,
                                            background: hops === h ? `${ACCENT}26` : 'rgba(255,255,255,0.04)',
                                            border: hops === h ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.10)',
                                            color: hops === h ? ACCENT : 'rgba(255,255,255,0.65)',
                                            fontFamily: MONO,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            textShadow: hops === h ? `0 0 6px ${ACCENT}55` : 'none',
                                        }}
                                    >
                                        {h}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </FieldRow>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: '20px 26px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <TextField
                    multiline
                    minRows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={'> Operator,\n>\n> Compose your transmission. Avoid identifiers in plaintext — encryption will scrub but the cipher must hold past the next rotation.\n>\n> — operator'}
                    sx={{
                        flex: 1,
                        '& .MuiInputBase-root': {
                            height: '100%',
                            alignItems: 'flex-start',
                            background: 'rgba(0,0,0,0.35)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '6px',
                            color: 'rgba(255,255,255,0.92)',
                            fontFamily: MONO,
                            fontSize: 13,
                            lineHeight: 1.65,
                            letterSpacing: '0.02em',
                            p: '14px 16px',
                            transition: 'border-color 150ms ease, box-shadow 150ms ease',
                        },
                        '& .MuiInputBase-root.Mui-focused': { borderColor: `${ACCENT}88`, boxShadow: `0 0 16px ${ACCENT}22` },
                        '& fieldset': { border: 0 },
                    }}
                />

                <Box sx={{ mt: 1.75, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {attached.map((a) => (
                        <ChromeChip key={a} color={ACCENT}>
                            <AttachFileTwoTone sx={{ fontSize: 11 }} />
                            {a}
                            <Box component="button" onClick={() => setAttached(attached.filter((x) => x !== a))} sx={{ background: 'transparent', border: 0, color: ACCENT, cursor: 'pointer', p: 0, ml: 0.5, display: 'flex' }}>
                                <CloseTwoTone sx={{ fontSize: 11 }} />
                            </Box>
                        </ChromeChip>
                    ))}
                    <Box
                        component="button"
                        onClick={() => setAttached([...attached, `cipher_lot_${Math.floor(Math.random() * 99)}.crypt`])}
                        sx={{
                            p: '4px 10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px dashed rgba(255,255,255,0.18)',
                            color: 'rgba(255,255,255,0.65)',
                            fontFamily: MONO,
                            fontSize: 10,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            borderRadius: '3px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.625,
                        }}
                    >
                        <AddTwoTone sx={{ fontSize: 11 }} />
                        Attach cipher
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Box sx={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockTwoTone sx={{ fontSize: 13, color: ACCENT }} />
                    Will encrypt with <Box component="span" sx={{ color: ACCENT, ml: 0.5 }}>{cipher}</Box> over {hops} hops
                </Box>
                <Box sx={{ flex: 1 }} />
                <ActionButton icon={SaveTwoTone}>Save Draft</ActionButton>
                <ActionButton icon={DeleteTwoTone} tone="danger" onClick={onDiscard}>Discard</ActionButton>
                <Button
                    onClick={() => canSend && onSend(faction?.name ?? factionId, body)}
                    disabled={!canSend}
                    startIcon={<SendTwoTone />}
                    sx={{
                        p: '8px 16px',
                        background: canSend ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT}cc)` : 'rgba(255,255,255,0.06)',
                        color: canSend ? '#0a0f0d' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${canSend ? ACCENT : 'rgba(255,255,255,0.10)'}`,
                        fontFamily: MONO,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.20em',
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        boxShadow: canSend ? `0 0 16px ${ACCENT}55` : 'none',
                        '&.Mui-disabled': { color: 'rgba(255,255,255,0.4)' },
                    }}
                >
                    Transmit
                </Button>
            </Box>
        </Box>
    );
}

// ── corner brackets ───────────────────────────────────────────────────────

function CornerBrackets() {
    const ACCENT = useAccent();
    const base = {
        position: 'absolute' as const,
        width: 16,
        height: 16,
        borderColor: `${ACCENT}55`,
        borderStyle: 'solid',
        pointerEvents: 'none' as const,
        zIndex: 2,
    };
    return (
        <>
            <Box sx={{ ...base, top: -1, left: -1, borderWidth: '1.5px 0 0 1.5px' }} />
            <Box sx={{ ...base, top: -1, right: -1, borderWidth: '1.5px 1.5px 0 0' }} />
            <Box sx={{ ...base, bottom: -1, left: -1, borderWidth: '0 0 1.5px 1.5px' }} />
            <Box sx={{ ...base, bottom: -1, right: -1, borderWidth: '0 1.5px 1.5px 0' }} />
        </>
    );
}

// ── main modal ──────────────────────────────────────────────────────────────

export default function MessagesModal({ open, onClose, onSelectMessage, onTransmit }: MessagesModalProps) {
    const messages = usePlayerStore((s) => s.player.messages);
    const ACCENT = useAccent();

    const [folderId, setFolderId] = useState('inbox');
    const [factionFilter, setFactionFilter] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [view, setView] = useState<'read' | 'compose'>('read');
    // Ids marked read this session — keeps selection feedback working for the
    // sample fallback (whose source isn't the player store).
    const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

    const all = useMemo(() => {
        // Preview the design with the sample faction-mail when the inbox is empty.
        const source = messages.length > 0 ? messages : SAMPLE_MESSAGES;
        const base = source.map(toFactionMessage);
        return readIds.size === 0
            ? base
            : base.map((m) => (m.unread && readIds.has(m.id) ? { ...m, unread: false } : m));
    }, [messages, readIds]);

    const folderCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const folder of MESSAGE_FOLDERS) {
            counts[folder.id] = folder.filter ? all.filter(folder.filter).length : 0;
        }
        return counts;
    }, [all]);

    const unreadByFaction = useMemo(() => {
        const m: Record<string, number> = {};
        for (const msg of all) {
            if (msg.factionId && msg.unread) m[msg.factionId] = (m[msg.factionId] ?? 0) + 1;
        }
        return m;
    }, [all]);

    const filtered = useMemo(() => {
        let out = all;
        const folder = MESSAGE_FOLDERS.find((f) => f.id === folderId);
        if (folder?.filter) out = out.filter(folder.filter);
        if (factionFilter) out = out.filter((m) => m.factionId === factionFilter);
        const q = query.trim().toLowerCase();
        if (q) {
            out = out.filter(
                (m) =>
                    m.subject.toLowerCase().includes(q) ||
                    m.preview.toLowerCase().includes(q) ||
                    m.factionName.toLowerCase().includes(q),
            );
        }
        return out;
    }, [all, folderId, factionFilter, query]);

    const selected = useMemo(
        () => filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null,
        [filtered, selectedId],
    );

    const handleSelect = (msg: FactionMessage) => {
        setSelectedId(msg.id);
        if (msg.unread) {
            onSelectMessage(msg.index);
            setReadIds((prev) => new Set(prev).add(msg.id));
        }
    };

    const unread = all.filter((m) => m.unread).length;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                backdrop: { sx: { background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(2px)' } },
                paper: {
                    sx: {
                        position: 'relative',
                        width: 'min(1380px, 100%)',
                        height: 'min(820px, 100%)',
                        minHeight: { xs: 'auto', sm: 600 },
                        m: 3,
                        background: 'rgba(12,16,18,0.92)',
                        border: `1px solid ${ACCENT}55`,
                        borderRadius: '6px',
                        boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${ACCENT}1a`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <CornerBrackets />
            <WindowChrome onClose={onClose} onCompose={() => setView('compose')} />

            <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
                <LeftRail
                    folderId={folderId}
                    onFolder={setFolderId}
                    factionFilter={factionFilter}
                    onFactionFilter={setFactionFilter}
                    folderCounts={folderCounts}
                    unreadByFaction={unreadByFaction}
                />

                {view === 'compose' ? (
                    <ComposeView
                        accentInitialFaction={selected?.factionId ?? ''}
                        initialSubject={selected ? `Re: ${selected.subject}` : ''}
                        replyTo={selected?.id ?? null}
                        onSend={(recipient, body) => {
                            onTransmit(recipient, body);
                            setView('read');
                        }}
                        onDiscard={() => setView('read')}
                    />
                ) : (
                    <>
                        <ThreadList
                            messages={filtered}
                            selectedId={selected?.id}
                            onSelect={handleSelect}
                            query={query}
                            onQuery={setQuery}
                        />
                        <MessageBody msg={selected} onReply={() => setView('compose')} />
                    </>
                )}
            </Box>

            <Box
                sx={{
                    p: '8px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.75,
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    flexWrap: 'wrap',
                }}
            >
                <Box component="span" sx={{ color: ACCENT, display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                    <LiveDot color="green" online /> Channel Open
                </Box>
                <Box component="span" sx={{ color: 'rgba(255,255,255,0.18)' }}>·</Box>
                <span>LATENCY 142ms</span>
                <Box component="span" sx={{ color: 'rgba(255,255,255,0.18)' }}>·</Box>
                <span>NEXT ROTATION 02:14:38</span>
                <Box component="span" sx={{ flex: 1 }} />
                <span>{unread} UNREAD · {all.length} TOTAL</span>
            </Box>
        </Dialog>
    );
}

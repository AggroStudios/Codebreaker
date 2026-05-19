import { useMemo, useState } from 'react';
import { Box, Button, Slider, Typography } from '@mui/material';
import {
    CheckTwoTone,
    DeveloperBoardTwoTone,
    OnlinePredictionTwoTone,
    SettingsTwoTone,
    SpeedTwoTone,
} from '@mui/icons-material';

import ServerModalShell from './ServerModalShell';
import ServerIdentityStrip, { useServerSpec } from './ServerIdentityStrip';
import { Server, ServerConfig } from '../../includes/Servers.interface';
import { ICipherType } from '../../includes/Cipher.interface';
import { WORKLOAD_CIPHERS, cipherMeta, tierLevelFromEnum } from '../../data/cipherMeta';
import { formatMoney } from '../../lib/utils';
import { useServersStore } from '../../stores/servers';

const ACCENT = '#26c6da';

interface SectionLabelProps {
    icon?: React.ReactNode;
    children: React.ReactNode;
}

function SectionLabel({ icon, children }: SectionLabelProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                mb: 1,
                color: 'rgba(255,255,255,0.55)',
            }}
        >
            {icon && <Box sx={{ color: `${ACCENT}cc`, display: 'flex' }}>{icon}</Box>}
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}
            >
                {children}
            </Typography>
        </Box>
    );
}

interface CipherCardProps {
    cipher: ICipherType;
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
}

function CipherCard({ cipher, selected, disabled, onSelect }: CipherCardProps) {
    const meta = cipherMeta(cipher.name);
    const blockLabel = `${cipher.block.size} ${cipher.block.unit}`;
    const fitLabel = disabled
        ? `${blockLabel} · REQUIRES TIER ${meta.minTier}+`
        : `${blockLabel} · COMPATIBLE`;

    return (
        <Box
            component="button"
            type="button"
            onClick={() => !disabled && onSelect()}
            disabled={disabled}
            sx={{
                p: 1.25,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: selected
                    ? 'rgba(38,198,218,0.12)'
                    : disabled
                        ? 'rgba(255,255,255,0.02)'
                        : 'rgba(255,255,255,0.03)',
                border: selected
                    ? `1px solid rgba(38,198,218,0.45)`
                    : disabled
                        ? '1px solid rgba(255,255,255,0.06)'
                        : '1px solid rgba(255,255,255,0.10)',
                color: selected
                    ? ACCENT
                    : disabled
                        ? 'rgba(255,255,255,0.35)'
                        : 'rgba(255,255,255,0.85)',
                transition: 'background 225ms cubic-bezier(0,0,0.2,1), border-color 225ms cubic-bezier(0,0,0.2,1)',
                textAlign: 'left',
            }}
        >
            <Box
                sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    border: `1px solid ${selected ? ACCENT : 'rgba(255,255,255,0.15)'}`,
                    background: selected ? `${ACCENT}1a` : 'rgba(0,0,0,0.25)',
                    color: selected ? ACCENT : 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                }}
            >
                {selected ? <CheckTwoTone sx={{ fontSize: 16 }} /> : `C${cipher.complexity}`}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'baseline' }}>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'inherit',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {cipher.name}
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            color: selected ? '#28ff28' : 'rgba(255,255,255,0.6)',
                            textShadow: selected ? '0 0 8px rgba(40,255,40,0.6)' : 'none',
                        }}
                    >
                        ${formatMoney(cipher.payout, 0)}
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.5)',
                        mt: 0.25,
                    }}
                >
                    {fitLabel}
                </Typography>
            </Box>
        </Box>
    );
}

interface ConfigureModalProps {
    open: boolean;
    onClose: () => void;
    server: Server;
}

type Priority = 'eco' | 'balanced' | 'turbo';
const PRIORITIES: Priority[] = ['eco', 'balanced', 'turbo'];
const PRIORITY_LABEL: Record<Priority, string> = { eco: 'Eco', balanced: 'Balanced', turbo: 'Turbo' };
const PRIORITY_MULT: Record<Priority, number> = { eco: 0.85, balanced: 1, turbo: 1.2 };

export default function ConfigureModal({ open, onClose, server }: ConfigureModalProps) {
    const { threads } = useServerSpec(server);
    const tierIdx = tierLevelFromEnum(server.tier);
    const configureServer = useServersStore((s) => s.configureServer);

    const maxWorkers = Math.max(1, Math.floor(threads / 4));
    const defaultWorkers = Math.min(8, Math.max(1, Math.floor(threads / 8)));

    const defaultCipher = useMemo<ICipherType>(() => {
        return (
            [...WORKLOAD_CIPHERS].reverse().find((c) => cipherMeta(c.name).minTier <= tierIdx) ??
            WORKLOAD_CIPHERS[0]
        );
    }, [tierIdx]);

    const initial = server.config;
    const [selected, setSelected] = useState<ICipherType>(() => {
        if (initial?.cipherId) {
            return WORKLOAD_CIPHERS.find((c) => c.name === initial.cipherId) ?? defaultCipher;
        }
        return defaultCipher;
    });
    const [parallelism, setParallelism] = useState<number>(initial?.parallelism ?? defaultWorkers);
    const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'balanced');
    const [autoRestart, setAutoRestart] = useState<boolean>(initial?.autoRestart ?? true);

    const meta = cipherMeta(selected.name);
    const cycleSec = Math.max(
        1,
        Math.round((selected.complexity * 18) / Math.max(1, threads / 8) / Math.max(1, parallelism)),
    );
    const cyclesPerDay = Math.floor(86400 / cycleSec);
    const dailyYield = cyclesPerDay * selected.payout * meta.fit * PRIORITY_MULT[priority];

    const handleApply = () => {
        const config: ServerConfig = {
            cipherId: selected.name,
            parallelism,
            priority,
            autoRestart,
        };
        configureServer(server, config);
        onClose();
    };

    return (
        <ServerModalShell
            open={open}
            onClose={onClose}
            accent={ACCENT}
            icon={SettingsTwoTone}
            eyebrow="Server Configuration"
            title="Assign Cipher Workload"
            width={720}
            footer={
                <>
                    <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        sx={{
                            bgcolor: ACCENT,
                            color: '#0a0f0d',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#33d2e5' },
                        }}
                    >
                        Apply Configuration
                    </Button>
                </>
            }
        >
            <ServerIdentityStrip server={server} />

            <Box>
                <SectionLabel>Cipher Workload</SectionLabel>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {WORKLOAD_CIPHERS.map((c) => {
                        const meta = cipherMeta(c.name);
                        const disabled = meta.minTier > tierIdx;
                        return (
                            <CipherCard
                                key={c.name}
                                cipher={c}
                                selected={selected.name === c.name}
                                disabled={disabled}
                                onSelect={() => setSelected(c)}
                            />
                        );
                    })}
                </Box>
            </Box>

            <Box>
                <SectionLabel>Runtime Options</SectionLabel>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                        }}
                    >
                        <SectionLabel icon={<DeveloperBoardTwoTone sx={{ fontSize: 14 }} />}>
                            Workers · {parallelism}
                        </SectionLabel>
                        <Slider
                            value={parallelism}
                            onChange={(_, v) => setParallelism(v as number)}
                            min={1}
                            max={maxWorkers}
                            step={1}
                            sx={{ color: ACCENT, mt: 0.5 }}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 10,
                                color: 'rgba(255,255,255,0.45)',
                            }}
                        >
                            <span>1</span>
                            <span>{maxWorkers}</span>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            p: 1.5,
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                        }}
                    >
                        <SectionLabel icon={<SpeedTwoTone sx={{ fontSize: 14 }} />}>Priority</SectionLabel>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
                            {PRIORITIES.map((p) => {
                                const active = priority === p;
                                return (
                                    <Box
                                        key={p}
                                        component="button"
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        sx={{
                                            py: 0.75,
                                            borderRadius: '6px',
                                            border: active
                                                ? `1px solid ${ACCENT}80`
                                                : '1px solid rgba(255,255,255,0.10)',
                                            background: active
                                                ? `${ACCENT}1f`
                                                : 'rgba(255,255,255,0.03)',
                                            color: active ? ACCENT : 'rgba(255,255,255,0.7)',
                                            cursor: 'pointer',
                                            fontFamily: 'Fira Code, monospace',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            transition: 'all 225ms cubic-bezier(0,0,0.2,1)',
                                        }}
                                    >
                                        {PRIORITY_LABEL[p]}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box
                onClick={() => setAutoRestart((v) => !v)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: '10px 12px',
                    background: 'rgba(0,0,0,0.30)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: 30,
                        height: 18,
                        borderRadius: 9999,
                        background: autoRestart ? ACCENT : 'rgba(255,255,255,0.18)',
                        transition: 'background 225ms cubic-bezier(0,0,0.2,1)',
                        flexShrink: 0,
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 2,
                            left: autoRestart ? 14 : 2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: autoRestart ? '#0a0f0d' : 'rgba(255,255,255,0.92)',
                            transition: 'left 225ms cubic-bezier(0,0,0.2,1)',
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                        Auto-restart on completion
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                        Queue next cipher automatically.
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    p: 1.75,
                    background: 'linear-gradient(135deg, rgba(38,198,218,0.10), rgba(10,245,176,0.06))',
                    border: '1px solid rgba(38,198,218,0.24)',
                    borderRadius: '10px',
                }}
            >
                <SectionLabel icon={<OnlinePredictionTwoTone sx={{ fontSize: 14 }} />}>
                    Projected Output
                </SectionLabel>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                    <ProjectionCell label="Cycle time" value={`${cycleSec}s`} />
                    <ProjectionCell label="Cycles / day" value={formatMoney(cyclesPerDay, 0)} />
                    <ProjectionCell
                        label="Daily yield"
                        value={`$${formatMoney(dailyYield, 2)}`}
                        income
                    />
                </Box>
            </Box>
        </ServerModalShell>
    );
}

interface ProjectionCellProps {
    label: string;
    value: string;
    income?: boolean;
}

function ProjectionCell({ label, value, income }: ProjectionCellProps) {
    return (
        <Box>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 18,
                    fontWeight: 700,
                    color: income ? '#28ff28' : 'rgba(255,255,255,0.92)',
                    textShadow: income ? '0 0 10px rgba(40,255,40,0.5)' : 'none',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

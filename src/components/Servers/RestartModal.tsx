import { useEffect, useMemo, useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import {
    CheckCircleTwoTone,
    RestartAltTwoTone,
    WarningTwoTone,
} from '@mui/icons-material';

import ServerModalShell from './ServerModalShell';
import ServerIdentityStrip from './ServerIdentityStrip';
import { Server } from '../../includes/Servers.interface';
import { useServersStore } from '../../stores/servers';

const ORANGE = '#ff9800';
const TEAL = '#0af5b0';

type Stage = 'confirm' | 'running' | 'done';

interface LogLine {
    threshold: number;
    text: string;
    color: string;
}

const LOG_TEMPLATE = (nickname: string, sku: string): LogLine[] => [
    { threshold:   0, text: `$ systemctl reboot --node=${nickname.toLowerCase()}`, color: 'rgba(255,255,255,0.55)' },
    { threshold:   8, text: '[ OK ] Sending SIGTERM to cipher workers…',          color: 'rgba(10,245,176,0.85)' },
    { threshold:  24, text: '[ OK ] Persisting state to /var/spool/cb…',          color: 'rgba(10,245,176,0.85)' },
    { threshold:  44, text: '[ OK ] Unmounting volumes…',                         color: 'rgba(10,245,176,0.85)' },
    { threshold:  64, text: `[ >>> ] Kernel boot · ${sku}`,                       color: ORANGE },
    { threshold:  84, text: '[ OK ] Uplink renegotiated · 25 Gbps',               color: 'rgba(10,245,176,0.85)' },
    { threshold: 100, text: '[ ✓ ] Node online · ready for workload',             color: TEAL },
];

const phaseLabel = (pct: number): string => {
    if (pct < 30) return 'HALTING WORKLOAD';
    if (pct < 60) return 'FLUSHING BUFFERS';
    if (pct < 90) return 'BOOTING KERNEL';
    return 'REJOINING UPLINK';
};

interface RestartModalProps {
    open: boolean;
    onClose: () => void;
    server: Server;
}

export default function RestartModal({ open, onClose, server }: RestartModalProps) {
    const restartServer = useServersStore((s) => s.restartServer);
    const [stage, setStage] = useState<Stage>('confirm');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!open) return;
        setStage('confirm');
        setProgress(0);
    }, [open, server.name]);

    useEffect(() => {
        if (stage !== 'running') return;
        const id = setInterval(() => {
            setProgress((p) => {
                const next = Math.min(100, p + 4 + Math.random() * 6);
                if (next >= 100) {
                    setStage('done');
                    return 100;
                }
                return next;
            });
        }, 120);
        return () => clearInterval(id);
    }, [stage]);

    const logTemplate = useMemo(
        () => LOG_TEMPLATE(server.name ?? server.model, server.model),
        [server.name, server.model],
    );
    const visibleLines = logTemplate.filter((l) => l.threshold <= progress);

    const accent = stage === 'done' ? TEAL : ORANGE;
    const eyebrow =
        stage === 'confirm'
            ? 'Confirm Restart'
            : stage === 'running'
                ? 'Restart in Progress'
                : 'Restart Complete';
    const title =
        stage === 'confirm'
            ? 'Restart this node?'
            : stage === 'running'
                ? 'Restarting Node…'
                : 'Node Back Online';

    const handleStart = () => setStage('running');
    const handleDone = () => {
        restartServer(server);
        onClose();
    };

    const footer =
        stage === 'confirm' ? (
            <>
                <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={<RestartAltTwoTone />}
                    onClick={handleStart}
                    sx={{
                        bgcolor: ORANGE,
                        color: '#0a0f0d',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#ffae33' },
                    }}
                >
                    Restart Node
                </Button>
            </>
        ) : stage === 'running' ? (
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.1em',
                }}
            >
                PLEASE WAIT — DO NOT CLOSE
            </Typography>
        ) : (
            <Button
                variant="contained"
                onClick={handleDone}
                sx={{
                    bgcolor: TEAL,
                    color: '#0a0f0d',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#0adf99' },
                }}
            >
                Done
            </Button>
        );

    return (
        <ServerModalShell
            open={open}
            onClose={onClose}
            accent={accent}
            icon={stage === 'done' ? CheckCircleTwoTone : RestartAltTwoTone}
            eyebrow={eyebrow}
            title={title}
            width={520}
            lockClose={stage === 'running'}
            footer={footer}
        >
            <ServerIdentityStrip server={server} />

            {stage === 'confirm' && (
                <>
                    <Box
                        sx={{
                            p: 1.75,
                            background: 'rgba(255,152,0,0.08)',
                            border: '1px solid rgba(255,152,0,0.30)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <WarningTwoTone sx={{ fontSize: 16, color: ORANGE }} />
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.14em',
                                    color: ORANGE,
                                }}
                            >
                                ACTIVE WORKLOAD WILL BE INTERRUPTED
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                            The node will halt its current cipher cycle and reboot. Any in-progress
                            cipher break <strong>will be lost</strong>. Estimated downtime is ~20
                            seconds.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                        <ImpactCell label="Uptime lost" value={server.uptime ?? '0'} />
                        <ImpactCell label="Cycles in flight" value="1" />
                        <ImpactCell label="Est. downtime" value="~20s" />
                    </Box>
                </>
            )}

            {stage === 'running' && (
                <>
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: '0.18em',
                                color: ORANGE,
                                mb: 1,
                            }}
                        >
                            {phaseLabel(progress)} · {Math.round(progress)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: ORANGE,
                                    boxShadow: '0 0 8px rgba(255,152,0,0.5)',
                                },
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            background: '#000',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            p: 1.5,
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            lineHeight: 1.6,
                            minHeight: 110,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.25,
                        }}
                    >
                        {visibleLines.map((l) => (
                            <Box key={l.threshold} sx={{ color: l.color }}>
                                {l.text}
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            {stage === 'done' && (
                <Box
                    sx={{
                        p: 2.25,
                        background: 'rgba(10,245,176,0.08)',
                        border: '1px solid rgba(10,245,176,0.30)',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <CheckCircleTwoTone sx={{ fontSize: 48, color: TEAL }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                        {server.name ?? server.model} is back online
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.6)',
                        }}
                    >
                        Workload resumed · uplink stable
                    </Typography>
                </Box>
            )}
        </ServerModalShell>
    );
}

interface ImpactCellProps {
    label: string;
    value: string;
}

function ImpactCell({ label, value }: ImpactCellProps) {
    return (
        <Box
            sx={{
                p: '10px 12px',
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
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.92)',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { SecurityTwoTone, ShieldTwoTone, WarningTwoTone } from '@mui/icons-material';

import ServerModalShell from '../Servers/ServerModalShell';
import { SimonGame } from '../SimonGame';
import { TurnTwo } from '../TurnTwo';
import { ScreenGlowType } from '../ScreenGlow';
import { useStationContext } from '../../stores/stationContext';
import { useThreatsStore } from '../../stores/threats';

const RED = '#e74c3c';

type Phase = 'playing' | 'failed';

const noopClose = () => {};

export default function ThreatPuzzleModal() {
    const active = useThreatsStore((s) => s.active);
    const miniGame = useThreatsStore((s) => s.miniGame);
    const attempt = useThreatsStore((s) => s.attempt);
    const threatCount = useThreatsStore((s) => s.threatCount);

    const { stationProxy } = useStationContext();
    const stationRef = useRef(stationProxy);
    stationRef.current = stationProxy;

    const [phase, setPhase] = useState<Phase>('playing');
    const wasActiveRef = useRef(false);

    useEffect(() => {
        if (active) setPhase('playing');
    }, [active, attempt]);

    useEffect(() => {
        if (wasActiveRef.current && !active) {
            const station = stationRef.current;
            station.setGlowActive(false);
            station.setGlowType(ScreenGlowType.ACTIVE);
            station.os?.startGameLoop();
        }
        wasActiveRef.current = active;
    }, [active]);

    const handleWin = useCallback(() => {
        useThreatsStore.getState().resolveThreat();
    }, []);

    const handleLose = useCallback(() => {
        setPhase('failed');
    }, []);

    const handleRetry = useCallback(() => {
        useThreatsStore.getState().retryThreat();
    }, []);

    if (!active) return null;

    const MiniGame = miniGame === 'simon' ? SimonGame : TurnTwo;

    const footer =
        phase === 'failed' ? (
            <Button
                variant="contained"
                startIcon={<ShieldTwoTone />}
                onClick={handleRetry}
                sx={{
                    bgcolor: RED,
                    color: '#0a0f0d',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#ff6b5b' },
                }}
            >
                Try Again
            </Button>
        ) : (
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.1em',
                }}
            >
                STATION HALTED — SOLVE TO RESUME
            </Typography>
        );

    return (
        <ServerModalShell
            open={active}
            onClose={noopClose}
            accent={RED}
            icon={SecurityTwoTone}
            eyebrow={`Threat #${threatCount} · Intrusion Detected`}
            title="Hostile signal on the wire"
            width={560}
            lockClose
            footer={footer}
        >
            <Box
                sx={{
                    p: 1.75,
                    background: 'rgba(231,76,60,0.08)',
                    border: '1px solid rgba(231,76,60,0.30)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <WarningTwoTone sx={{ fontSize: 16, color: RED }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            color: RED,
                        }}
                    >
                        ALL PROCESSES SUSPENDED
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                    An external actor is probing the station. Clear the challenge
                    to flush the intrusion and resume operations.
                </Typography>
            </Box>

            {phase === 'playing' ? (
                <MiniGame
                    key={`${miniGame}-${attempt}`}
                    rounds={5}
                    onWin={handleWin}
                    onLose={handleLose}
                />
            ) : (
                <Box
                    sx={{
                        p: 2.25,
                        background: 'rgba(231,76,60,0.08)',
                        border: '1px solid rgba(231,76,60,0.30)',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <WarningTwoTone sx={{ fontSize: 48, color: RED }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                        Challenge failed
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.6)',
                            textAlign: 'center',
                        }}
                    >
                        The intrusion is still on the wire. Retry to attempt a
                        different countermeasure.
                    </Typography>
                </Box>
            )}
        </ServerModalShell>
    );
}

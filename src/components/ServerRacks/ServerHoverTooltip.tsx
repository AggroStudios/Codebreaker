import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, LinearProgress, Typography } from '@mui/material';
import { CodeTwoTone, DnsTwoTone } from '@mui/icons-material';

import { InstalledServer } from '../../stores/racks';
import { Rack } from '../../stores/racks';
import { TIER_COLORS, computeUptime, serverSize, serverTierLevel } from '../../includes/serverRacks.interface';
import { ServerTiers } from '../../includes/Servers.interface';

export interface HoverState {
    rack: Rack;
    installed: InstalledServer;
    /** Cursor X in viewport coords. */
    x: number;
    /** Cursor Y in viewport coords. */
    y: number;
}

interface ServerHoverTooltipProps {
    hover: HoverState | null;
}

const WIDTH = 280;
const OFFSET_X = 16;
const OFFSET_Y = 12;
const EDGE_MARGIN = 8;

const utilizationColor = (util: number): string => {
    if (util > 85) return '#ff9800';
    if (util > 60) return '#0af5b0';
    return 'rgba(255,255,255,0.85)';
};

export default function ServerHoverTooltip({ hover }: ServerHoverTooltipProps) {
    const [vw, setVw] = useState(() => window.innerWidth);
    const [vh, setVh] = useState(() => window.innerHeight);

    useEffect(() => {
        const onResize = () => {
            setVw(window.innerWidth);
            setVh(window.innerHeight);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (!hover) return null;

    const { rack, installed, x, y } = hover;
    const { server, ciphers } = installed;
    const size = serverSize(server);
    const tier = serverTierLevel(server.tier);
    const tierColor = TIER_COLORS[tier] ?? '#0af5b0';
    const tierLabel = ServerTiers[server.tier] ?? `T${tier}`;
    const util = Math.round(server.util ?? server.load ?? 42);
    const utilColor = utilizationColor(util);
    const uptime = computeUptime(server.purchased);
    const watts = server.powerConsumption ?? 0;
    const cipherList = ciphers ?? [];

    // Cursor-relative positioning with viewport flip.
    let left = x + OFFSET_X;
    let top = y + OFFSET_Y;
    // Estimate height ~280–340px; cap with maxHeight via CSS, but flip when bottom would clip.
    const APPROX_H = 360;
    if (left + WIDTH + EDGE_MARGIN > vw) left = Math.max(EDGE_MARGIN, x - WIDTH - OFFSET_X);
    if (top + APPROX_H + EDGE_MARGIN > vh) top = Math.max(EDGE_MARGIN, y - APPROX_H - OFFSET_Y);
    if (top < EDGE_MARGIN) top = EDGE_MARGIN;

    const tooltip = (
        <Box
            sx={{
                position: 'fixed',
                left,
                top,
                width: WIDTH,
                zIndex: 9998,
                pointerEvents: 'none',
                background: 'rgba(18,18,20,0.96)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${tierColor}55`,
                borderRadius: '8px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
                overflow: 'hidden',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: '10px 12px',
                    background: `linear-gradient(180deg, ${tierColor}1F, transparent)`,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Box
                    sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        background: `${tierColor}1F`,
                        border: `1px solid ${tierColor}66`,
                        color: tierColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <DnsTwoTone sx={{ fontSize: 14 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.92)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {server.model} · {size}U
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            letterSpacing: '0.18em',
                            color: tierColor,
                            textTransform: 'uppercase',
                        }}
                    >
                        {tierLabel} tier
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.55)',
                        letterSpacing: '0.06em',
                    }}
                >
                    U{installed.u}
                </Typography>
            </Box>

            {/* Spec grid 2×2 */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0.5,
                    p: '10px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <SpecCell label="Rack" value={rack.name} mono={false} />
                <SpecCell label="Inst ID" value={installed.instId} />
                <SpecCell label="Power" value={`${watts} W`} />
                <SpecCell label="Uptime" value={uptime} />
            </Box>

            {/* Utilization */}
            <Box sx={{ p: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        mb: 0.5,
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.55)',
                        }}
                    >
                        Utilization
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            color: utilColor,
                        }}
                    >
                        {util}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={util}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: utilColor,
                            boxShadow: `0 0 8px ${utilColor}99`,
                        },
                    }}
                />
            </Box>

            {/* Active ciphers */}
            <Box sx={{ p: '10px 12px', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CodeTwoTone sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.55)',
                        }}
                    >
                        Active Ciphers · {cipherList.length}
                    </Typography>
                </Box>
                {cipherList.length === 0 ? (
                    <Typography
                        sx={{
                            fontStyle: 'italic',
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.45)',
                            pl: 0.5,
                        }}
                    >
                        Idle · awaiting workload
                    </Typography>
                ) : (
                    cipherList.map((c, i) => (
                        <Box
                            key={`${c.name}-${i}`}
                            sx={{
                                p: 0.75,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '4px',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    mb: 0.5,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 11,
                                        color: '#0af5b0',
                                        fontWeight: 600,
                                    }}
                                >
                                    {c.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 10,
                                        color: 'rgba(255,255,255,0.55)',
                                    }}
                                >
                                    ETA {c.eta}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    height: 3,
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    mb: 0.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: `${Math.min(100, c.progress)}%`,
                                        height: '100%',
                                        background: '#0af5b0',
                                        boxShadow: '0 0 6px rgba(10,245,176,0.6)',
                                    }}
                                />
                            </Box>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 9,
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                {Math.round(c.progress)}% complete
                            </Typography>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );

    return createPortal(tooltip, document.body);
}

interface SpecCellProps {
    label: string;
    value: string;
    mono?: boolean;
}

function SpecCell({ label, value, mono = true }: SpecCellProps) {
    return (
        <Box sx={{ p: '6px 8px' }}>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 9,
                    fontWeight: 600,
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
                    fontFamily: mono ? 'Fira Code, monospace' : 'inherit',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.9)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

import { ReactNode, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
    BlockTwoTone,
    CableTwoTone,
    HubTwoTone,
    ShieldTwoTone,
    SpeedTwoTone,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import { fmtNum, formatGbps, formatMoneyDay, formatMs } from '../../lib/utils';
import { useNetworksStore } from '../../stores/networks';

type TileColor = 'accent' | 'cyan' | 'warn' | 'error';

const TILE_HEX: Record<TileColor, string> = {
    accent: '#0af5b0',
    cyan: '#26c6da',
    warn: '#ff9800',
    error: '#f44336',
};

interface OverviewTileProps {
    icon: ReactNode;
    label: string;
    value: string;
    sub?: string;
    color: TileColor;
}

function OverviewTile({ icon, label, value, sub, color }: OverviewTileProps) {
    const hex = TILE_HEX[color];
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: '14px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: `${hex}26`,
                    color: hex,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    sx={{
                        fontSize: 10,
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
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 22,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: 'rgba(255,255,255,0.92)',
                    }}
                >
                    {value}
                </Typography>
                {sub && (
                    <Typography
                        sx={{
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.5)',
                            mt: 0.25,
                        }}
                    >
                        {sub}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default function NetworkOverviewCard() {
    const links = useNetworksStore((s) => s.links);
    const firewalls = useNetworksStore((s) => s.firewalls);

    const stats = useMemo(() => {
        const active = links.filter((l) => l.status === 'ACTIVE');
        const totalGbps = active.reduce((sum, l) => sum + l.gbps, 0);
        const avgLatency = active.length === 0
            ? 0
            : Math.round(active.reduce((sum, l) => sum + l.latencyMs, 0) / active.length);
        const activeFw = firewalls.filter((f) => f.status === 'ACTIVE').length;
        const totalThreats = firewalls.reduce((sum, f) => sum + f.threatsBlocked24h, 0);
        const totalCost = links.reduce((sum, l) => sum + (l.status === 'ACTIVE' ? l.costDay : 0), 0);
        return {
            activeLinks: active.length,
            totalGbps,
            avgLatency,
            activeFw,
            totalFw: firewalls.length,
            totalThreats,
            totalCost,
        };
    }, [links, firewalls]);

    return (
        <StationCard
            avatar={HubTwoTone}
            accent={StationCardAccentType.CYAN}
            title="Network Overview"
            subheader="GLOBAL POSTURE"
            content={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: 1.25,
                        }}
                    >
                        <OverviewTile
                            icon={<CableTwoTone />}
                            label="Capacity"
                            value={formatGbps(stats.totalGbps)}
                            sub={`${stats.activeLinks} active link${stats.activeLinks === 1 ? '' : 's'}`}
                            color="accent"
                        />
                        <OverviewTile
                            icon={<SpeedTwoTone />}
                            label="Avg Latency"
                            value={formatMs(stats.avgLatency)}
                            sub="across active links"
                            color="cyan"
                        />
                        <OverviewTile
                            icon={<ShieldTwoTone />}
                            label="Firewalls"
                            value={String(stats.totalFw)}
                            sub={`${stats.activeFw} active`}
                            color="accent"
                        />
                        <OverviewTile
                            icon={<BlockTwoTone />}
                            label="Threats 24h"
                            value={fmtNum(stats.totalThreats)}
                            sub="blocked at the edge"
                            color="warn"
                        />
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pt: 1.5,
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.55)',
                            }}
                        >
                            Daily Network Cost
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#ff9800',
                            }}
                        >
                            {formatMoneyDay(stats.totalCost)}
                        </Typography>
                    </Box>
                </Box>
            }
        />
    );
}

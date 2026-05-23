import { useCallback, useMemo, useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { AcUnitOutlined, AddCircleOutlineRounded, DnsOutlined } from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import { useRacksByDc, useRacksStore } from '../../stores/racks';
import { RACK_CATALOG, RACK_WIDTH, serverSize } from '../../includes/serverRacks.interface';
import RackUnit, { TileHoverCallbacks } from './RackUnit';
import ServerHoverTooltip, { HoverState } from './ServerHoverTooltip';

interface RackFloorProps {
    dcId: string;
}

export default function RackFloor({ dcId }: RackFloorProps) {
    const racks = useRacksByDc(dcId);
    const addRack = useRacksStore((s) => s.addRack);

    const installedCount = racks.reduce((sum, r) => sum + r.installed.length, 0);
    const totalU = racks.reduce(
        (sum, r) => sum + r.installed.reduce((s, it) => s + serverSize(it.server), 0),
        0,
    );

    const ghostPrice = RACK_CATALOG[0].price;
    const subheader = `${racks.length} RACKS · ${installedCount} INSTALLED · ${totalU}U USED`;

    const [hover, setHover] = useState<HoverState | null>(null);

    const onTileEnter = useCallback<TileHoverCallbacks['onTileEnter']>((rack, installed, e) => {
        setHover({ rack, installed, x: e.clientX, y: e.clientY });
    }, []);
    const onTileMove = useCallback<TileHoverCallbacks['onTileMove']>((e) => {
        setHover((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
    }, []);
    const onTileLeave = useCallback<TileHoverCallbacks['onTileLeave']>(() => {
        setHover(null);
    }, []);

    const hoverCallbacks = useMemo<TileHoverCallbacks>(
        () => ({ onTileEnter, onTileMove, onTileLeave }),
        [onTileEnter, onTileMove, onTileLeave],
    );

    return (
        <>
        <StationCard
            avatar={DnsOutlined}
            accent={StationCardAccentType.ACCENT}
            title="Rack Floor"
            subheader={subheader}
            headerAction={
                <Chip
                    icon={<AcUnitOutlined />}
                    label="HOT / COLD AISLE"
                    size="small"
                    variant="outlined"
                    sx={{
                        color: '#26c6da',
                        borderColor: 'rgba(38,198,218,0.45)',
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        mr: 1,
                        '& .MuiChip-icon': { color: '#26c6da' },
                    }}
                />
            }
            content={
                <Box
                    className="racks-floor-scroll"
                    sx={{
                        height: '100%',
                        mx: -2,
                        mt: -2,
                        mb: -2,
                        overflowX: 'auto',
                        overflowY: 'auto',
                        p: 2.25,
                        backgroundImage:
                            'radial-gradient(circle at 30% 20%, rgba(10,245,176,0.04), transparent 55%),' +
                            'radial-gradient(circle at 80% 70%, rgba(38,198,218,0.04), transparent 55%)',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2.25, alignItems: 'flex-start' }}>
                        {racks.map((r) => (
                            <RackUnit key={r.id} rack={r} hoverCallbacks={hoverCallbacks} />
                        ))}

                        <Box
                            onClick={() => addRack(dcId)}
                            sx={{
                                width: RACK_WIDTH,
                                flex: `0 0 ${RACK_WIDTH}px`,
                                minHeight: 320,
                                border: '2px dashed rgba(255,255,255,0.16)',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.25,
                                color: 'rgba(255,255,255,0.55)',
                                cursor: 'pointer',
                                transition: 'all 225ms cubic-bezier(0,0,0.2,1)',
                                '&:hover': {
                                    borderColor: '#0af5b0',
                                    color: '#0af5b0',
                                    background: 'rgba(10,245,176,0.04)',
                                },
                            }}
                        >
                            <AddCircleOutlineRounded sx={{ fontSize: 40 }} />
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 12,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Add Rack
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.4)',
                                    letterSpacing: '0.16em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                From ${ghostPrice.toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            }
        />
        <ServerHoverTooltip hover={hover} />
        </>
    );
}

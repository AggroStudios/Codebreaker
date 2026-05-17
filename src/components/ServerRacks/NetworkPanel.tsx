import { useState } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import { AddOutlined, HubOutlined, WarningAmberOutlined } from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import { useRacksStore } from '../../stores/racks';
import UplinkPanel from './UplinkPanel';
import NetworkDiagram from './NetworkDiagram';
import SwitchRow from './SwitchRow';

export default function NetworkPanel() {
    const racks = useRacksStore((s) => s.racks);
    const switches = useRacksStore((s) => s.switches);
    const uplink = useRacksStore((s) => s.uplink);
    const assignRackToSwitch = useRacksStore((s) => s.assignRackToSwitch);
    const cycleUplink = useRacksStore((s) => s.cycleUplink);

    const [selectedSwitch, setSelectedSwitch] = useState<string | null>(null);
    const orphanCount = racks.filter((r) => r.switchId == null).length;

    return (
        <StationCard
            avatar={HubOutlined}
            accent={StationCardAccentType.CYAN}
            title="Network"
            subheader={`UPLINK · ${switches.length} SWITCHES`}
            content={
                <Box
                    sx={{
                        height: '100%',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                    }}
                >
                    <UplinkPanel uplink={uplink} onCycle={cycleUplink} />
                    <NetworkDiagram racks={racks} switches={switches} uplink={uplink} />

                    <Box>
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
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                Switches
                            </Typography>
                            {orphanCount > 0 && (
                                <Chip
                                    icon={<WarningAmberOutlined />}
                                    label={`${orphanCount} UNLINKED`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        color: '#ff9800',
                                        borderColor: 'rgba(255,152,0,0.45)',
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 9,
                                        letterSpacing: '0.1em',
                                        '& .MuiChip-icon': { color: '#ff9800' },
                                    }}
                                />
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {switches.map((sw) => (
                                <SwitchRow
                                    key={sw.id}
                                    sw={sw}
                                    racks={racks}
                                    selected={selectedSwitch === sw.id}
                                    onSelect={() =>
                                        setSelectedSwitch(selectedSwitch === sw.id ? null : sw.id)
                                    }
                                    onAssign={assignRackToSwitch}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            }
            action={
                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<AddOutlined />}
                    sx={{ flex: 1 }}
                >
                    Add Switch
                </Button>
            }
        />
    );
}

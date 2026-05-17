import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { RouterOutlined } from '@mui/icons-material';

import { Rack } from '../../stores/racks';
import { SwitchUnit, statusColor } from '../../includes/serverRacks.interface';

interface SwitchRowProps {
    sw: SwitchUnit;
    racks: Rack[];
    selected: boolean;
    onSelect: () => void;
    onAssign: (rackId: string, switchId: string | null) => void;
}

export default function SwitchRow({ sw, racks, selected, onSelect, onAssign }: SwitchRowProps) {
    const color = statusColor(sw.status);
    const connectedCount = racks.filter((r) => r.switchId === sw.id).length;

    return (
        <Box
            onClick={onSelect}
            sx={{
                p: 1.25,
                background: selected ? 'rgba(10,245,176,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected ? 'rgba(10,245,176,0.45)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 1,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                transition: 'all 180ms cubic-bezier(0,0,0.2,1)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RouterOutlined sx={{ fontSize: 16, color }} />
                <Typography
                    sx={{
                        flex: 1,
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.85)',
                    }}
                >
                    {sw.name}
                    <span style={{
                        marginLeft: 6,
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: 10,
                    }}>
                        {sw.model}
                    </span>
                </Typography>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        color,
                    }}
                >
                    {sw.status}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {Array.from({ length: sw.ports }, (_, i) => (
                    <span
                        key={i}
                        style={{
                            width: 6,
                            height: 6,
                            display: 'inline-block',
                            background:
                                i < sw.used
                                    ? sw.status === 'UP'
                                        ? '#0af5b0'
                                        : color
                                    : 'rgba(255,255,255,0.14)',
                            boxShadow:
                                i < sw.used && sw.status === 'UP'
                                    ? '0 0 4px rgba(10,245,176,0.7)'
                                    : 'none',
                            borderRadius: 1,
                        }}
                    />
                ))}
            </Box>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.06em',
                }}
            >
                {sw.used}/{sw.ports} PORTS · {sw.throughput} · {connectedCount} RACK
                {connectedCount === 1 ? '' : 'S'}
            </Typography>

            {selected && (
                <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        pt: 1,
                        borderTop: '1px dashed rgba(255,255,255,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.25,
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.4)',
                            mb: 0.5,
                        }}
                    >
                        Connected Racks
                    </Typography>
                    {racks.length === 0 ? (
                        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                            No racks deployed yet.
                        </Typography>
                    ) : (
                        racks.map((r) => (
                            <FormControlLabel
                                key={r.id}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={r.switchId === sw.id}
                                        onChange={(e) =>
                                            onAssign(r.id, e.target.checked ? sw.id : null)
                                        }
                                    />
                                }
                                label={
                                    <span style={{ fontSize: 11 }}>
                                        {r.name}
                                        <span style={{
                                            marginLeft: 8,
                                            color: 'rgba(255,255,255,0.4)',
                                            fontFamily: 'Fira Code, monospace',
                                            fontSize: 9,
                                            letterSpacing: '0.1em',
                                        }}>
                                            {r.installed.length} SVR
                                        </span>
                                    </span>
                                }
                                sx={{ mx: 0 }}
                            />
                        ))
                    )}
                </Box>
            )}
        </Box>
    );
}

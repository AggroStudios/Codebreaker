import { Box, Button, Typography } from '@mui/material';
import { AutorenewOutlined, PublicOutlined, SettingsEthernetOutlined } from '@mui/icons-material';

import { UplinkInfo, statusColor } from '../../includes/serverRacks.interface';

interface UplinkPanelProps {
    uplink: UplinkInfo;
    onCycle: () => void;
}

const StatCell = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <Box>
        <Typography
            sx={{
                fontFamily: 'Fira Code, monospace',
                fontSize: 9,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
            }}
        >
            {label}
        </Typography>
        <Typography
            sx={{
                fontFamily: 'Fira Code, monospace',
                fontSize: 13,
                fontWeight: 600,
                color: color ?? 'rgba(255,255,255,0.85)',
            }}
        >
            {value}
        </Typography>
    </Box>
);

export default function UplinkPanel({ uplink, onCycle }: UplinkPanelProps) {
    const color = statusColor(uplink.status);

    return (
        <Box
            sx={{
                p: 1.75,
                background: 'linear-gradient(180deg, rgba(10,245,176,0.06), rgba(0,0,0,0.2))',
                border: `1px solid ${color}55`,
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublicOutlined sx={{ fontSize: 16, color }} />
                <Typography
                    sx={{
                        flex: 1,
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.85)',
                    }}
                >
                    {uplink.provider}
                </Typography>
                <span
                    className="live-dot"
                    style={{
                        width: 8,
                        height: 8,
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                    }}
                />
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        color,
                    }}
                >
                    {uplink.status}
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <StatCell label="Bandwidth" value={uplink.bandwidth} color={color} />
                <StatCell label="Latency" value={uplink.latency} />
                <StatCell label="Public IP" value={uplink.ip} />
                <StatCell label="ASN" value={uplink.asn} />
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Button
                    size="small"
                    color="primary"
                    startIcon={<AutorenewOutlined />}
                    onClick={onCycle}
                    sx={{ fontFamily: 'Fira Code, monospace', fontSize: 11, letterSpacing: '0.1em' }}
                >
                    Cycle
                </Button>
                <Button
                    size="small"
                    color="inherit"
                    startIcon={<SettingsEthernetOutlined />}
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.65)',
                    }}
                >
                    BGP
                </Button>
            </Box>
        </Box>
    );
}

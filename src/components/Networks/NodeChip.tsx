import { Box, Typography } from '@mui/material';
import { DnsTwoTone, ImportantDevicesTwoTone } from '@mui/icons-material';

import { NetNode } from '../../includes/networks.interface';

interface NodeChipProps {
    node: NetNode | undefined;
}

export default function NodeChip({ node }: NodeChipProps) {
    if (!node) {
        return (
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 9999,
                    border: '1px dashed rgba(255,255,255,0.18)',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 11,
                }}
            >
                unknown
            </Box>
        );
    }

    const isStation = node.isStation;
    const bg = isStation ? 'rgba(10,245,176,0.10)' : 'rgba(255,255,255,0.04)';
    const border = isStation ? 'rgba(10,245,176,0.30)' : 'rgba(255,255,255,0.10)';
    const dotBg = isStation ? 'rgba(10,245,176,0.18)' : 'rgba(38,198,218,0.15)';
    const dotColor = isStation ? '#0af5b0' : '#26c6da';
    const Icon = isStation ? ImportantDevicesTwoTone : DnsTwoTone;

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.5,
                borderRadius: 9999,
                background: bg,
                border: `1px solid ${border}`,
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: dotBg,
                    color: dotColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 14 }} />
            </Box>
            <Box sx={{ minWidth: 0, lineHeight: 1.1 }}>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.92)',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {node.code}
                </Typography>
                <Typography
                    sx={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.5)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {node.city}
                </Typography>
            </Box>
        </Box>
    );
}

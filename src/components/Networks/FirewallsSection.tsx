import { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { ShieldTwoTone } from '@mui/icons-material';

import { useNetworksStore } from '../../stores/networks';
import { findNode, useNetworkNodesWithSeed } from './nodes';
import FirewallCard from './FirewallCard';

export default function FirewallsSection() {
    const firewalls = useNetworksStore((s) => s.firewalls);
    const nodes = useNetworkNodesWithSeed();

    const orderedFirewalls = useMemo(() => {
        // Station firewall first, then the rest in store order.
        const station = firewalls.filter((f) => findNode(nodes, f.nodeId)?.isStation);
        const others = firewalls.filter((f) => !findNode(nodes, f.nodeId)?.isStation);
        return [...station, ...others];
    }, [firewalls, nodes]);

    const activeCount = firewalls.filter((f) => f.status === 'ACTIVE').length;

    return (
        <Box sx={{ mt: 2.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 1.5,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'rgba(10,245,176,0.85)',
                        }}
                    >
                        // Firewalls
                    </Typography>
                    <Typography
                        component="h2"
                        sx={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.92)',
                            lineHeight: 1.2,
                            mt: 0.5,
                        }}
                    >
                        Perimeter Defense
                    </Typography>
                </Box>
                <Chip
                    label={`${activeCount}/${firewalls.length} ACTIVE`}
                    size="small"
                    variant="outlined"
                    className="accent"
                    icon={<ShieldTwoTone fontSize="small" />}
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: 2.5,
                    alignItems: 'stretch',
                }}
            >
                {orderedFirewalls.map((fw) => (
                    <FirewallCard key={fw.id} fw={fw} node={findNode(nodes, fw.nodeId)} />
                ))}
            </Box>
        </Box>
    );
}

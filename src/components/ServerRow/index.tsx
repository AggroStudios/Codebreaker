import { useState } from 'react';

import './style.scss';
import { Server } from '../../includes/Servers.interface';
import { Box, Chip, IconButton, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import TierMarker from '../common/TierMarker';
import { ShimmerProgress } from '../common/ShimmerProgress';
import { SettingsTwoTone, RestartAltTwoTone, SellTwoTone } from '@mui/icons-material';
import ConfigureModal from '../Servers/ConfigureModal';
import RestartModal from '../Servers/RestartModal';
import SellModal from '../Servers/SellModal';

interface ServerRowProps {
    server: Server;
}

export function ServerRowHeader() {
    return (
        <TableHead>
            <TableRow>
                <TableCell colSpan={2}>Node</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Utilization</TableCell>
                <TableCell>Actions</TableCell>
            </TableRow>
        </TableHead>
    );
}

export function ServerRow(props: ServerRowProps) {
    const { server } = props;
    const [configOpen, setConfigOpen] = useState(false);
    const [restartOpen, setRestartOpen] = useState(false);
    const [sellOpen, setSellOpen] = useState(false);

    return (
        <>
            <TableRow>
                <TableCell>
                    <img className="server-row-image" src={server.imageSrc} alt={server.model} />
                </TableCell>
                <TableCell sx={{ width: '33.33%' }}>
                    <Box className="server-row-server-info">
                        <Typography className="server-row-server-info-name" variant="body1"><TierMarker tier={server.tier} />{server.name}</Typography>
                        <Typography className="server-row-server-info-model" variant="body2">{server.model} · {server.cpu.cores * server.cpuAmount}c · {server.memory.capacity}GB</Typography>
                    </Box>
                </TableCell>
                <TableCell sx={{ width: '33.33%' }}>
                    <Box className="server-row-location">
                        <Typography className="server-row-location-name" variant="body1">{server.location ?? 'N/A'}</Typography>
                        <Typography className="server-row-uptime" variant="body2">Uptime: {server.uptime ?? 'N/A'}</Typography>
                    </Box>
                </TableCell>
                <TableCell>
                    <Box className="server-row-status">
                        <Chip className="server-row-status-chip" label={server.status} />
                    </Box>
                </TableCell>
                <TableCell sx={{ width: '33.33%' }}>
                    <ShimmerProgress value={server.util ?? server.load ?? 0} color="accent" title="Utilization" subheader="Last 5 min" />
                </TableCell>
                <TableCell>
                    <Box className="server-row-actions">
                        <Tooltip title="Configure">
                            <IconButton className="blue" onClick={() => setConfigOpen(true)}>
                                <SettingsTwoTone />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Restart">
                            <IconButton className="accent" onClick={() => setRestartOpen(true)}>
                                <RestartAltTwoTone />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Sell">
                            <IconButton className="red" onClick={() => setSellOpen(true)}>
                                <SellTwoTone />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </TableCell>
            </TableRow>
            {configOpen && (
                <ConfigureModal open={configOpen} onClose={() => setConfigOpen(false)} server={server} />
            )}
            {restartOpen && (
                <RestartModal open={restartOpen} onClose={() => setRestartOpen(false)} server={server} />
            )}
            {sellOpen && (
                <SellModal open={sellOpen} onClose={() => setSellOpen(false)} server={server} />
            )}
        </>
    );
}
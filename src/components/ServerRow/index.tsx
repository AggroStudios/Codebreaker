import './style.scss';
import { Server } from '../../includes/Servers.interface';
import { Box, Chip, IconButton, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import TierMarker from '../common/TierMarker';
import { ShimmerProgress } from '../common/ShimmerProgress';
import { SettingsOutlined, RestartAltOutlined, LocalOfferOutlined } from '@mui/icons-material';

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

    return (
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
                    <Typography className="server-row-location-name" variant="body1">N/A</Typography>
                    <Typography className="server-row-uptime" variant="body2">Uptime: N/A</Typography>
                </Box>
            </TableCell>
            <TableCell>
                <Box className="server-row-status">
                    <Chip className="server-row-status-chip" label={server.status} />
                </Box>
            </TableCell>
            <TableCell sx={{ width: '33.33%' }}>
                <ShimmerProgress value={server.load ?? 0} color="accent" title="Utilization" subheader="Last 5 min" />
            </TableCell>
            <TableCell>
                <Box className="server-row-actions">
                    <Tooltip title="Configure"><IconButton className="blue"><SettingsOutlined /></IconButton></Tooltip>
                    <Tooltip title="Restart"><IconButton className="accent"><RestartAltOutlined /></IconButton></Tooltip>
                    <Tooltip title="Sell"><IconButton className="red"><LocalOfferOutlined /></IconButton></Tooltip>
                </Box>
            </TableCell>
        </TableRow>
    );
}
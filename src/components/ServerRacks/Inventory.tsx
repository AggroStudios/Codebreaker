import { useMemo } from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
    AddOutlined,
    DragIndicator,
    Inventory2Outlined,
    ShoppingBagOutlined,
} from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router';

import StationCard, { StationCardAccentType } from '../StationCard';
import { useServersStore } from '../../stores/servers';
import { useInstalledInstIds, useRacksStore } from '../../stores/racks';
import { Server } from '../../includes/Servers.interface';
import { serverInstId, serverSize } from '../../includes/serverRacks.interface';
import ServerChip from './ServerChip';

interface DraggableInventoryItemProps {
    server: Server;
}

function DraggableInventoryItem({ server }: DraggableInventoryItemProps) {
    const instId = serverInstId(server);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `inv:${instId}`,
        data: { kind: 'inventory', server, instId },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                touchAction: 'none',
                cursor: 'grab',
                outline: 'none',
            }}
        >
            <ServerChip
                server={server}
                height={Math.max(40, 22 * serverSize(server))}
                dimmed={isDragging}
                idle
            />
        </div>
    );
}

export default function Inventory() {
    const navigate = useNavigate();
    const purchased = useServersStore((s) => s.purchasedServers);
    const installed = useInstalledInstIds();
    const addRack = useRacksStore((s) => s.addRack);

    const items = useMemo(
        () => purchased.filter((s) => !installed.has(serverInstId(s))),
        [purchased, installed],
    );

    return (
        <StationCard
            avatar={Inventory2Outlined}
            accent={StationCardAccentType.CYAN}
            title="Inventory"
            subheader={`DRAG TO INSTALL · ${items.length} UNITS`}
            content={
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        mx: -2,
                        mt: -2,
                        mb: -2,
                    }}
                >
                    <Box className="racks-inventory-hint">
                        <DragIndicator fontSize="inherit" />
                        <span>Drag any server onto an empty rack slot</span>
                    </Box>

                    <Box className="racks-inventory-list">
                        {items.length === 0 ? (
                            <Box className="racks-inventory-empty">
                                <ShoppingBagOutlined fontSize="large" />
                                <Typography variant="body2">Inventory empty</Typography>
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => navigate('/servers')}
                                >
                                    Visit Servers Store
                                </Button>
                            </Box>
                        ) : (
                            items.map((s) => (
                                <DraggableInventoryItem key={serverInstId(s)} server={s} />
                            ))
                        )}
                    </Box>
                </Box>
            }
            action={
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AddOutlined />}
                        onClick={() => addRack()}
                    >
                        Buy New Rack
                    </Button>
                    <Typography className="racks-inventory-unlock">
                        NEXT TIER UNLOCK · 2 RACKS
                    </Typography>
                </Box>
            }
        />
    );
}

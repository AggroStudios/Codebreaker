import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Box, Chip } from '@mui/material';

import { canPlace, useRacksStore } from '../../stores/racks';
import { Server } from '../../includes/Servers.interface';
import { U_HEIGHT, serverSize } from '../../includes/serverRacks.interface';

import DataCenterPicker from '../../components/ServerRacks/DataCenterPicker';
import Inventory from '../../components/ServerRacks/Inventory';
import NetworkPanel from '../../components/ServerRacks/NetworkPanel';
import RackFloor from '../../components/ServerRacks/RackFloor';
import ServerChip from '../../components/ServerRacks/ServerChip';
import StatStrip from '../../components/ServerRacks/StatStrip';

import './style.scss';
import PageHeader from '../../components/common/PageHeader';
import { ApartmentTwoTone } from '@mui/icons-material';
import { PublicOutlined } from '@mui/icons-material';
import clsx from 'clsx';
import { WarningAmberOutlined } from '@mui/icons-material';

interface DragPayload {
    kind: 'inventory' | 'installed';
    server: Server;
    instId: string;
    rackId?: string;
}

const STATUS_CLASS: Record<'UP' | 'DEGRADED' | 'DOWN', 'accent' | 'orange' | 'warning'> = {
    UP: 'accent',
    DEGRADED: 'orange',
    DOWN: 'warning',
};

export default function ServerRacks() {
    const racks = useRacksStore((s) => s.racks);
    const installServer = useRacksStore((s) => s.installServer);
    const moveServer = useRacksStore((s) => s.moveServer);

    const uplink = useRacksStore((s) => s.uplink);
    const switches = useRacksStore((s) => s.switches);
    const selectedDcId = useRacksStore((s) => s.selectedDcId);

    const uplinkClass = STATUS_CLASS[uplink.status];
    const switchAlerts = switches.filter((sw) => sw.status !== 'UP').length;


    const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        const payload = event.active.data.current as DragPayload | undefined;
        setActiveDrag(payload ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDrag(null);
        const { active, over } = event;
        if (!over) return;
        const payload = active.data.current as DragPayload | undefined;
        const target = over.data.current as { rackId: string; u: number } | undefined;
        if (!payload || !target) return;

        const targetRack = racks.find((r) => r.id === target.rackId);
        if (!targetRack) return;

        const size = serverSize(payload.server);

        if (payload.kind === 'inventory') {
            if (!canPlace(targetRack, target.u, size)) return;
            installServer(target.rackId, target.u, payload.server);
            return;
        }

        if (!payload.rackId) return;
        const sameRack = payload.rackId === target.rackId;
        if (!canPlace(targetRack, target.u, size, sameRack ? payload.instId : undefined)) return;
        moveServer(payload.rackId, target.rackId, payload.instId, target.u);
    };

    const overlayHeight = activeDrag
        ? serverSize(activeDrag.server) * U_HEIGHT - 2
        : 0;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDrag(null)}
        >
            <Box className="server-racks-page">
                <PageHeader
                    className="server-racks-header"
                    title="Server Racks"
                    subtitle="Install your servers, wire racks through switches, and manage the uplink to keep your code-breaking floor online."
                    breadcrumbs={['home', 'server_racks', selectedDcId]}
                    icon={ApartmentTwoTone}
                    actions={
                        <div className="chips">
                            <Chip
                                label={`UPLINK ${uplink.status}`}
                                size="small"
                                variant="outlined"
                                className={uplinkClass}
                                style={{ marginRight: 6 }}
                                icon={<span className="live-dot" />}
                                aria-live="polite"
                            />
                            <Chip
                                label={`${uplink.bandwidth} · ${uplink.latency}`}
                                variant="outlined"
                                className="cyan"
                                icon={<PublicOutlined fontSize="small" />}
                            />
                            {switchAlerts > 0 && (
                                <Chip
                                    label={`${switchAlerts} SWITCH ALERT${switchAlerts === 1 ? '' : 'S'}`}
                                    variant="outlined"
                                    className={clsx('orange')}
                                    icon={<WarningAmberOutlined fontSize="small" />}
                                />
                            )}
                        </div>
                    }
                />
                    <Box className="server-racks-content">
                    <Box className="server-racks-picker-row">
                        <DataCenterPicker />
                    </Box>
                    <StatStrip />
                    <Box className="server-racks-grid">
                        <Inventory />
                        <RackFloor />
                        <NetworkPanel />
                    </Box>
                </Box>
            </Box>
            <DragOverlay dropAnimation={null}>
                {activeDrag ? (
                    <Box sx={{ width: 252, opacity: 0.9, cursor: 'grabbing' }}>
                        <ServerChip
                            server={activeDrag.server}
                            height={Math.max(40, overlayHeight)}
                            idle={activeDrag.kind === 'inventory'}
                        />
                    </Box>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

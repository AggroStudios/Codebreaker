import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
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
import { Box, Button, Chip, Typography } from '@mui/material';

import { canPlace, useRacksStore } from '../../stores/racks';
import { Server } from '../../includes/Servers.interface';
import { U_HEIGHT, serverSize } from '../../includes/serverRacks.interface';

import DataCenterPicker from '../../components/ServerRacks/DataCenterPicker';
import Inventory from '../../components/ServerRacks/Inventory';
import NetworkPanel from '../../components/ServerRacks/NetworkPanel';
import RackFloor from '../../components/ServerRacks/RackFloor';
import ServerChip from '../../components/ServerRacks/ServerChip';
import StatStrip from '../../components/ServerRacks/StatStrip';
import { useActiveDataCenters, useDcIdParam } from '../../components/ServerRacks/useActiveDataCenters';

import './style.scss';
import PageHeader from '../../components/common/PageHeader';
import { ApartmentTwoTone } from '@mui/icons-material';
import { PublicOutlined } from '@mui/icons-material';
import clsx from 'clsx';
import { WarningAmberOutlined, AssignmentLateOutlined, HourglassTopOutlined, PauseCircleOutlined } from '@mui/icons-material';

import { useDataCentersStore } from '../../stores/dataCenters';
import { LiveDot } from '../../components/common';

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
    const navigate = useNavigate();
    const racks = useRacksStore((s) => s.racks);
    const installServer = useRacksStore((s) => s.installServer);
    const moveServer = useRacksStore((s) => s.moveServer);

    const uplink = useRacksStore((s) => s.uplink);
    const switches = useRacksStore((s) => s.switches);

    const dcIdParam = useDcIdParam();
    const activeDcs = useActiveDataCenters();
    const contracts = useDataCentersStore((s) => s.contracts);
    const selectedDcId = useRacksStore((s) => s.selectedDcId);
    const selectDc = useRacksStore((s) => s.selectDC);

    const hasSignedContracts = Object.keys(contracts).length > 0;

    // URL param is the source of truth; fall back to the persisted store selection,
    // then to the first active contract if neither is currently valid.
    const fallbackDcId = activeDcs.some((a) => a.dataCenter.id === selectedDcId)
        ? selectedDcId
        : activeDcs[0]?.dataCenter.id;
    const currentDcId =
        dcIdParam != null && activeDcs.some((a) => a.dataCenter.id === dcIdParam)
            ? dcIdParam
            : fallbackDcId;

    // Keep the persisted picker in sync with whatever the URL is showing, so a
    // direct nav to /racks/eu-west updates the store-driven UI (picker, etc.).
    useEffect(() => {
        if (currentDcId && currentDcId !== selectedDcId) selectDc(currentDcId);
    }, [currentDcId, selectedDcId, selectDc]);

    const uplinkClass = STATUS_CLASS[uplink.status];
    const switchAlerts = switches.filter((sw) => sw.status !== 'UP').length;

    const currentContract = currentDcId ? contracts[currentDcId] : null;
    const isSuspended = currentContract?.status === 'SUSPENDED';

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

        // Defense-in-depth: even if the droppable slipped through, never install
        // or move servers into a rack belonging to a suspended DC.
        const targetContract = contracts[targetRack.dcId];
        if (targetContract?.status === 'SUSPENDED') return;

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

    // No contracts signed at all → prompt the player to lease one.
    if (!hasSignedContracts) {
        return (
            <Box className="server-racks-page">
                <PageHeader
                    className="server-racks-header"
                    title="Server Racks"
                    subtitle="Sign a data-center contract before you can rack servers."
                    breadcrumbs={['home', 'server_racks']}
                    icon={ApartmentTwoTone}
                />
                <Box
                    className="server-racks-content"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        textAlign: 'center',
                    }}
                >
                    <AssignmentLateOutlined sx={{ fontSize: 56, color: 'rgba(10,245,176,0.45)' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            letterSpacing: '0.22em',
                            color: 'rgba(255,255,255,0.45)',
                            textTransform: 'uppercase',
                        }}
                    >
                        No signed contracts
                    </Typography>
                    <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 480 }}>
                        You haven't signed a data-center contract yet. Lease one to start
                        deploying racks and installing servers.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/dataCenters')}>
                        Open Data Centers
                    </Button>
                </Box>
            </Box>
        );
    }

    // Has signed contracts but none ACTIVE yet → provisioning state.
    if (activeDcs.length === 0) {
        return (
            <Box className="server-racks-page">
                <PageHeader
                    className="server-racks-header"
                    title="Server Racks"
                    subtitle="Your contracts are still being provisioned."
                    breadcrumbs={['home', 'server_racks']}
                    icon={ApartmentTwoTone}
                />
                <Box
                    className="server-racks-content"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        textAlign: 'center',
                    }}
                >
                    <HourglassTopOutlined sx={{ fontSize: 56, color: 'rgba(255,170,40,0.55)' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            letterSpacing: '0.22em',
                            color: 'rgba(255,170,40,0.75)',
                            textTransform: 'uppercase',
                        }}
                    >
                        Provisioning
                    </Typography>
                    <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 480 }}>
                        Your data-center contracts are being provisioned. Once they come online,
                        you'll be able to rack servers here.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/dataCenters')}>
                        Open Data Centers
                    </Button>
                </Box>
            </Box>
        );
    }

    // URL param missing or unknown → normalize the URL to the resolved dcId.
    if (!currentDcId) return null;
    if (dcIdParam !== currentDcId) {
        return <Navigate to={`/racks/${currentDcId}`} replace />;
    }

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
                    breadcrumbs={['home', 'server_racks', currentDcId]}
                    icon={ApartmentTwoTone}
                    actions={
                        <div className="chips">
                            {isSuspended && (
                                <Chip
                                    label="DC SUSPENDED"
                                    size="small"
                                    variant="outlined"
                                    className={clsx('orange')}
                                    style={{ marginRight: 6 }}
                                    icon={<PauseCircleOutlined fontSize="small" />}
                                />
                            )}
                            <Chip
                                label={`UPLINK ${uplink.status}`}
                                size="small"
                                variant="outlined"
                                className={uplinkClass}
                                style={{ marginRight: 6 }}
                                icon={<LiveDot online={uplink.status === 'UP'} />}
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
                        <DataCenterPicker selectedDcId={currentDcId} />
                    </Box>
                    <StatStrip dcId={currentDcId} />
                    <Box className="server-racks-grid">
                        <Inventory dcId={currentDcId} />
                        <RackFloor dcId={currentDcId} suspended={isSuspended} />
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

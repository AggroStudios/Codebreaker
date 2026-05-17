import { useDndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Box, IconButton, Typography } from '@mui/material';
import { BoltOutlined, CloseOutlined } from '@mui/icons-material';

import { Rack, canPlace, useRacksStore } from '../../stores/racks';
import { Server } from '../../includes/Servers.interface';
import { RACK_WIDTH, U_HEIGHT, serverSize } from '../../includes/serverRacks.interface';
import ServerChip from './ServerChip';

interface DragPayload {
    kind: 'inventory' | 'installed';
    server: Server;
    instId: string;
    rackId?: string;
}

interface HoverInfo {
    rackId: string;
    startU: number;
    size: number;
    valid: boolean;
    sourceRackId?: string;
    sourceInstId?: string;
}

function useHover(rack: Rack): HoverInfo | null {
    const { active, over } = useDndContext();
    if (!active || !over) return null;
    const a = active.data.current as DragPayload | undefined;
    const o = over.data.current as { rackId: string; u: number } | undefined;
    if (!a || !o || o.rackId !== rack.id) return null;
    const size = serverSize(a.server);
    const ignoreInstId = a.kind === 'installed' && a.rackId === rack.id ? a.instId : undefined;
    return {
        rackId: rack.id,
        startU: o.u,
        size,
        valid: canPlace(rack, o.u, size, ignoreInstId),
        sourceRackId: a.kind === 'installed' ? a.rackId : undefined,
        sourceInstId: a.kind === 'installed' ? a.instId : undefined,
    };
}

interface SlotDroppableProps {
    rackId: string;
    u: number;
    hover: HoverInfo | null;
}

function SlotDroppable({ rackId, u, hover }: SlotDroppableProps) {
    const { setNodeRef } = useDroppable({
        id: `slot:${rackId}:${u}`,
        data: { rackId, u },
    });

    const inHoverRange =
        hover != null && u >= hover.startU && u < hover.startU + hover.size;

    const style: React.CSSProperties = {
        position: 'absolute',
        top: (u - 1) * U_HEIGHT,
        left: U_HEIGHT,
        right: 6,
        height: U_HEIGHT,
        border: inHoverRange
            ? `1px dashed ${hover!.valid ? '#0af5b0' : '#f44336'}`
            : '1px dashed transparent',
        background: inHoverRange
            ? hover!.valid
                ? 'rgba(10,245,176,0.16)'
                : 'rgba(244,67,54,0.16)'
            : 'transparent',
        animation: inHoverRange && hover!.valid ? 'dropPulse 1.1s ease-in-out infinite' : undefined,
        pointerEvents: 'auto',
        boxSizing: 'border-box',
    };

    return <div ref={setNodeRef} style={style} />;
}

interface InstalledTileProps {
    rack: Rack;
    instId: string;
    server: Server;
    u: number;
    hover: HoverInfo | null;
}

function InstalledTile({ rack, instId, server, u, hover }: InstalledTileProps) {
    const uninstallServer = useRacksStore((s) => s.uninstallServer);
    const size = serverSize(server);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `inst:${rack.id}:${instId}`,
        data: { kind: 'installed', server, instId, rackId: rack.id } satisfies DragPayload,
    });

    const beingMoved =
        isDragging || (hover?.sourceRackId === rack.id && hover?.sourceInstId === instId);

    const style: React.CSSProperties = {
        position: 'absolute',
        top: (u - 1) * U_HEIGHT + 1,
        left: U_HEIGHT + 2,
        right: 6,
        height: size * U_HEIGHT - 2,
        opacity: beingMoved ? 0.35 : 1,
        touchAction: 'none',
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <ServerChip server={server} height={size * U_HEIGHT - 2} />
            <IconButton
                size="small"
                aria-label={`Uninstall ${server.name ?? server.model}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    uninstallServer(rack.id, instId);
                }}
                sx={{
                    position: 'absolute',
                    top: 1,
                    right: 2,
                    width: size === 1 ? 16 : 18,
                    height: size === 1 ? 16 : 18,
                    padding: 0,
                    color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(0,0,0,0.4)',
                    '&:hover': { color: '#f44336', background: 'rgba(0,0,0,0.6)' },
                }}
            >
                <CloseOutlined sx={{ fontSize: size === 1 ? 12 : 14 }} />
            </IconButton>
        </div>
    );
}

interface RackUnitProps {
    rack: Rack;
}

export default function RackUnit({ rack }: RackUnitProps) {
    const hover = useHover(rack);
    const totalWatts = rack.installed.reduce((sum, it) => sum + (it.server.powerConsumption ?? 0), 0);
    const occupiedSlots = rack.installed.reduce((sum, it) => sum + serverSize(it.server), 0);
    const fillPct = Math.round((occupiedSlots / rack.slots) * 100);

    const bodyHeight = rack.slots * U_HEIGHT;

    return (
        <Box
            className="rack-unit"
            sx={{
                width: RACK_WIDTH,
                flex: `0 0 ${RACK_WIDTH}px`,
                background: 'linear-gradient(180deg, rgba(35,35,38,0.92), rgba(20,20,22,0.92))',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box
                className="rack-unit__header"
                sx={{
                    height: 36,
                    px: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'linear-gradient(180deg, #1d1f22, #0e1011)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <span className="live-dot-mini" />
                <Typography
                    sx={{
                        flex: 1,
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 12,
                        color: '#0af5b0',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {rack.name}
                </Typography>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.6)',
                    }}
                >
                    {rack.slots}U
                </Typography>
            </Box>

            <Box
                className="rack-unit__body"
                sx={{
                    position: 'relative',
                    height: bodyHeight,
                    backgroundImage:
                        'repeating-linear-gradient(0deg, transparent 0 21px, rgba(0,0,0,0.45) 21px 22px)',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: U_HEIGHT,
                        height: '100%',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(0,0,0,0.25)',
                    }}
                >
                    {Array.from({ length: rack.slots }, (_, i) => (
                        <Box
                            key={i}
                            sx={{
                                height: U_HEIGHT,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 8,
                                color: 'rgba(255,255,255,0.35)',
                            }}
                        >
                            {i + 1}
                        </Box>
                    ))}
                </Box>

                {Array.from({ length: rack.slots }, (_, i) => (
                    <SlotDroppable key={i} rackId={rack.id} u={i + 1} hover={hover} />
                ))}

                {rack.installed.map((it) => (
                    <InstalledTile
                        key={it.instId}
                        rack={rack}
                        instId={it.instId}
                        server={it.server}
                        u={it.u}
                        hover={hover}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    height: 28,
                    px: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(0,0,0,0.3)',
                }}
            >
                <BoltOutlined sx={{ fontSize: 12, color: '#0af5b0' }} />
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.7)',
                    }}
                >
                    {totalWatts}W
                </Typography>
                <Box sx={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden', ml: 1, mr: 1 }}>
                    <Box
                        sx={{
                            width: `${Math.min(100, fillPct)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #0af5b0, #26c6da)',
                            boxShadow: '0 0 6px rgba(10,245,176,0.6)',
                        }}
                    />
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: '#0af5b0',
                    }}
                >
                    {fillPct}%
                </Typography>
            </Box>
        </Box>
    );
}

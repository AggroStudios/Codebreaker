import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
    AddTwoTone,
    FilterCenterFocusTwoTone,
    RemoveTwoTone,
} from '@mui/icons-material';

import {
    BRANCHES,
    BranchId,
    FIT_PAD,
    Skill,
    SkillId,
    SkillStatus,
    WORLD_H,
    WORLD_W,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
} from '../../includes/prestige.interface';
import { SKILLS } from '../../data/prestigeSkills';
import { usePrestigeStore } from '../../stores/prestige';
import SkillNode from './SkillNode';
import NodeInspector from './NodeInspector';
import { usePrestigeDerived } from './usePrestigeDerived';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface View {
    x: number;
    y: number;
    z: number;
    ready: boolean;
}

interface DragState {
    sx: number;
    sy: number;
    vx: number;
    vy: number;
}

interface TouchState {
    mode: 'pan' | 'pinch';
    sx: number;
    sy: number;
    vx: number;
    vy: number;
    d0: number;
    z0: number;
}

const computeStatus = (
    skill: Skill,
    allocated: Record<SkillId, boolean>,
    available: number,
): SkillStatus => {
    if (allocated[skill.id]) return 'allocated';
    const prereqsMet = skill.requires.every((r) => allocated[r]);
    if (!prereqsMet) return 'locked';
    if (skill.cost > available) return 'unaffordable';
    return 'available';
};

const BRANCH_LABEL_POS: Record<BranchId, { x: number; y: number } | null> = {
    root: null,
    N: { x: 800, y: 30 },
    E: { x: 1410, y: 600 },
    S: { x: 800, y: 1170 },
    W: { x: 190, y: 600 },
};

export default function SkillTreeCanvas() {
    const allocated = usePrestigeStore((s) => s.allocated);
    const allocate = usePrestigeStore((s) => s.allocate);
    const refund = usePrestigeStore((s) => s.refund);
    const { available } = usePrestigeDerived();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<DragState | null>(null);
    const touchRef = useRef<TouchState | null>(null);

    const [view, setView] = useState<View>({ x: 0, y: 0, z: 1, ready: false });
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState<SkillId | null>(null);

    // Fit-to-screen on mount + on resize.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const fit = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const z = Math.min(rect.width / WORLD_W, rect.height / WORLD_H) * FIT_PAD;
            const x = (rect.width - WORLD_W * z) / 2;
            const y = (rect.height - WORLD_H * z) / 2;
            setView({ x, y, z, ready: true });
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Wheel zoom — attached imperatively so we can call preventDefault.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (!el) return;
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
            setView((v) => {
                const zNew = clamp(v.z * factor, ZOOM_MIN, ZOOM_MAX);
                const k = zNew / v.z;
                return {
                    x: mx - (mx - v.x) * k,
                    y: my - (my - v.y) * k,
                    z: zNew,
                    ready: true,
                };
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('[data-node]')) return;
        dragRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        const { sx, sy, vx, vy } = dragRef.current;
        setView((v) => ({ ...v, x: vx + (e.clientX - sx), y: vy + (e.clientY - sy) }));
    };

    const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
        dragRef.current = null;
        setDragging(false);
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
            /* no-op */
        }
    };

    // Touch (pan + pinch). Pointer events handle single touch already; this
    // adds 2-finger pinch zoom.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                touchRef.current = {
                    mode: 'pinch',
                    sx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    sy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
                    vx: view.x,
                    vy: view.y,
                    d0: Math.hypot(dx, dy),
                    z0: view.z,
                };
            }
        };
        const onTouchMove = (e: TouchEvent) => {
            const t = touchRef.current;
            if (!t || t.mode !== 'pinch' || e.touches.length < 2) return;
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const d = Math.hypot(dx, dy);
            const zNew = clamp(t.z0 * (d / t.d0), ZOOM_MIN, ZOOM_MAX);
            const rect = el.getBoundingClientRect();
            const mx = t.sx - rect.left;
            const my = t.sy - rect.top;
            setView((v) => {
                const k = zNew / v.z;
                return {
                    x: mx - (mx - v.x) * k,
                    y: my - (my - v.y) * k,
                    z: zNew,
                    ready: true,
                };
            });
        };
        const onTouchEnd = () => {
            touchRef.current = null;
        };

        el.addEventListener('touchstart', onTouchStart);
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd);
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [view.x, view.y, view.z]);

    const zoomBy = (factor: number) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const mx = rect.width / 2;
        const my = rect.height / 2;
        setView((v) => {
            const zNew = clamp(v.z * factor, ZOOM_MIN, ZOOM_MAX);
            const k = zNew / v.z;
            return {
                x: mx - (mx - v.x) * k,
                y: my - (my - v.y) * k,
                z: zNew,
                ready: true,
            };
        });
    };

    const recenter = () => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const z = Math.min(rect.width / WORLD_W, rect.height / WORLD_H) * FIT_PAD;
        setView({
            x: (rect.width - WORLD_W * z) / 2,
            y: (rect.height - WORLD_H * z) / 2,
            z,
            ready: true,
        });
    };

    const handleAllocate = (skill: Skill) => {
        if (skill.id === 'genesis') return;
        const status = computeStatus(skill, allocated, available);
        if (status !== 'available') return;
        allocate(skill.id, available);
    };

    const handleRefund = (skill: Skill) => {
        refund(skill.id);
    };

    const hoveredSkill = hovered ? SKILLS.find((s) => s.id === hovered) ?? null : null;
    const hoveredStatus = hoveredSkill
        ? computeStatus(hoveredSkill, allocated, available)
        : 'available';

    // Grid background math — pans with the world, not scaled.
    const gridStep = 40 * view.z;
    const gridOffX = ((view.x % gridStep) + gridStep) % gridStep;
    const gridOffY = ((view.y % gridStep) + gridStep) % gridStep;

    return (
        <Box
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                touchAction: 'none',
                cursor: dragging ? 'grabbing' : 'grab',
                background:
                    'radial-gradient(circle at 50% 50%, rgba(10,245,176,0.06), transparent 55%),' +
                    'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.65), rgba(0,0,0,0.85))',
                userSelect: 'none',
            }}
        >
            {/* Dot grid */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 1px)',
                    backgroundSize: `${gridStep}px ${gridStep}px`,
                    backgroundPosition: `${gridOffX}px ${gridOffY}px`,
                    opacity: view.ready ? 1 : 0,
                    transition: 'opacity 225ms ease',
                }}
            />

            {/* Scaled world */}
            <Box
                sx={{
                    position: 'absolute',
                    width: WORLD_W,
                    height: WORLD_H,
                    transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
                    transformOrigin: '0 0',
                    opacity: view.ready ? 1 : 0,
                    transition: 'opacity 225ms ease',
                }}
            >
                {/* Edges + core glow */}
                <svg
                    width={WORLD_W}
                    height={WORLD_H}
                    viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                >
                    <defs>
                        <radialGradient id="prestigeRootGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#0af5b0" stopOpacity="0.45" />
                            <stop offset="60%" stopColor="#0af5b0" stopOpacity="0.06" />
                            <stop offset="100%" stopColor="#0af5b0" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx={800} cy={600} r={240} fill="url(#prestigeRootGlow)" />
                    {SKILLS.flatMap((skill) =>
                        skill.requires.map((reqId) => {
                            const req = SKILLS.find((s) => s.id === reqId);
                            if (!req) return null;
                            const bothAllocated = allocated[skill.id] && allocated[reqId];
                            const reachable = !bothAllocated && allocated[reqId];
                            const color = BRANCHES[skill.branch].color;
                            const stroke = bothAllocated
                                ? color
                                : reachable
                                    ? `${color}88`
                                    : 'rgba(255,255,255,0.12)';
                            return (
                                <line
                                    key={`${reqId}->${skill.id}`}
                                    x1={req.x}
                                    y1={req.y}
                                    x2={skill.x}
                                    y2={skill.y}
                                    stroke={stroke}
                                    strokeWidth={bothAllocated ? 3 : 2}
                                    strokeDasharray={bothAllocated ? '6 6' : reachable ? '4 6' : '2 6'}
                                    className={bothAllocated ? 'edge-active' : undefined}
                                    style={
                                        bothAllocated
                                            ? { filter: `drop-shadow(0 0 6px ${color}aa)` }
                                            : undefined
                                    }
                                />
                            );
                        }),
                    )}
                </svg>

                {/* Branch labels (in world space) */}
                {(Object.keys(BRANCH_LABEL_POS) as BranchId[]).map((b) => {
                    const pos = BRANCH_LABEL_POS[b];
                    if (!pos) return null;
                    const color = BRANCHES[b].color;
                    return (
                        <Box
                            key={b}
                            sx={{
                                position: 'absolute',
                                left: pos.x,
                                top: pos.y,
                                transform: 'translate(-50%, -50%)',
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 14,
                                fontWeight: 600,
                                letterSpacing: '0.3em',
                                color,
                                textShadow: `0 0 12px ${color}80`,
                                opacity: 0.85,
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {BRANCHES[b].label}
                        </Box>
                    );
                })}

                {/* Skill nodes */}
                {SKILLS.map((skill) => (
                    <SkillNode
                        key={skill.id}
                        skill={skill}
                        status={computeStatus(skill, allocated, available)}
                        onHover={(id) => setHovered(id)}
                        onAllocate={() => handleAllocate(skill)}
                        onRefund={() => handleRefund(skill)}
                    />
                ))}
            </Box>

            {/* Inspector overlay (fixed to container) */}
            <NodeInspector
                skill={hoveredSkill}
                status={hoveredStatus}
                available={available}
                onAllocate={() => hoveredSkill && handleAllocate(hoveredSkill)}
                onRefund={() => hoveredSkill && handleRefund(hoveredSkill)}
            />

            {/* Zoom controls */}
            <Box
                sx={{
                    position: 'absolute',
                    right: 14,
                    bottom: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                <Box
                    sx={{
                        background: 'rgba(10,16,20,0.85)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(6px)',
                        p: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.25,
                    }}
                >
                    <Tooltip title="Zoom in">
                        <IconButton size="small" onClick={() => zoomBy(1.2)}>
                            <AddTwoTone fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom out">
                        <IconButton size="small" onClick={() => zoomBy(1 / 1.2)}>
                            <RemoveTwoTone fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Recenter">
                        <IconButton size="small" onClick={recenter}>
                            <FilterCenterFocusTwoTone fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.5)',
                    }}
                >
                    ZOOM {Math.round(view.z * 100)}%
                </Typography>
            </Box>

            {/* Hint strip */}
            <Typography
                sx={{
                    position: 'absolute',
                    left: 14,
                    bottom: 14,
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.45)',
                    pointerEvents: 'none',
                }}
            >
                Drag to pan · Scroll to zoom · Click to allocate
            </Typography>
        </Box>
    );
}

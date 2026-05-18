import { MouseEvent as ReactMouseEvent } from 'react';
import { Box, Typography } from '@mui/material';

import { BRANCHES, Skill, SkillId, SkillStatus } from '../../includes/prestige.interface';

interface SkillNodeProps {
    skill: Skill;
    status: SkillStatus;
    onHover: (id: SkillId | null) => void;
    onAllocate: () => void;
    onRefund: () => void;
}

const sizeFor = (skill: Skill): number => {
    if (skill.id === 'genesis') return 96;
    if (skill.capstone) return 82;
    return 68;
};

export default function SkillNode({ skill, status, onHover, onAllocate, onRefund }: SkillNodeProps) {
    const size = sizeFor(skill);
    const isRoot = skill.id === 'genesis';
    const isCapstone = !!skill.capstone;
    const radius = isRoot || isCapstone ? Math.round(size / 4) : '50%';
    const col = BRANCHES[skill.branch].color;
    const Icon = skill.icon;

    const allocated = status === 'allocated';
    const available = status === 'available';
    const unaffordable = status === 'unaffordable';
    const locked = status === 'locked';

    const handleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (e.shiftKey || e.altKey) {
            e.preventDefault();
            onRefund();
            return;
        }
        onAllocate();
    };

    const handleContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        onRefund();
    };

    const fg = locked
        ? 'rgba(255,255,255,0.32)'
        : unaffordable
            ? `${col}aa`
            : allocated || available
                ? col
                : col;

    const bg = allocated
        ? `radial-gradient(circle at 50% 35%, ${col}33, ${col}10 70%)`
        : locked
            ? 'rgba(14,18,22,0.85)'
            : 'rgba(14,18,22,0.7)';

    const borderColor = allocated
        ? col
        : available
            ? col
            : unaffordable
                ? `${col}80`
                : 'rgba(255,255,255,0.18)';

    const borderStyle = allocated || available ? 'solid' : 'dashed';

    const boxShadow = allocated
        ? `0 0 20px ${col}55, 0 0 38px ${col}28`
        : available
            ? `0 0 12px ${col}30`
            : 'none';

    const iconSize = isRoot ? 36 : isCapstone ? 30 : 26;

    return (
        <Box
            data-node
            data-node-id={skill.id}
            onMouseEnter={() => onHover(skill.id)}
            onMouseLeave={() => onHover(null)}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            className={available ? 'node-ready' : undefined}
            sx={{
                position: 'absolute',
                left: skill.x - size / 2,
                top: skill.y - size / 2,
                width: size,
                height: size,
                borderRadius: radius,
                border: `2px ${borderStyle} ${borderColor}`,
                background: bg,
                boxShadow,
                color: fg,
                cursor: locked ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                transition: 'all 225ms cubic-bezier(0,0,0.2,1)',
                userSelect: 'none',
                pointerEvents: 'auto',
            }}
        >
            <Icon sx={{ fontSize: iconSize, color: fg }} />
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: isRoot ? 10 : 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    lineHeight: 1.1,
                    maxWidth: size - 8,
                    textAlign: 'center',
                    color: fg,
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                }}
            >
                {skill.name}
            </Typography>

            {/* Capstone notch */}
            {isCapstone && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        px: 0.75,
                        py: 0.25,
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 9,
                        letterSpacing: '0.2em',
                        color: col,
                        background: 'rgba(10,16,20,0.95)',
                        border: `1px solid ${col}`,
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    ★ CAPSTONE
                </Box>
            )}

            {/* Cost badge (non-root) */}
            {!isRoot && (
                <Box
                    sx={{
                        position: 'absolute',
                        right: -8,
                        bottom: -8,
                        minWidth: 22,
                        height: 22,
                        padding: '0 6px',
                        borderRadius: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        background: allocated ? col : 'rgba(10,16,20,0.95)',
                        border: allocated ? `1px solid ${col}` : `1px solid ${col}66`,
                        color: allocated ? '#04221a' : `${col}${unaffordable ? 'aa' : ''}`,
                        boxShadow: allocated ? `0 0 8px ${col}` : 'none',
                    }}
                >
                    {allocated ? '✓' : skill.cost}
                </Box>
            )}
        </Box>
    );
}

import { Box, Button, Typography } from '@mui/material';
import { AddTwoTone, UndoTwoTone } from '@mui/icons-material';

import { BRANCHES, Skill, SkillStatus } from '../../includes/prestige.interface';

interface NodeInspectorProps {
    skill: Skill | null;
    status: SkillStatus;
    available: number;
    onAllocate: () => void;
    onRefund: () => void;
}

const STATUS_LABEL: Record<SkillStatus, string> = {
    allocated: 'Allocated',
    available: 'Available',
    unaffordable: 'Not enough PP',
    locked: 'Locked',
};

export default function NodeInspector({
    skill,
    status,
    available,
    onAllocate,
    onRefund,
}: NodeInspectorProps) {
    if (!skill) {
        return (
            <Box
                sx={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    width: 280,
                    p: 1.75,
                    background: 'rgba(10,16,20,0.85)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(6px)',
                    pointerEvents: 'none',
                }}
            >
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        color: '#0af5b0',
                        textTransform: 'uppercase',
                        mb: 1,
                    }}
                >
                    Node Inspector
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                    Hover a skill to inspect it. Click to allocate. Shift-click (or right-click) to
                    refund.
                </Typography>
            </Box>
        );
    }

    const col = BRANCHES[skill.branch].color;
    const Icon = skill.icon;
    const allocated = status === 'allocated';
    const canAllocate = status === 'available' && skill.cost <= available;

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 14,
                left: 14,
                width: 300,
                background: 'rgba(10,16,20,0.85)',
                border: `1px solid ${col}55`,
                borderRadius: '10px',
                backdropFilter: 'blur(6px)',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    p: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    background: `linear-gradient(90deg, ${col}22, transparent)`,
                    borderBottom: `1px solid ${col}44`,
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        background: `${col}1f`,
                        border: `1px solid ${col}66`,
                        color: col,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: col,
                        }}
                    >
                        {BRANCHES[skill.branch].label}{skill.capstone ? ' · CAPSTONE' : ''}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.95)',
                            lineHeight: 1.2,
                        }}
                    >
                        {skill.name}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ p: '12px 14px', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: col,
                        letterSpacing: '0.12em',
                    }}
                >
                    {skill.short}
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                    {skill.desc}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box
                        sx={{
                            p: '8px 10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '6px',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 9,
                                fontWeight: 600,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.5)',
                                mb: 0.25,
                            }}
                        >
                            Cost
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 13,
                                fontWeight: 700,
                                color: col,
                            }}
                        >
                            {skill.cost} PP
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            p: '8px 10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '6px',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 9,
                                fontWeight: 600,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.5)',
                                mb: 0.25,
                            }}
                        >
                            Status
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 13,
                                fontWeight: 700,
                                color: col,
                            }}
                        >
                            {STATUS_LABEL[status]}
                        </Typography>
                    </Box>
                </Box>

                {allocated ? (
                    <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<UndoTwoTone />}
                        onClick={onRefund}
                        sx={{ color: 'rgba(255,255,255,0.85)' }}
                    >
                        Refund
                    </Button>
                ) : (
                    <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        startIcon={<AddTwoTone />}
                        onClick={onAllocate}
                        disabled={!canAllocate}
                        sx={{
                            bgcolor: '#0af5b0',
                            color: '#0a0f0d',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#0adf99' },
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(10,245,176,0.25)',
                                color: 'rgba(10,15,13,0.5)',
                            },
                        }}
                    >
                        Allocate
                    </Button>
                )}
            </Box>
        </Box>
    );
}

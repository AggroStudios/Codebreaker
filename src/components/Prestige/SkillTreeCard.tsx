import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { AccountTreeTwoTone, UndoTwoTone } from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import { BRANCHES, BranchId } from '../../includes/prestige.interface';
import { fmtNum } from '../../lib/utils';
import { usePrestigeStore } from '../../stores/prestige';
import { usePrestigeDerived } from './usePrestigeDerived';
import SkillTreeCanvas from './SkillTreeCanvas';

const LEGEND_BRANCHES: BranchId[] = ['N', 'E', 'S', 'W'];

export default function SkillTreeCard() {
    const refundAll = usePrestigeStore((s) => s.refundAll);
    const { available, totalSpent } = usePrestigeDerived();

    return (
        <StationCard
            avatar={AccountTreeTwoTone}
            accent={StationCardAccentType.ACCENT}
            title="Prestige Skill Tree"
            subheader="DRAG · ZOOM · ALLOCATE"
            headerAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <Chip
                        label={`${fmtNum(available)} AVAIL`}
                        size="small"
                        variant="outlined"
                        className="cyan"
                    />
                    <Chip
                        label={`${fmtNum(totalSpent)} SPENT`}
                        size="small"
                        variant="outlined"
                        className="accent"
                    />
                    <Tooltip title="Refund all">
                        <IconButton
                            size="small"
                            onClick={refundAll}
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                            <UndoTwoTone fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            }
            content={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box
                        sx={{
                            height: 680,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <SkillTreeCanvas />
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1.5,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {LEGEND_BRANCHES.map((b) => {
                                const info = BRANCHES[b];
                                return (
                                    <Box
                                        key={b}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                                    >
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                background: info.color,
                                                boxShadow: `0 0 6px ${info.color}aa`,
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                fontFamily: 'Fira Code, monospace',
                                                fontSize: 10,
                                                color: 'rgba(255,255,255,0.7)',
                                                letterSpacing: '0.16em',
                                            }}
                                        >
                                            {info.label}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 10,
                                letterSpacing: '0.16em',
                                color: 'rgba(255,255,255,0.5)',
                            }}
                        >
                            ★ CAPSTONE — ONE PER BRANCH, 6 PT
                        </Typography>
                    </Box>
                </Box>
            }
        />
    );
}

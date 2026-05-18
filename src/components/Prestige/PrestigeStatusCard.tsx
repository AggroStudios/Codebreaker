import { ReactNode } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import {
    BoltTwoTone,
    CheckCircleTwoTone,
    DiamondTwoTone,
    HubTwoTone,
    LoopTwoTone,
    MilitaryTechTwoTone,
    SettingsBackupRestoreTwoTone,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import { fmtNum } from '../../lib/utils';
import { SKILLS } from '../../data/prestigeSkills';
import { usePrestigeDerived } from './usePrestigeDerived';

interface DefRowProps {
    icon: ReactNode;
    label: string;
    value: ReactNode;
}

function DefRow({ icon, label, value }: DefRowProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 1.25,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                '&:last-of-type': { borderBottom: 'none' },
            }}
        >
            <Box sx={{ color: 'rgba(255,255,255,0.45)', display: 'flex' }}>{icon}</Box>
            <Typography
                sx={{
                    flex: 1,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.65)',
                    letterSpacing: '0.02em',
                }}
            >
                {label}
            </Typography>
            <Typography
                component="div"
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.92)',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

export default function PrestigeStatusCard() {
    const {
        level,
        levelRequirement,
        available,
        totalSpent,
        skillsAllocatedCount,
        lifetimePrestiges,
        xpPerPoint,
        canPrestige,
        xpTowardNext,
        xpToGo,
        minted,
    } = usePrestigeDerived();

    const accent = 'rgba(10,245,176,0.95)';
    const intLevel = Math.floor(level);
    const levelPct = Math.min(100, (intLevel / levelRequirement) * 100);
    const ppPct = Math.min(100, (xpTowardNext / xpPerPoint) * 100);

    return (
        <StationCard
            avatar={SettingsBackupRestoreTwoTone}
            accent={StationCardAccentType.CYAN}
            title="Prestige Status"
            subheader="OPERATOR PROFILE"
            content={
                <>
                    <DefRow
                        icon={<MilitaryTechTwoTone fontSize="small" />}
                        label="Operator level"
                        value={
                            <span style={{ color: canPrestige ? accent : undefined }}>
                                {intLevel} / {levelRequirement}
                            </span>
                        }
                    />
                    <DefRow
                        icon={<DiamondTwoTone fontSize="small" />}
                        label="Points available"
                        value={
                            <span style={{ color: available > 0 ? accent : undefined }}>
                                {fmtNum(available)}
                            </span>
                        }
                    />
                    <DefRow
                        icon={<CheckCircleTwoTone fontSize="small" />}
                        label="Points spent"
                        value={fmtNum(totalSpent)}
                    />
                    <DefRow
                        icon={<HubTwoTone fontSize="small" />}
                        label="Skills allocated"
                        value={`${skillsAllocatedCount} / ${SKILLS.length}`}
                    />
                    <DefRow
                        icon={<LoopTwoTone fontSize="small" />}
                        label="Lifetime prestiges"
                        value={
                            <span style={{ color: lifetimePrestiges > 0 ? accent : undefined }}>
                                {fmtNum(lifetimePrestiges)}
                            </span>
                        }
                    />
                    <DefRow
                        icon={<BoltTwoTone fontSize="small" />}
                        label="XP / point"
                        value={`${fmtNum(xpPerPoint)} XP`}
                    />

                    <Box sx={{ mt: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                mb: 0.5,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    color: 'rgba(255,255,255,0.55)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Level requirement
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 12,
                                    color: canPrestige ? '#0af5b0' : '#ff9800',
                                    fontWeight: 600,
                                }}
                            >
                                {Math.round(levelPct)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={levelPct}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: canPrestige ? '#0af5b0' : '#ff9800',
                                    boxShadow: canPrestige
                                        ? '0 0 6px rgba(10,245,176,0.5)'
                                        : '0 0 6px rgba(255,152,0,0.4)',
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                mb: 0.5,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    color: 'rgba(255,255,255,0.55)',
                                    textTransform: 'uppercase',
                                }}
                            >
                                PP #{minted + 1} progress
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 12,
                                    color: '#26c6da',
                                    fontWeight: 600,
                                }}
                            >
                                {fmtNum(xpToGo)} XP TO GO
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={ppPct}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#26c6da',
                                    boxShadow: '0 0 6px rgba(38,198,218,0.5)',
                                },
                            }}
                        />
                    </Box>
                </>
            }
        />
    );
}


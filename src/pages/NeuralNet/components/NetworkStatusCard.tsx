import { ReactNode, useMemo } from 'react';
import { Box, Chip, LinearProgress, Typography } from '@mui/material';
import {
    BoltOutlined,
    DeveloperBoardOutlined,
    HubOutlined,
    MemoryOutlined,
    MilitaryTechOutlined,
    ModelTrainingOutlined,
    TrendingUpOutlined,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../../../components/StationCard';
import {
    bonusFromPoints,
    computeTotalPoints,
    modelLevelFromTotal,
    pointsAt,
    useNeuralNetStore,
} from '../../../stores/neuralNet';
import { NEURAL_NET_CIPHERS } from '../../../data/cipherList';
import { fmtNum } from '../../../lib/utils';

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

export default function NetworkStatusCard() {
    const library = useNeuralNetStore((s) => s.library);
    const active = useNeuralNetStore((s) => s.active);
    const currentCipher = useNeuralNetStore((s) => s.currentCipher);
    const sessionSeconds = useNeuralNetStore((s) => s.sessionSeconds);

    const { trainedCount, avgBonus, totalPts, modelLevel } = useMemo(() => {
        const totalCiphers = NEURAL_NET_CIPHERS.length;
        const trained = Object.values(library).filter((e) => e.seconds > 0).length;
        const bonuses = Object.values(library)
            .map((e) => bonusFromPoints(pointsAt(e.seconds)))
            .filter((b) => b > 0);
        const avg = bonuses.length === 0 ? 0 : bonuses.reduce((a, b) => a + b, 0) / bonuses.length;
        const total = computeTotalPoints({ library, currentCipher, sessionSeconds } as never);
        return {
            trainedCount: `${trained} / ${totalCiphers}`,
            avgBonus: `+${avg.toFixed(1)}%`,
            totalPts: total,
            modelLevel: `L${modelLevelFromTotal(total)}`,
        };
    }, [library, currentCipher, sessionSeconds]);

    const meterValue = Math.min(100, Math.log10(totalPts + 1) * 14);
    const accent = 'rgba(10,245,176,0.95)';

    return (
        <StationCard
            avatar={HubOutlined}
            accent={StationCardAccentType.CYAN}
            title="Network Status"
            subheader="MODEL TELEMETRY"
            headerAction={
                <Chip
                    size="small"
                    label={active ? 'LIVE' : 'IDLE'}
                    variant="outlined"
                    sx={{
                        color: active ? '#0af5b0' : 'rgba(255,255,255,0.55)',
                        borderColor: active ? 'rgba(10,245,176,0.55)' : 'rgba(255,255,255,0.18)',
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        mr: 1,
                    }}
                />
            }
            content={
                <>
                    <DefRow
                        icon={<MemoryOutlined fontSize="small" />}
                        label="Architecture"
                        value="5 × 8 × 8 × 6 × 4 MLP"
                    />
                    <DefRow
                        icon={<DeveloperBoardOutlined fontSize="small" />}
                        label="Parameters"
                        value="442,368"
                    />
                    <DefRow
                        icon={<BoltOutlined fontSize="small" />}
                        label="Optimizer"
                        value="AdamW (β=0.9)"
                    />
                    <DefRow
                        icon={<ModelTrainingOutlined fontSize="small" />}
                        label="Ciphers trained"
                        value={<span style={{ color: accent }}>{trainedCount}</span>}
                    />
                    <DefRow
                        icon={<TrendingUpOutlined fontSize="small" />}
                        label="Avg. bonus"
                        value={<span style={{ color: accent }}>{avgBonus}</span>}
                    />
                    <DefRow
                        icon={<MilitaryTechOutlined fontSize="small" />}
                        label="Model level"
                        value={<span style={{ color: accent }}>{modelLevel}</span>}
                    />

                    <Box sx={{ mt: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                mb: 0.75,
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
                                Cumulative training
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 12,
                                    color: '#0af5b0',
                                    fontWeight: 600,
                                }}
                            >
                                {fmtNum(totalPts)} pts
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={meterValue}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(90deg, #0af5b0, #9ffce0)',
                                    boxShadow: '0 0 8px rgba(10,245,176,0.5)',
                                },
                            }}
                        />
                    </Box>
                </>
            }
        />
    );
}

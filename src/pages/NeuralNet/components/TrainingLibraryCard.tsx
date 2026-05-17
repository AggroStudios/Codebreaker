import { useMemo } from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    DatasetOutlined,
    LockOutlined,
    RestartAltOutlined,
    SwapHorizOutlined,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../../../components/StationCard';
import {
    bonusFromPoints,
    pointsAt,
    useNeuralNetStore,
} from '../../../stores/neuralNet';
import { NEURAL_NET_CIPHERS } from '../../../data/cipherList';
import { fmtNum, formatBlock } from '../../../lib/utils';
import { ICipherType } from '../../../includes/Cipher.interface';

const COLS = '1.6fr 1.4fr 2fr 1fr 1.2fr 110px';

interface RowProps {
    cipher: ICipherType;
    pts: number;
    sessions: number;
    lastTrained: string;
    isActive: boolean;
    maxPts: number;
    onSwitch: () => void;
    onReset: () => void;
}

function LibraryRow({ cipher, pts, sessions, lastTrained, isActive, maxPts, onSwitch, onReset }: RowProps) {
    const bonus = bonusFromPoints(pts);
    const maxBonus = bonusFromPoints(maxPts);
    const pctOfMax = maxBonus === 0 ? 0 : Math.round((bonus / maxBonus) * 100);
    const fillPct = maxPts === 0
        ? 0
        : (Math.log10(pts + 1) / Math.log10(maxPts + 1)) * 100;

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: COLS,
                gap: 1.5,
                alignItems: 'center',
                px: 2.5,
                py: 1.75,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: isActive
                    ? 'linear-gradient(90deg, rgba(10,245,176,0.10), transparent 70%)'
                    : 'transparent',
            }}
        >
            {isActive && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 6,
                        bottom: 6,
                        width: 3,
                        background: '#0af5b0',
                        boxShadow: '0 0 8px rgba(10,245,176,0.7)',
                        borderRadius: '0 2px 2px 0',
                    }}
                />
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: isActive ? 'rgba(10,245,176,0.18)' : 'rgba(255,255,255,0.06)',
                        color: isActive ? '#0af5b0' : 'rgba(255,255,255,0.55)',
                        border: isActive
                            ? '1px solid rgba(10,245,176,0.55)'
                            : '1px solid rgba(255,255,255,0.10)',
                    }}
                >
                    <LockOutlined fontSize="small" />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.92)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {cipher.name}
                        </Typography>
                        {isActive && (
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: '#0af5b0',
                                    boxShadow: '0 0 6px #0af5b0',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                    </Box>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.45)',
                        }}
                    >
                        C{cipher.complexity} · {formatBlock(cipher)}
                    </Typography>
                </Box>
            </Box>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    color: pts > 0 ? '#0af5b0' : 'rgba(255,255,255,0.4)',
                }}
            >
                {fmtNum(pts)}
            </Typography>

            <Box>
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
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 12,
                            color: bonus > 0 ? '#9ffce0' : 'rgba(255,255,255,0.4)',
                        }}
                    >
                        +{bonus.toFixed(1)}%
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.45)',
                        }}
                    >
                        {pctOfMax}%
                    </Typography>
                </Box>
                <Box sx={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            width: `${Math.min(100, fillPct)}%`,
                            height: '100%',
                            background: isActive
                                ? 'linear-gradient(90deg, #0af5b0, #9ffce0)'
                                : 'rgba(10,245,176,0.4)',
                            boxShadow: isActive ? '0 0 6px rgba(10,245,176,0.6)' : 'none',
                        }}
                    />
                </Box>
            </Box>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                }}
            >
                {sessions}
            </Typography>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.55)',
                }}
            >
                {isActive ? 'now' : lastTrained}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                {isActive ? (
                    <Chip
                        size="small"
                        variant="outlined"
                        label="ACTIVE"
                        sx={{
                            color: '#0af5b0',
                            borderColor: 'rgba(10,245,176,0.55)',
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            letterSpacing: '0.18em',
                        }}
                    />
                ) : (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SwapHorizOutlined />}
                        onClick={onSwitch}
                        sx={{
                            color: '#0af5b0',
                            borderColor: 'rgba(10,245,176,0.55)',
                            '&:hover': {
                                borderColor: '#0af5b0',
                                backgroundColor: 'rgba(10,245,176,0.08)',
                            },
                        }}
                    >
                        Train
                    </Button>
                )}
                <Tooltip title="Reset progress">
                    <IconButton size="small" onClick={onReset} sx={{ color: 'rgba(255,255,255,0.45)' }}>
                        <RestartAltOutlined fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}

export default function TrainingLibraryCard() {
    const library = useNeuralNetStore((s) => s.library);
    const currentCipher = useNeuralNetStore((s) => s.currentCipher);
    const sessionSeconds = useNeuralNetStore((s) => s.sessionSeconds);
    const switchCipher = useNeuralNetStore((s) => s.switchCipher);
    const resetCipher = useNeuralNetStore((s) => s.resetCipher);

    const rows = useMemo(() => {
        const computed = NEURAL_NET_CIPHERS.map((cipher) => {
            const entry = library[cipher.name];
            const banked = entry?.seconds ?? 0;
            const isActive = cipher.name === currentCipher;
            const totalSec = banked + (isActive ? sessionSeconds : 0);
            return {
                cipher,
                pts: pointsAt(totalSec),
                sessions: entry?.sessions ?? 0,
                lastTrained: entry?.lastTrained ?? '—',
                isActive,
            };
        });
        return computed.sort((a, b) => b.pts - a.pts);
    }, [library, currentCipher, sessionSeconds]);

    const maxPts = rows.reduce((max, r) => Math.max(max, r.pts), 0);
    const trainedCount = rows.filter((r) => r.pts > 0).length;

    return (
        <StationCard
            avatar={DatasetOutlined}
            accent={StationCardAccentType.CYAN}
            title="Training Library"
            subheader="ACCUMULATED PROGRESS PER CIPHER"
            headerAction={
                <Chip
                    size="small"
                    variant="outlined"
                    label={`${trainedCount}/${NEURAL_NET_CIPHERS.length} TRAINED`}
                    sx={{
                        color: '#26c6da',
                        borderColor: 'rgba(38,198,218,0.55)',
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        mr: 1,
                    }}
                />
            }
            content={
                <Box sx={{ mx: -2, mt: -2, mb: -3 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: COLS,
                            gap: 1.5,
                            px: 2.5,
                            py: 1.25,
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.18em',
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                        }}
                    >
                        <span>Cipher</span>
                        <span>Points</span>
                        <span>Speed bonus</span>
                        <span>Sessions</span>
                        <span>Last trained</span>
                        <span />
                    </Box>

                    {rows.map((r) => (
                        <LibraryRow
                            key={r.cipher.name}
                            cipher={r.cipher}
                            pts={r.pts}
                            sessions={r.sessions}
                            lastTrained={r.lastTrained}
                            isActive={r.isActive}
                            maxPts={maxPts}
                            onSwitch={() => switchCipher(r.cipher.name)}
                            onReset={() => resetCipher(r.cipher.name)}
                        />
                    ))}
                </Box>
            }
        />
    );
}

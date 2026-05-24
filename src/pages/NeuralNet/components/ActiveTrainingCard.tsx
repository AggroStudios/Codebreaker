import {
    Box,
    Button,
    Chip,
    IconButton,
    LinearProgress,
    MenuItem,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    ArticleOutlined,
    AutoAwesomeOutlined,
    PauseRounded,
    PlayArrowRounded,
    SaveOutlined,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../../../components/StationCard';
import {
    bonusFromPoints,
    epochProgressAt,
    pointsAt,
    useNeuralNetStore,
} from '../../../stores/neuralNet';
import { NEURAL_NET_CIPHERS } from '../../../data/cipherList';
import { formatBlock } from '../../../lib/utils';
import NeuralNetCanvas from './NeuralNetCanvas';

const pad2 = (n: number) => String(n).padStart(2, '0');
const fmtSession = (s: number) => {
    const sec = Math.floor(s);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const ss = sec % 60;
    return h > 0 ? `${h}:${pad2(m)}:${pad2(ss)}` : `${pad2(m)}:${pad2(ss)}`;
};

interface HudStatProps {
    label: string;
    value: string;
    accent?: boolean;
}

function HudStat({ label, value, accent }: HudStatProps) {
    return (
        <Box
            sx={{
                flex: 1,
                p: '8px 10px',
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                backdropFilter: 'blur(4px)',
            }}
        >
            <Typography
                sx={{
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    fontFamily: 'Fira Code, monospace',
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontSize: 16,
                    fontFamily: 'Fira Code, monospace',
                    fontWeight: 700,
                    color: accent ? '#0af5b0' : 'rgba(255,255,255,0.9)',
                    textShadow: accent ? '0 0 10px rgba(10,245,176,0.5)' : 'none',
                    lineHeight: 1.2,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

export default function ActiveTrainingCard() {
    const currentCipher = useNeuralNetStore((s) => s.currentCipher);
    const active = useNeuralNetStore((s) => s.active);
    const sessionSeconds = useNeuralNetStore((s) => s.sessionSeconds);
    const library = useNeuralNetStore((s) => s.library);
    const selectCipher = useNeuralNetStore((s) => s.selectCipher);
    const togglePause = useNeuralNetStore((s) => s.togglePause);
    const commitSession = useNeuralNetStore((s) => s.commitSession);
    const setActive = useNeuralNetStore((s) => s.setActive);

    const cipherInfo = NEURAL_NET_CIPHERS.find((c) => c.name === currentCipher);
    const sessionPts = currentCipher
        ? pointsAt((library[currentCipher]?.seconds ?? 0) + sessionSeconds)
          - pointsAt(library[currentCipher]?.seconds ?? 0)
        : 0;
    const currentBonus = currentCipher
        ? bonusFromPoints(pointsAt((library[currentCipher]?.seconds ?? 0) + sessionSeconds))
        : 0;
    // Each successive epoch is exponentially longer than the previous one.
    const epoch = epochProgressAt(sessionSeconds);
    const epochProgress = epoch.progress;
    const epochRemaining = epoch.remaining;
    const epochCount = epoch.count;

    const stateLabel = !currentCipher ? 'IDLE' : active ? 'TRAINING' : 'PAUSED';
    const stateColor =
        stateLabel === 'TRAINING'
            ? '#0af5b0'
            : stateLabel === 'PAUSED'
                ? '#ff9800'
                : 'rgba(255,255,255,0.55)';

    const handleSelect = (name: string) => {
        if (!name) return;
        selectCipher(name);
        setActive(true);
    };

    const handleToggle = () => {
        if (!currentCipher) return;
        togglePause();
    };

    const subheader = cipherInfo
        ? `TARGET · ${cipherInfo.name} · ${formatBlock(cipherInfo)}`
        : 'NO TARGET SELECTED';

    return (
        <StationCard
            avatar={AutoAwesomeOutlined}
            accent={StationCardAccentType.ACCENT}
            title="Active Training"
            subheader={subheader}
            headerAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <Chip
                        size="small"
                        label={stateLabel}
                        variant="outlined"
                        sx={{
                            color: stateColor,
                            borderColor: `${stateColor}88`,
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            letterSpacing: '0.18em',
                        }}
                    />
                    <Tooltip title="Logs">
                        <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                            <ArticleOutlined fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            }
            content={
                <>
                    <Box sx={{ position: 'relative' }}>
                        <NeuralNetCanvas active={active && currentCipher != null} cipherName={currentCipher} />

                        {/* Top-right HUD */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                p: '8px 12px',
                                background: 'rgba(0,0,0,0.55)',
                                border: '1px solid rgba(10,245,176,0.45)',
                                borderRadius: 1,
                                backdropFilter: 'blur(4px)',
                                display: 'grid',
                                gridTemplateColumns: 'auto auto',
                                columnGap: 1.25,
                                rowGap: 0.25,
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 11,
                            }}
                        >
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>session</span>
                            <span style={{ color: '#0af5b0', textAlign: 'right' }}>
                                {fmtSession(sessionSeconds)}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>epoch</span>
                            <span style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'right' }}>
                                {epochCount}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>+pts/s</span>
                            <span
                                style={{
                                    color: active && currentCipher ? '#9ffce0' : 'rgba(255,255,255,0.4)',
                                    textAlign: 'right',
                                }}
                            >
                                {active && currentCipher ? '×1.05' : '—'}
                            </span>
                        </Box>

                        {/* Bottom 3-stat strip */}
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 12,
                                right: 12,
                                bottom: 12,
                                display: 'flex',
                                gap: 1.25,
                            }}
                        >
                            <HudStat label="Session pts" value={String(sessionPts)} accent />
                            <HudStat label="Current bonus" value={`+${currentBonus.toFixed(1)}%`} />
                            <HudStat label="Epoch" value={`${Math.round(epochProgress)}%`} />
                        </Box>
                    </Box>

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
                                Next epoch
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 11,
                                    color: '#0af5b0',
                                }}
                            >
                                {epochRemaining}s
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={epochProgress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: active ? '#0af5b0' : '#ff9800',
                                    boxShadow: active
                                        ? '0 0 6px rgba(10,245,176,0.6)'
                                        : '0 0 6px rgba(255,152,0,0.4)',
                                },
                            }}
                        />
                    </Box>
                </>
            }
            action={
                <Box
                    sx={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: 1.25,
                        alignItems: 'center',
                    }}
                >
                    <Select
                        size="small"
                        displayEmpty
                        value={currentCipher ?? ''}
                        onChange={(e) => handleSelect(String(e.target.value))}
                        sx={{
                            background: 'rgba(0,0,0,0.35)',
                            borderRadius: 1,
                            '& .MuiSelect-select': { py: 1 },
                        }}
                    >
                        <MenuItem value="" disabled>
                            Select target cipher…
                        </MenuItem>
                        {NEURAL_NET_CIPHERS.map((c) => (
                            <MenuItem key={c.name} value={c.name}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <Typography sx={{ fontWeight: 500 }}>{c.name}</Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: 'Fira Code, monospace',
                                            fontSize: 11,
                                            color: 'rgba(255,255,255,0.45)',
                                        }}
                                    >
                                        C{c.complexity}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>

                    <Button
                        variant="outlined"
                        color={active ? 'inherit' : 'primary'}
                        disabled={!currentCipher}
                        onClick={handleToggle}
                        startIcon={active ? <PauseRounded /> : <PlayArrowRounded />}
                    >
                        {active ? 'Pause' : 'Resume'}
                    </Button>

                    <Button
                        variant="contained"
                        disabled={sessionPts < 1}
                        onClick={() => commitSession()}
                        startIcon={<SaveOutlined />}
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
                        Commit
                    </Button>
                </Box>
            }
        />
    );
}

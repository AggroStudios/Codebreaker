import { Box, Chip } from '@mui/material';

import NetworkStatusCard from './components/NetworkStatusCard';
import ActiveTrainingCard from './components/ActiveTrainingCard';
import TrainingLibraryCard from './components/TrainingLibraryCard';

import './style.scss';
import { computeTotalPoints, useNeuralNetStore } from '../../stores/neuralNet';
import { MemoryOutlined, PsychologyTwoTone } from '@mui/icons-material';
import { fmtNum } from '../../lib/utils';
import PageHeader from '../../components/common/PageHeader';

export default function NeuralNet() {

    const active = useNeuralNetStore((s) => s.active);
    const library = useNeuralNetStore((s) => s.library);
    const currentCipher = useNeuralNetStore((s) => s.currentCipher);
    const sessionSeconds = useNeuralNetStore((s) => s.sessionSeconds);

    const totalPts = computeTotalPoints({ library, currentCipher, sessionSeconds } as never);

    return (
        <Box className="neural-net-page">
            <PageHeader
                className="neural-net-header"
                title="Neural Net"
                subtitle="Train your model on a target cipher to accumulate exponential training points. Banked points convert into a permanent speed bonus on that cipher."
                breadcrumbs={['home', 'neural-net']}
                icon={PsychologyTwoTone}
                actions={
                    <div className="chips">
                        {active ? (
                            <Chip
                                label="TRAINING"
                                size="small"
                                variant="outlined"
                                className="accent"
                                style={{ marginRight: 6 }}
                                icon={<span className="live-dot" />}
                                aria-live="polite"
                            />
                        ) : (
                            <Chip
                                label="PAUSED"
                                size="small"
                                variant="outlined"
                                className="orange"
                                style={{ marginRight: 6 }}
                                aria-live="polite"
                            />
                        )}
                        <Chip
                            label={`${fmtNum(totalPts)} TOTAL PTS`}
                            variant="outlined"
                            className="cyan"
                            icon={<MemoryOutlined fontSize="small" />}
                        />
                    </div>
                }
            />
            <Box className="neural-net-content">
                <Box className="neural-net-grid">
                    <NetworkStatusCard />
                    <ActiveTrainingCard />
                </Box>
                <Box sx={{ mt: 2.5 }}>
                    <TrainingLibraryCard />
                </Box>
            </Box>
        </Box>
    );
}

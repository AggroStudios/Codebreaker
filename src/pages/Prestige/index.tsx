import { Box } from '@mui/material';

import PrestigeHeader from '../../components/Prestige/PrestigeHeader';
import PrestigeStatusCard from '../../components/Prestige/PrestigeStatusCard';
import MechanismCard from '../../components/Prestige/MechanismCard';
import SkillTreeCard from '../../components/Prestige/SkillTreeCard';

import './style.scss';

export default function Prestige() {
    return (
        <Box className="prestige-page">
            <PrestigeHeader />
            <Box className="prestige-content">
                <Box className="prestige-top-row">
                    <PrestigeStatusCard />
                    <MechanismCard />
                </Box>
                <Box sx={{ mt: 2.5 }}>
                    <SkillTreeCard />
                </Box>
            </Box>
        </Box>
    );
}

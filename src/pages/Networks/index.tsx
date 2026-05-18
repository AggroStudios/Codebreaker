import { Box, Chip } from '@mui/material';

import NetworkOverviewCard from '../../components/Networks/NetworkOverviewCard';
import NetworkTrafficCard from '../../components/Networks/NetworkTrafficCard';
import InterDcLinksCard from '../../components/Networks/InterDcLinksCard';
import FirewallsSection from '../../components/Networks/FirewallsSection';

import './style.scss';
import { useNetworksStore } from '../../stores/networks';
import PageHeader from '../../components/common/PageHeader';
import { CableTwoTone, RouterTwoTone, ShieldTwoTone } from '@mui/icons-material';
import { fmtNum } from '../../lib/utils';

export default function Networks() {

    const links = useNetworksStore((s) => s.links);
    const firewalls = useNetworksStore((s) => s.firewalls);

    const activeLinks = links.filter((l) => l.status === 'ACTIVE').length;
    const totalThreats = firewalls.reduce((sum, f) => sum + f.threatsBlocked24h, 0);

    return (
        <Box className="networks-page">
            <PageHeader
                className="networks-header"
                title="Networks"
                subtitle="Manage interconnects between contracted data centers and the firewalls protecting them — and the station."
                breadcrumbs={['home', 'networks']}
                icon={RouterTwoTone}
                actions={
                    <div className="chips">
                        <Chip
                            label="ONLINE"
                            size="small"
                            variant="outlined"
                            className="accent"
                            style={{ marginRight: 6 }}
                            icon={<span className="live-dot" />}
                            aria-live="polite"
                        />
                        <Chip
                            label={`${activeLinks} LINKS`}
                            variant="outlined"
                            icon={<CableTwoTone fontSize="small" />}
                        />
                        <Chip
                            label={`${fmtNum(totalThreats)} THREATS BLOCKED`}
                            variant="outlined"
                            className="accent"
                            icon={<ShieldTwoTone fontSize="small" />}
                        />
                    </div>
                }
            />
            <Box className="networks-content">
                <Box className="networks-top-row">
                    <NetworkOverviewCard />
                    <NetworkTrafficCard />
                </Box>
                <Box sx={{ mt: 2.5 }}>
                    <InterDcLinksCard />
                </Box>
                <FirewallsSection />
            </Box>
        </Box>
    );
}

import { Box, Chip, Grid, Tab, Tabs } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { DnsOutlined, Lan, StorageTwoTone, StorefrontOutlined } from '@mui/icons-material';

import SERVERS from '../../data/servers';
import ServerCard from '../../components/ServerCard';
import ServerFilters, { ServerFilters as ServerFiltersType, ServerPriceMinMax } from '../../components/ServerFilters';
import { usePlayerStore } from '../../stores/player';
import { serverMatchesFilters } from './filterServers';

import './style.scss';
import { useMemo, useState } from 'react';

const ServersMarketplace = () => {

    const [filters, setFilters] = useState<ServerFiltersType>({});
    const playerMoney = usePlayerStore((s) => s.player.money);

    const filteredServers = useMemo(
        () => SERVERS.filter((server) => serverMatchesFilters(server, filters, playerMoney)),
        [filters, playerMoney],
    );

    const serverPriceMinMax = useMemo((): ServerPriceMinMax => {
        return {
            min: Math.min(...SERVERS.map((server) => server.price)),
            max: Math.max(...SERVERS.map((server) => server.price)),
        };
    }, []);

    const serversForTierCounts = useMemo(
        () =>
            SERVERS.filter((server) =>
                serverMatchesFilters(
                    server,
                    { ...filters, tierId: undefined },
                    playerMoney,
                ),
            ),
        [filters, playerMoney],
    );

    const handleFiltersChange = (next: ServerFiltersType) => {
        setFilters(next);
    };

    return (
        <div className="servers-container">
            <div className="servers-scroll">
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <span>Deal of the day shows here.</span>
                    </Grid>
                    <Grid
                        container
                        spacing={2}
                        size={12}
                        className="servers-marketplace-container"
                    >
                        <Grid size={{ xs: 12, md: 3, lg: 2 }} className="servers-filters-column">
                            <ServerFilters servers={serversForTierCounts} onChange={handleFiltersChange} priceRange={serverPriceMinMax} />
                        </Grid>
                        <Grid container spacing={2} size={{ xs: 12, md: 9, lg: 10 }}>
                            {filteredServers.map((server) => (
                                <Grid size={{ xs: 12, md: 6, lg: 6, xl: 4 }} key={server.model}>
                                    <ServerCard server={server} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default function Servers() {
    const [value, setValue] = useState(0);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <div className="servers-page">
            <PageHeader
                className="servers-header"
                title="Servers Store"
                subtitle="Buy and sell servers from the marketplace to build your own code breaking empire."
                breadcrumbs={['home', 'servers']}
                actions={
                    <div className="chips">
                        <Chip label="ONLINE" size="small" variant="outlined" className="accent" style={{ marginRight: 6 }} icon={<span className="live-dot" />} />
                        <Chip label="ALL UPLINKS UP" variant="outlined" icon={<Lan fontSize="small" />} />
                    </div>
                }
                icon={StorageTwoTone}
            />
            <Box className="servers-tabs-container">
                <Tabs value={value} onChange={handleChange} className="servers-tabs" scrollButtons={false}>
                    <Tab icon={<StorefrontOutlined />} iconPosition="start" label="Marketplace" value={0} />
                    <Tab icon={<DnsOutlined />} iconPosition="start" label="My Servers" value={1} />
                </Tabs>
            </Box>
            {value === 0 && <ServersMarketplace />}
            {value === 1 && <div>Server Inventory goes here.</div>}
        </div>
    );
}

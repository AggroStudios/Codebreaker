import { Box, Chip, Grid, Tab, Tabs } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { DnsOutlined, Lan, StorageTwoTone, StorefrontOutlined } from '@mui/icons-material';

import ServerCard from '../../components/ServerCard';
import ServerFilters, { ServerFilters as ServerFiltersType, ServerPriceMinMax } from '../../components/ServerFilters';
import { usePlayerStore } from '../../stores/player';
import { serverMatchesFilters } from './filterServers';

import './style.scss';
import { useEffect, useMemo, useState } from 'react';
import ServerDailyDealCard from '../../components/ServerDailyDealCard';
import ServerSortBar from '../../components/ServerSortBar';
import { Server, ServerTier } from '../../includes/Servers.interface';
import { useServersStore } from '../../stores/servers';

const TIER_ORDER: Record<ServerTier, number> = Object.values(ServerTier).reduce(
    (acc, tier, index) => ({ ...acc, [tier]: index }),
    {} as Record<ServerTier, number>,
);

const ServersMarketplace = () => {
    const servers = useServersStore((s) => s.servers);
    const dailyDeal = useServersStore((s) => s.dailyDeal);
    const dealServer = dailyDeal?.server ?? servers[0];
    const dealDiscount = dailyDeal?.discountPercent ?? 13;

    const [filters, setFilters] = useState<ServerFiltersType>({});
    const [sortBy, setSortBy] = useState<string>('tierAsc');
    const playerMoney = usePlayerStore((s) => s.player.money);

    const purchasedServers = useServersStore((s) => s.purchasedServers);
    const purchaseServer = useServersStore((s) => s.purchaseServer);
    // const sellServer = useServersStore((s) => s.sellServer);

    const filteredServers = useMemo(
        () => {
            const filtered = servers.filter((server) => serverMatchesFilters(server, filters, playerMoney));
            return [...filtered].sort((a, b) => {
                switch (sortBy) {
                    case 'tierAsc':
                        return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
                    case 'tierDesc':
                        return TIER_ORDER[b.tier] - TIER_ORDER[a.tier];
                    case 'priceAsc':
                        return a.price - b.price;
                    case 'priceDesc':
                        return b.price - a.price;
                    default:
                        return 0;
                }
            });
        },
        [filters, playerMoney, sortBy],
    );

    const serverPriceMinMax = useMemo((): ServerPriceMinMax => {
        return {
            min: Math.min(...servers.map((server) => server.price)),
            max: Math.max(...servers.map((server) => server.price)),
        };
    }, []);

    const serversForTierCounts = useMemo(
        () =>
            servers.filter((server) =>
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

    const handleSort = (sortBy: string) => {
        setSortBy(sortBy);
    };

    const handleBuy = (server: Server) => {
        console.log('handleBuy', server);
        purchaseServer(server);
    };

    return (
        <div className="servers-container">
            <div className="servers-scroll">
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <ServerDailyDealCard
                            server={dealServer}
                            discount={dealDiscount}
                            owned={purchasedServers.filter((server) => server.manufacturer === dealServer.manufacturer && server.model === dealServer.model).length}
                            onPurchase={handleBuy}
                        />
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
                            <Grid size={12} className="servers-sort-row">
                                <ServerSortBar servers={filteredServers} totalServers={servers.length} onSort={handleSort} />
                            </Grid>
                            {filteredServers.map((server) => (
                                <Grid size={{ xs: 12, md: 6, lg: 6, xl: 4 }} key={server.model}>
                                    <ServerCard server={server} owned={purchasedServers.filter((s) => s.manufacturer === server.manufacturer && s.model === server.model).length} onBuy={handleBuy} />
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
    const [inventoryMounted, setInventoryMounted] = useState(false);

    const purchasedServers = useServersStore((s) => s.purchasedServers);

    useEffect(() => {
        if (value === 1) {
            setInventoryMounted(true);
        }
    }, [value]);

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
                    <Tab
                        id="servers-tab-marketplace"
                        aria-controls="servers-tabpanel-marketplace"
                        icon={<StorefrontOutlined />}
                        iconPosition="start"
                        label="Marketplace"
                        value={0}
                    />
                    <Tab
                        id="servers-tab-inventory"
                        aria-controls="servers-tabpanel-inventory"
                        icon={<DnsOutlined />}
                        iconPosition="start"
                        label="My Servers"
                        value={1}
                    />
                </Tabs>
            </Box>
            <Box className="servers-tab-panels">
                <Box
                    className="servers-tab-panel"
                    role="tabpanel"
                    id="servers-tabpanel-marketplace"
                    aria-labelledby="servers-tab-marketplace"
                    hidden={value !== 0}
                    sx={{
                        display: value === 0 ? 'flex' : 'none',
                        flexDirection: 'column',
                    }}
                >
                    <ServersMarketplace />
                </Box>
                {inventoryMounted ? (
                    <Box
                        className="servers-tab-panel"
                        role="tabpanel"
                        id="servers-tabpanel-inventory"
                        aria-labelledby="servers-tab-inventory"
                        hidden={value !== 1}
                        sx={{
                            display: value === 1 ? 'flex' : 'none',
                            flexDirection: 'column',
                        }}
                    >
                        <div className="servers-container">
                            <div className="servers-scroll">
                                {purchasedServers.map((server, key) => 
                                    <div key={key}>{server.name} - {server.tier} - {server.manufacturer} - {server.model}</div>
                                )}
                            </div>
                        </div>
                    </Box>
                ) : null}
            </Box>
        </div>
    );
}

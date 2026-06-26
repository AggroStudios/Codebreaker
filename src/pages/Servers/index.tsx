import { Box, Chip, Grid, IconButton, Tab, Table, TableBody, TableFooter, TablePagination, TableRow, Tabs, useTheme } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { BoltOutlined, DnsOutlined, KeyboardArrowLeft, KeyboardArrowRight, Lan, MemoryOutlined, SpeedOutlined, StorageTwoTone, StorefrontOutlined, WalletOutlined, WarningAmberOutlined } from '@mui/icons-material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ServerCard from '../../components/ServerCard';
import ServerFilters, { ServerFilters as ServerFiltersType, ServerPriceMinMax } from '../../components/ServerFilters';
import { usePlayerStore } from '../../stores/player';
import { serverMatchesFilters } from './filterServers';

import './style.scss';
import { useEffect, useMemo, useState } from 'react';
import ServerDailyDealCard from '../../components/ServerDailyDealCard';
import ServerSortBar from '../../components/ServerSortBar';
import { Server, ServerFormFactor, ServerTier } from '../../includes/Servers.interface';
import { useServersStore } from '../../stores/servers';
import { Stat } from '../../components/common/Stat';
import { formatPower, formatMoney } from '../../lib/utils';
import { useDataCentersStore } from '../../stores/dataCenters';
import { ServerRow, ServerRowHeader } from '../../components/ServerRow';

const TIER_ORDER: Record<ServerTier, number> = Object.values(ServerTier).reduce(
    (acc, tier, index) => ({ ...acc, [tier]: index }),
    {} as Record<ServerTier, number>,
);

interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number,
    ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, page + 1);
    };
  
    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
}

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

const FORM_FACTOR_SIZE: Record<ServerFormFactor, number> = {
    [ServerFormFactor.ONE_U]: 1,
    [ServerFormFactor.TWO_U]: 2,
    [ServerFormFactor.THREE_U]: 3,
    [ServerFormFactor.FOUR_U]: 4,
    [ServerFormFactor.FIVE_U]: 5,
};

export default function Servers() {
    const [value, setValue] = useState(0);
    const [inventoryMounted, setInventoryMounted] = useState(false);
    const [pageHeaderTitle, setPageHeaderTitle] = useState('Servers Store');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const purchasedServers = useServersStore((s) => s.purchasedServers);
    const marketplaceCount = useServersStore((s) => s.servers.length);
    const playerMoney = usePlayerStore((s) => s.player.money);
    const totalRacks = useDataCentersStore((s) => Object.values(s.contracts).reduce((acc, contract) => acc + contract.racks || 0, 0));

    const rackSize = 42;
    const totalRackSize = totalRacks * rackSize;

    const totalServerSize = purchasedServers.reduce((acc, server) => acc + (FORM_FACTOR_SIZE[server.formFactor] ?? 0), 0);

    const powerDraw = formatPower(purchasedServers.reduce((acc, server) => acc + (server.powerConsumption ?? 0), 0));

    const totalCompute = purchasedServers.reduce((acc, server) => acc + (server.processes ?? []).length, 0);

    useEffect(() => {
        if (value === 1) {
            setInventoryMounted(true);
            setPageHeaderTitle('My Servers');
        }
        else {
            setPageHeaderTitle('Servers Store');
        }
    }, [value]);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handlePageChange = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="servers-page">
            <PageHeader
                className="servers-header"
                title={pageHeaderTitle}
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
                <Grid className="servers-stats-container" container spacing={2}>
                    <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                        <Stat className="background" titleIcon={<WalletOutlined />} titleIconAccent='accent' label="Wallet" value={`$${formatMoney(playerMoney)}`} accent='accent' subheader="Liquid Funds" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                        <Stat className="background" titleIcon={<StorageTwoTone />} titleIconAccent='accent' label="Total Servers" value={`${purchasedServers.length}`} subheader={`${totalServerSize}/${totalRackSize} rack slots`} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                        <Stat className="background" titleIcon={<MemoryOutlined />} titleIconAccent='accent' label="Total Compute" value={`${totalCompute}`} subheader={`Across ${purchasedServers.length} servers`} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                        <Stat className="background" titleIcon={<BoltOutlined />} titleIconAccent='accent' label="Power Draw" value={powerDraw} subheader="All servers combined" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                        <Stat className="background" titleIcon={<SpeedOutlined />} titleIconAccent='accent' label="Avg Utilization" value={`${totalCompute}`} subheader="Last 5 min" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                        <Stat className="background" titleIcon={<WarningAmberOutlined />} titleIconAccent='orange' label="Alerts" value="1" accent="orange" subheader="Check Servers List" />
                    </Grid>
                </Grid>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    className="servers-tabs"
                    scrollButtons={false}
                    slotProps={{ indicator: { sx: { display: 'none' } } }}
                >
                    <Tab
                        id="servers-tab-marketplace"
                        aria-controls="servers-tabpanel-marketplace"
                        icon={<StorefrontOutlined />}
                        iconPosition="start"
                        disableRipple
                        label={
                            <span className="servers-tab__label">
                                Marketplace
                                <span className="servers-tab__count">{marketplaceCount}</span>
                            </span>
                        }
                        value={0}
                    />
                    <Tab
                        id="servers-tab-inventory"
                        aria-controls="servers-tabpanel-inventory"
                        icon={<DnsOutlined />}
                        iconPosition="start"
                        disableRipple
                        label={
                            <span className="servers-tab__label">
                                My Servers
                                <span className="servers-tab__count">{purchasedServers.length}</span>
                            </span>
                        }
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
                                <Table className="servers-table" stickyHeader>
                                    <ServerRowHeader />
                                    <TableBody>
                                        {(rowsPerPage > 0 ? purchasedServers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : purchasedServers).map((server, key) => (
                                            <ServerRow key={key} server={server} />
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                                colSpan={6}
                                                count={purchasedServers.length}
                                                rowsPerPage={rowsPerPage}
                                                page={page}
                                                slotProps={{
                                                    select: {
                                                        inputProps: {
                                                            'aria-label': 'Rows per page',
                                                        },
                                                        native: true,
                                                    }
                                                }}
                                                onPageChange={handlePageChange}
                                                onRowsPerPageChange={handleRowsPerPageChange}
                                                ActionsComponent={TablePaginationActions}
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </div>
                    </Box>
                ) : null}
            </Box>
        </div>
    );
}

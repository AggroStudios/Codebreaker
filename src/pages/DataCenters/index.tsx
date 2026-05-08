import PageHeader from '../../components/common/PageHeader';
import { AccountBalanceWalletOutlined, ApartmentTwoTone, BoltOutlined, DescriptionOutlined, DnsOutlined, RequestQuoteOutlined, RouterOutlined } from '@mui/icons-material';

import './style.scss';
import { DATA_CENTERS, INITIAL_CONTRACTS } from '../../lib/dataCenter';
import { WorldMap } from '../../components/WorldMap';
import { DataCenterCard } from '../../components/WorldMap/components';
import { useState } from 'react';
import { IDataCenter } from '../../includes/DataCenter.interface';
import { Box, Grid } from '@mui/material';
import { Stat } from '../../components/common/Stat';
import { formatKw, formatMoney, formatGbps, formatMoneyDay } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';

export default function DataCenters() {
    const [selectedDataCenter, setSelectedDataCenter] = useState<IDataCenter | null>(null);

    const totalContracts = Object.keys(INITIAL_CONTRACTS).length;
    const availableContracts = Object.keys(DATA_CENTERS).length - totalContracts;
    const totalRacks = Object.values(INITIAL_CONTRACTS).reduce((acc, contract) => acc + contract.racks, 0);
    const totalPower = formatKw(Object.values(INITIAL_CONTRACTS).reduce((acc, contract) => acc + contract.powerKw, 0));
    const totalUplink = formatGbps(Object.values(INITIAL_CONTRACTS).reduce((acc, contract) => acc + contract.uplinkGbps, 0));
    const dailyLeaseCost = formatMoneyDay(Object.keys(INITIAL_CONTRACTS).reduce((acc, region) => acc + DATA_CENTERS.find((dc) => dc.id === region)?.baseLeaseDay || 0, 0));

    return (
        <Box className="data-centers-page">
            <PageHeader
                className="data-centers-header"
                title="Data Centers"
                subtitle="Unlock and manage data center contracts to expand your network and increase your cipher processing capacity."
                breadcrumbs={['home', 'data_centers']}
                icon={ApartmentTwoTone}
            />
            <Grid
                container
                spacing={2}
                className="data-centers-container"
                sx={{
                    flex: 1,
                    minHeight: 0,
                    minWidth: 0,
                    maxWidth: '100%',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    marginTop: '2em',
                }}
            >
                <Grid container spacing={2} sx={{ flexShrink: 0, width: '100%', minWidth: 0 }}>
                    <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }} sx={{ flexShrink: 0 }}>
                        <Stat className="background" titleIcon={<AccountBalanceWalletOutlined />} titleIconAccent='accent' label="Wallet" value={`$${formatMoney(usePlayerStore.getState().player.money)}`} accent='accent' subheader="Liquid Funds" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }} sx={{ flexShrink: 0 }}>
                        <Stat className="background" titleIcon={<DescriptionOutlined />} titleIconAccent='accent' label="Active Contracts" value={totalContracts.toString()} subheader={`${availableContracts} regions open`} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }} sx={{ flexShrink: 0 }}>
                        <Stat className="background" titleIcon={<DnsOutlined />} titleIconAccent='accent' label="Total Racks" value={totalRacks.toString()} subheader="Across the grid" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }} sx={{ flexShrink: 0 }}>
                        <Stat className="background" titleIcon={<BoltOutlined />} titleIconAccent='accent' label="Power Draw" value={totalPower.toString()} subheader="All DCs combined" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }} sx={{ flexShrink: 0 }}>
                        <Stat className="background" titleIcon={<RouterOutlined />} titleIconAccent='accent' label="Combined Uplink" value={totalUplink} subheader="Aggregated egress" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }} sx={{ flexShrink: 0 }}>
                        <Stat className="background" titleIcon={<RequestQuoteOutlined />} titleIconAccent='accent' label="Daily Lease" value={`$${dailyLeaseCost}`} subheader="colo + power + xfer" accent="orange" />
                    </Grid>
                </Grid>
                <Grid
                    size={12}
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        minWidth: 0,
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <WorldMap
                        dataCenters={DATA_CENTERS}
                        contracts={INITIAL_CONTRACTS}
                        selectedId={selectedDataCenter?.id}
                        onSelect={(id: string) => {
                            setSelectedDataCenter(DATA_CENTERS.find((dc) => dc.id === id) || null);
                        }}
                        selectedDataCenter={selectedDataCenter}
                        floatingCard={
                            <DataCenterCard
                                dataCenter={selectedDataCenter}
                                contract={INITIAL_CONTRACTS[selectedDataCenter?.id] || null}
                                wallet={1000}
                                onSign={() => {}}
                                onUpgradePower={() => {}}
                                onUpgradeUplink={() => {}}
                                onAddRack={() => {}}
                                onClose={() => {
                                    setSelectedDataCenter(null);
                                }}
                                floating={true}
                            />
                        }
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

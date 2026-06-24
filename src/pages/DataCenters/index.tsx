import PageHeader from '../../components/common/PageHeader';
import { AccountBalanceWalletOutlined, ApartmentTwoTone, BoltOutlined, DescriptionOutlined, DnsOutlined, RequestQuoteOutlined, RouterOutlined } from '@mui/icons-material';

import './style.scss';
import { DATA_CENTERS } from '../../data/dataCenter';
import { WorldMap } from '../../components/WorldMap';
import { DataCenterCard } from '../../components/WorldMap/components';
import { useState } from 'react';
import { IDataCenter } from '../../includes/DataCenter.interface';
import { Box, Grid } from '@mui/material';
import { Stat } from '../../components/common/Stat';
import { formatKw, formatMoney, formatGbps, formatMoneyDay } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';
import { useDataCentersStore } from '../../stores/dataCenters';
import { useRacksStore } from '../../stores/racks';

export default function DataCenters() {
    const [selectedDataCenter, setSelectedDataCenter] = useState<IDataCenter | null>(null);
    const { contracts, setContracts, upgradeContract, suspendContract, resumeContract, deleteContract } = useDataCentersStore();
    const removeRacksByDc = useRacksStore((s) => s.removeRacksByDc);
    const totalContracts = Object.keys(contracts).length;
    const availableContracts = Object.keys(DATA_CENTERS).length - totalContracts;
    const totalRacks = Object.values(contracts).reduce((acc, contract) => acc + contract.racks || 0, 0);
    const totalPower = formatKw(Object.values(contracts).reduce((acc, contract) => acc + contract.powerKw || 0, 0));
    const totalUplink = formatGbps(Object.values(contracts).reduce((acc, contract) => acc + contract.uplinkGbps || 0, 0));
    const dailyLeaseCost = formatMoneyDay(Object.keys(contracts).reduce((acc, region) => acc + DATA_CENTERS.find((dc) => dc.id === region)?.baseLeaseDay || 0, 0));

    const handleSignContract = (dataCenterId: string) => {
        const dataCenter = DATA_CENTERS.find((dc) => dc.id === dataCenterId);
        setContracts({
            ...contracts,
            [dataCenterId]: {
                racks: 1,
                rackCap: dataCenter?.baseRacks || 0,
                powerKw: 4,
                uplinkGbps: 1,
                signedDays: 0,
                status: 'PROVISIONING',
            },
        });
    };

    const handleAddRack = (dataCenterId: string, _cost: number) => {
        upgradeContract(dataCenterId, {
            racks: (contracts[dataCenterId]?.racks || 0) + 1,
        });
    };

    const handleUpgradePower = (dataCenterId: string, power: number, _cost: number) => {
        upgradeContract(dataCenterId, {
            powerKw: power,
        });
    };

    const handleUpgradeUplink = (dataCenterId: string, uplink: number, _cost: number) => {
        upgradeContract(dataCenterId, {
            uplinkGbps: uplink,
        });
    };

    const handleSuspendContract = (dataCenterId: string) => {
        suspendContract(dataCenterId);
    };

    const handleResumeContract = (dataCenterId: string) => {
        resumeContract(dataCenterId);
    };

    const handleCancelContract = (dataCenterId: string) => {
        // Tear down the racks first so the servers fall back into inventory
        // (they were never removed from purchasedServers — Inventory filters
        // them out only while they're installed in a rack).
        removeRacksByDc(dataCenterId);
        deleteContract(dataCenterId);
        if (selectedDataCenter?.id === dataCenterId) {
            setSelectedDataCenter(null);
        }
    };

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
                        contracts={contracts}
                        selectedId={selectedDataCenter?.id}
                        onSelect={(id: string) => {
                            setSelectedDataCenter(DATA_CENTERS.find((dc) => dc.id === id) || null);
                        }}
                        selectedDataCenter={selectedDataCenter}
                        floatingCard={
                            <DataCenterCard
                                dataCenter={selectedDataCenter}
                                contract={contracts[selectedDataCenter?.id] || null}
                                onSign={handleSignContract}
                                onUpgradePower={handleUpgradePower}
                                onUpgradeUplink={handleUpgradeUplink}
                                onAddRack={handleAddRack}
                                onSuspend={handleSuspendContract}
                                onResume={handleResumeContract}
                                onCancel={handleCancelContract}
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

import Box from '@mui/material/Box';

import { UpgradeList, type IUpgradeItem } from '../../lib/upgrades';

import { usePlayerStore } from '../../stores/player';
import { useState } from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Chip from '@mui/material/Chip';

import './index.scss';
import PublishTwoToneIcon from '@mui/icons-material/PublishTwoTone';
import { formatMoney } from '../../lib/utils';
import clsx from 'clsx';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import UpgradeComponent from '../../components/Upgrade';
import { useEffect } from 'react';
import { capitalize } from '@mui/material/utils';
import PageHeader from '../../components/common/PageHeader';
import { Stat } from '../../components/common/Stat';
import UpgradeDetails from '../../components/UpgradeDetails';
import { useStationContext } from '../../stores/stationContext';
import type { IUpgradeTier } from '../../lib/upgrades';

export default function UpgradesComponent() {
    const playerStore = usePlayerStore();
    const purchaseUpgradeTier = usePlayerStore((s) => s.purchaseUpgradeTier);
    const { stationProxy } = useStationContext();

    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);

    const [cantAffordDialogOpen, setCantAffordDialogOpen] = useState(false);
    const [displayedUpgrades, setDisplayedUpgrades] = useState<IUpgradeItem[]>(UpgradeList);
    const [filter, setFilter] = useState<string>('all');
    const [showOwned, setShowOwned] = useState(true);
    const [filterLabels, setFilterLabels] = useState<string[]>(['all']);
    const [selectedUpgrade, setSelectedUpgrade] = useState<IUpgradeItem | null>(null);

    useEffect(() => {
        const labels = new Set<string>();
        labels.add('all');
        UpgradeList.forEach((upg) => {
            upg.tags.forEach((tag) => {
                labels.add(tag);
            });
        });
        setFilterLabels(Array.from(labels));
    }, []);

    useEffect(() => {
        if (filter !== 'all') {
            setDisplayedUpgrades(UpgradeList.filter((upg) => upg.tags.includes(filter) && (showOwned || !purchasedUpgrades.find((pu) => pu.upgradeId === upg.key))));
        }
        else {
            setDisplayedUpgrades(UpgradeList.filter((upg) => showOwned || !purchasedUpgrades.find((pu) => pu.upgradeId === upg.key)));
        }
    }, [showOwned, filter]);

    const handleShowOwnedChange = () => {
        setShowOwned((prev) => !prev);
    };

    const handleFilterClick = (filter: string) => {
        setFilter(filter);
    };
    
    const handleCantAffordDialogClose = () => {
        setCantAffordDialogOpen(false);
    };


    const handleUpgradeClick = (upgrade: IUpgradeItem) => {
        if (selectedUpgrade?.key === upgrade.key) {
            setSelectedUpgrade(null);
        }
        else {
            setSelectedUpgrade(upgrade);
        }
    };

    const handleDetailsClose = () => {
        setSelectedUpgrade(null);
    };

    const handleDetailsPurchase = (upgrade: IUpgradeItem, tier: IUpgradeTier) => {
        tier.onPurchase?.(stationProxy);
        purchaseUpgradeTier(upgrade.key, tier.tierId, tier.cost);
    };

    return (
        <>
            <PageHeader
                title="Upgrades"
                subtitle={`Station modifications. Each upgrade has multiple tiers — purchase the next tier to make it more powerful. Some upgrades require prerequisites.`}
                breadcrumbs={['home', 'upgrades']}
                actions={
                    <Stat
                        className="balance-display"
                        label="Available Balance"
                        value={`$${formatMoney(playerStore.player.money)}`}
                        accent="accent"
                    />
                }
                icon={PublishTwoToneIcon}
            />
            <Box className="upgrade-container">
                <Box className="upgrades-filter-bar">
                    <span className="filter-label">Filter</span>
                    {filterLabels.map((label, idx: number) => (
                        <Chip key={'filter-label-' + idx.toString()} label={capitalize(label)} className={clsx(filter === label && 'active')} onClick={() => handleFilterClick(label)} variant="outlined" />
                    ))}
                    <FormControlLabel className="show-owned" control={
                        <Switch
                        checked={showOwned}
                        onChange={handleShowOwnedChange}
                        color="primary"
                    />} label="Show Owned" />
                </Box>
                <Box className="upgrades-content" sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 2 }}>
                    <Box className="upgrades-content-grid" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}>
                            {displayedUpgrades.map((upg) => (
                                <UpgradeComponent onClick={handleUpgradeClick} key={upg.key} upgrade={upg} selected={selectedUpgrade?.key === upg.key} />
                            ))}
                    </Box>
                    <Box className="upgrades-content-details" sx={{
                            position: 'sticky',
                            height: '100%',
                            width: '360px',
                            overflow: 'hidden',
                            display: 'flex', flexDirection: 'column',
                            paddingTop: '10px',
                            paddingRight: '14px',
                    }}>
                        <UpgradeDetails
                            upgrade={selectedUpgrade}
                            onPurchase={handleDetailsPurchase}
                            onClose={handleDetailsClose}
                        />
                    </Box>
                </Box>
            </Box>
            <Dialog open={cantAffordDialogOpen} onClose={handleCantAffordDialogClose}>
                <DialogTitle>Upgrade Purchase</DialogTitle>
                <DialogContent>
                    Sorry, you cannot afford this upgrade.
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCantAffordDialogClose}
                        variant="text"
                        color="primary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

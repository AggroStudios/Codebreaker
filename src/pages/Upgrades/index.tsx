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

export default function UpgradesComponent() {
    const playerStore = usePlayerStore();

    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);

    const [cantAffordDialogOpen, setCantAffordDialogOpen] = useState(false);
    const [displayedUpgrades, setDisplayedUpgrades] = useState<IUpgradeItem[]>(UpgradeList);
    const [filter, setFilter] = useState<string>('all');
    const [showOwned, setShowOwned] = useState(true);
    const [filterLabels, setFilterLabels] = useState<string[]>(['all']);

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
            setDisplayedUpgrades(UpgradeList.filter((upg) => upg.tags.includes(filter) && (showOwned || !purchasedUpgrades.includes(upg.key))));
        }
        else {
            setDisplayedUpgrades(UpgradeList.filter((upg) => showOwned || !purchasedUpgrades.includes(upg.key)));
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

    return (
        <>
            <PageHeader
                title="Upgrades"
                subtitle={`Upgrade your station to gain new features and improve performance.<br> ${purchasedUpgrades.length} of ${UpgradeList.length} upgrades unlocked`}
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
                <Box className="upgrades-content">
                    <div className="upgrades-content-label">{filter} Upgrades - {(displayedUpgrades.filter((upg) => !purchasedUpgrades.includes(upg.key))).length} available</div>
                    <Box className="upgrades-content-grid" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
                        {displayedUpgrades.map((upg) => (
                            <UpgradeComponent key={upg.key} upgrade={upg} />
                        ))}
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

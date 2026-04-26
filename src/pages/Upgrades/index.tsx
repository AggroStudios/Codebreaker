import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import { UpgradeList, type IUpgradeItem } from '../../lib/upgrades';

import { usePlayerStore } from '../../stores/player';
import { memo, useState } from 'react';
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
import Upgrade from '../../components/Upgrade';
import { useEffect } from 'react';

export default memo(function UpgradesComponent() {
    const playerStore = usePlayerStore();

    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);

    const [cantAffordDialogOpen, setCantAffordDialogOpen] = useState(false);
    const [displayedUpgrades, setDisplayedUpgrades] = useState<IUpgradeItem[]>(UpgradeList);
    const [filter, setFilter] = useState<string>('all');
    const [showOwned, setShowOwned] = useState(true);

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
        <div
            className="card"
            style={{ flex: 1, minHeight: 0, boxSizing: 'border-box' }}
        >
            <Box className="upgrade-container">
                <Box className="upgrades-page-header">
                    <div>
                        <div className="breadcrumbs">CODEBREAKER · UPGRADES</div>
                        <div className="title">
                            <span className="material-icons"><PublishTwoToneIcon /></span>
                            <span>Upgrade Packages</span>
                        </div>
                        <div className="subtitle">{purchasedUpgrades.length} of {UpgradeList.length} upgrades unlocked</div>
                    </div>
                    <div className="balance-display">
                        <div className="balance-display-label">Available Balance</div>
                        <div className="balance-display-amount">${formatMoney(playerStore.player.money)}</div>
                    </div>
                </Box>
                <Box className="upgrades-filter-bar">
                    <span className="filter-label">Filter</span>
                    <Chip label="All" className={clsx(filter === 'all' && 'active')} onClick={() => handleFilterClick('all')} variant="outlined" />
                    <Chip label="Software" className={clsx(filter === 'software' && 'active')} onClick={() => handleFilterClick('software')} variant="outlined" />
                    <Chip label="Hardware" className={clsx(filter === 'hardware' && 'active')} onClick={() => handleFilterClick('hardware')} variant="outlined" />
                    <Chip label="Network" className={clsx(filter === 'network' && 'active')} onClick={() => handleFilterClick('network')} variant="outlined" />
                    <Chip label="Security" className={clsx(filter === 'security' && 'active')} onClick={() => handleFilterClick('security')} variant="outlined" />
                    <Chip label="Passive" className={clsx(filter === 'passive' && 'active')} onClick={() => handleFilterClick('passive')} variant="outlined" />
                    <Chip label="Active" className={clsx(filter === 'active' && 'active')} onClick={() => handleFilterClick('active')} variant="outlined" />
                    <FormControlLabel className="show-owned" control={
                        <Switch
                        checked={showOwned}
                        onChange={handleShowOwnedChange}
                        color="primary"
                    />} label="Show Owned" />
                </Box>
                <Box className="upgrades-content">
                    <div className="upgrades-content-label">{filter} Upgrades - {(displayedUpgrades.filter((upg) => !purchasedUpgrades.includes(upg.key))).length} available</div>
                    <Grid className="upgrades-content-grid" columns={{ xs: 1, sm: 4, md: 6, lg: 9, xl: 12 }} container spacing={2}>
                        {displayedUpgrades.map((upg) => (
                            <Upgrade key={upg.key} upgrade={upg} />
                        ))}
                    </Grid>
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

        </div>
    );
});

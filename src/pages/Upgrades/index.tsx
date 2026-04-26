import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import { UpgradeList } from '../../lib/upgrades';

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

export default memo(function UpgradesComponent() {
    const playerStore = usePlayerStore();

    const [cantAffordDialogOpen, setCantAffordDialogOpen] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const [showOwned, setShowOwned] = useState(true);

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
                            <span>Permanent Upgrades</span>
                        </div>
                        <div className="subtitle">1 of 10 upgrades unlocked</div>
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
                    <div className="upgrades-content-label">{filter} Upgrades - 10 available</div>
                    <Grid container spacing={2} sx={{ overflowY: 'auto' }}>
                        {UpgradeList.map((upg, key) => (
                            <Grid size={2} key={key}>
                                <Upgrade upgrade={upg} />
                            </Grid>
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

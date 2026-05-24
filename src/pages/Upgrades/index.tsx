import Box from '@mui/material/Box';

import { UpgradeList, type IUpgradeItem } from '../../data/upgrades';

import { usePlayerStore } from '../../stores/player';
import { useState } from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Chip from '@mui/material/Chip';

import PublishTwoToneIcon from '@mui/icons-material/PublishTwoTone';
import { formatMoney } from '../../lib/utils';
import clsx from 'clsx';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import UpgradeComponent from '../../components/Upgrade';
import { useEffect } from 'react';
import { capitalize } from '@mui/material/utils';
import PageHeader from '../../components/common/PageHeader';
import { Stat } from '../../components/common/Stat';
import UpgradeDetails from '../../components/UpgradeDetails';
import { useStationContext } from '../../stores/stationContext';
import type { IUpgradeTier } from '../../data/upgrades';

import CheckIcon from '@mui/icons-material/Check';
import { Avatar, Typography } from '@mui/material';

import './style.scss';

interface ConfirmDialogProps {
    open: boolean;
    upgrade: IUpgradeItem | null;
    tier: IUpgradeTier | null;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmDialog({
    open,
    upgrade,
    tier,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { className: clsx('upgrade-confirm-dialog', upgrade?.category) } }}
        >
            <DialogTitle className="upgrade-confirm-dialog-title">
                <span>Confirm Purchase</span>
                <span className="upgrade-confirm-dialog-subtitle">Confirm Transaction</span>
            </DialogTitle>
            <DialogContent className="upgrade-confirm-dialog-content">
                {upgrade && tier && (
                    <>
                        <div className="upgrade-confirm-preview">
                            <Avatar
                                className={clsx('upgrade-category-icon', upgrade.category)}
                                variant="rounded"
                            >
                                <upgrade.icon />
                            </Avatar>
                            <div className="upgrade-confirm-preview-body">
                                <div className="upgrade-confirm-preview-head">
                                    <span className="upgrade-confirm-preview-name">{upgrade.name}</span>
                                    <span className="upgrade-confirm-preview-separator">·</span>
                                    <span className="upgrade-confirm-preview-tier">{tier.title}</span>
                                </div>
                                <Typography className="upgrade-confirm-preview-description">
                                    {tier.description}
                                </Typography>
                            </div>
                        </div>

                        <div className="upgrade-confirm-total">
                            <span className="upgrade-confirm-total-label">Total</span>
                            <span className="upgrade-confirm-total-value">${formatMoney(tier.cost, 0)}</span>
                        </div>
                    </>
                )}
            </DialogContent>
            <DialogActions className="upgrade-confirm-dialog-actions">
                <Button onClick={onCancel} className="upgrade-confirm-cancel" sx={{ outline: 0 }}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    className="upgrade-confirm-confirm"
                    startIcon={<CheckIcon />}
                    sx={{ outline: 0 }}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function UpgradesComponent() {
    const playerStore = usePlayerStore();
    const purchaseUpgradeTier = usePlayerStore((s) => s.purchaseUpgradeTier);
    const { stationProxy } = useStationContext();

    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);

    const [cantAffordDialogOpen, setCantAffordDialogOpen] = useState(false);
    const [displayedUpgrades, setDisplayedUpgrades] = useState<IUpgradeItem[]>(UpgradeList);
    const [filter, setFilter] = useState<string>('all');
    const [showOwned, setShowOwned] = useState(true);
    const [hideFullyUpgraded, setHideFullyUpgraded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterLabels, setFilterLabels] = useState<string[]>(['all']);
    const [selectedUpgrade, setSelectedUpgrade] = useState<IUpgradeItem | null>(null);
    const [confirmPurchaseDialogOpen, setConfirmPurchaseDialogOpen] = useState(false);

    const [upgradeToPurchase, setUpgradeToPurchase] = useState<IUpgradeItem | null>(null);
    const [tierToPurchase, setTierToPurchase] = useState<IUpgradeTier | null>(null);

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
        const debounceTimer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [searchTerm]);

    useEffect(() => {
        const purchasedTierCountByKey = purchasedUpgrades.reduce<Record<string, number>>(
            (acc, item) => {
                acc[item.upgradeId] = (acc[item.upgradeId] ?? 0) + 1;
                return acc;
            },
            {},
        );

        const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

        setDisplayedUpgrades(
            UpgradeList.filter((upg) => {
                const purchasedTierCount = purchasedTierCountByKey[upg.key] ?? 0;
                const isOwned = purchasedTierCount > 0;
                const isFullyUpgraded = purchasedTierCount >= upg.tiers.length;

                const tagMatches = filter === 'all' || upg.tags.includes(filter);
                const searchMatches = normalizedSearch.length === 0
                    || upg.name.toLowerCase().includes(normalizedSearch)
                    || upg.description.toLowerCase().includes(normalizedSearch);
                const ownedMatches = showOwned || !isOwned;
                const fullyUpgradedMatches = !hideFullyUpgraded || !isFullyUpgraded;

                return tagMatches && searchMatches && ownedMatches && fullyUpgradedMatches;
            }),
        );
    }, [debouncedSearchTerm, filter, hideFullyUpgraded, purchasedUpgrades, showOwned]);

    const handleConfirmPurchaseDialogClose = () => {
        setConfirmPurchaseDialogOpen(false);
    };

    const handlePurchase = (upgrade: IUpgradeItem, nextTier: IUpgradeTier) => {
        if (!nextTier) return;
        setUpgradeToPurchase(upgrade);
        setTierToPurchase(nextTier);
        setConfirmPurchaseDialogOpen(true);
    };

    const handleConfirmPurchase = () => {
        if (!upgradeToPurchase || !tierToPurchase) return;
        tierToPurchase.onPurchase?.(stationProxy);
        purchaseUpgradeTier(upgradeToPurchase.key, tierToPurchase.tierId, tierToPurchase.cost);
        setConfirmPurchaseDialogOpen(false);
    };

    const handleShowOwnedChange = () => {
        setShowOwned((prev) => !prev);
    };

    const handleHideFullyUpgradedChange = () => {
        setHideFullyUpgraded((prev) => !prev);
    };

    const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
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
                    <TextField
                        className="upgrades-search"
                        size="small"
                        placeholder="Search upgrades"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <FormControlLabel className="show-owned" control={
                        <Switch
                        checked={showOwned}
                        onChange={handleShowOwnedChange}
                        color="primary"
                    />} label="Show Owned" />
                    <FormControlLabel className="hide-fully-upgraded" control={
                        <Switch
                        checked={hideFullyUpgraded}
                        onChange={handleHideFullyUpgradedChange}
                        color="primary"
                    />} label="Hide Fully Upgraded" />
                </Box>
                <Box className="upgrades-content" sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 2 }}>
                    <Box className="upgrades-content-grid" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}>
                            {displayedUpgrades.map((upg) => (
                                <UpgradeComponent onClick={handleUpgradeClick} key={upg.key} upgrade={upg} selected={selectedUpgrade?.key === upg.key} onPurchase={handlePurchase} />
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
                            onPurchase={handlePurchase}
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
            <ConfirmDialog
                open={confirmPurchaseDialogOpen}
                upgrade={upgradeToPurchase}
                tier={tierToPurchase}
                onConfirm={handleConfirmPurchase}
                onCancel={handleConfirmPurchaseDialogClose}
            />
        </>
    );
}

import { useEffect, useState } from 'react';
import { UpgradeList, type IUpgradeItem } from '../../data/upgrades';
import { usePlayerStore } from '../../stores/player';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PublishTwoToneIcon from '@mui/icons-material/PublishTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import { formatMoney } from '../../lib/utils';
import UpgradeComponent from '../../components/Upgrade';
import { capitalize } from '@mui/material/utils';
import PageHeader from '../../components/common/PageHeader';
//import { ChipGlow, Stat } from '../../components/common';
import { ChipGlow } from '../../components/common';
import UpgradeDetails from '../../components/UpgradeDetails';
import { useStationContext } from '../../stores/stationContext';
import type { IUpgradeTier } from '../../data/upgrades';
import { UpgradesConfirmDialog } from './UpgradesConfirmDialog';
import './style.scss';
import { styled } from '@mui/material/styles';

export const StyledUpgradesGrid = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(0,2)
}));

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
            <Grid container className="upgrade-container" spacing={2}>
                <Grid size={12}>
                    <PageHeader
                        title="Upgrades"
                        subtitle={`Station modifications. Each upgrade has multiple tiers — purchase the next tier to make it more powerful. Some upgrades require prerequisites.`}
                        breadcrumbs={['home', 'upgrades']}
                        actions={
                        <Card>
                            <CardContent>
                                <Stack direction="column" spacing={0} sx={{ alignItems: 'flex-end' }}>
                                    <Typography color="grey" variant="code4">
                                        Available Balance
                                    </Typography>
                                    <Typography variant="code1">{`$${formatMoney(playerStore.player.money)}`}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                        // <Stat
                        //     className="balance-display"
                        //     label="Available Balance"
                        //     value={`$${formatMoney(playerStore.player.money)}`}
                        //     accent="accent"
                        // />
                        }
                        icon={PublishTwoToneIcon}
                    />
                </Grid>
                <StyledUpgradesGrid size={12} spacing={2}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid container spacing={1} size={12} sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                }}>
                                    <Grid container size={{ xs: 12, sm: 12, md: 'auto' }} spacing={1}>
                                        <Grid size="auto">
                                            <FormLabel>Filter</FormLabel>
                                        </Grid>
                                        {filterLabels.map((label, idx: number) => {
                                            const active = filter === label;
                                            return (
                                                <Grid key={`filter-label-${label}-${idx}`} size="auto">
                                                    <ChipGlow
                                                        color={active && 'accent'}
                                                        label={capitalize(label)}
                                                        onClick={() => handleFilterClick(label)}
                                                    />
                                                </Grid>
                                            )
                                        })}
                                    </Grid>
                                    <Grid container size={{ xs: 12, sm: 8, md: 'auto' }}>
                                        <Grid size="auto">
                                            <TextField
                                                className="upgrades-search"
                                                onChange={handleSearchTermChange}
                                                placeholder="Search upgrades"
                                                size="small"
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon fontSize="small" />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                                value={searchTerm}
                                            />
                                        </Grid>
                                        <Grid size="auto">
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid container size={12} spacing={2}>
                                    <Grid container size="grow" spacing={2} columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xx: 5, xxx: 5, xxxx: 6 }} sx={{ alignItems: 'stretch' }}>
                                        {displayedUpgrades.map((upg) => (
                                            <Grid size={1}>
                                                <UpgradeComponent onClick={handleUpgradeClick} key={upg.key} upgrade={upg} selected={selectedUpgrade?.key === upg.key} onPurchase={handlePurchase} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Grid container size="auto" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex', xl: 'flex' } }}>
                                        <Box sx={{ size: '360px' }}>
                                            <UpgradeDetails
                                                upgrade={selectedUpgrade}
                                                onPurchase={handlePurchase}
                                                onClose={handleDetailsClose}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </StyledUpgradesGrid>
            </Grid>

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

            <UpgradesConfirmDialog
                open={confirmPurchaseDialogOpen}
                upgrade={upgradeToPurchase}
                tier={tierToPurchase}
                onConfirm={handleConfirmPurchase}
                onCancel={handleConfirmPurchaseDialogClose}
            />
        </>
    );
}

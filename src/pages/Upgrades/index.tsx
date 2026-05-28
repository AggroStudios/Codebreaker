import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import PublishTwoToneIcon from '@mui/icons-material/PublishTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import { capitalize } from '@mui/material/utils';

import { useState, useEffect } from 'react';

import { UpgradeList, type IUpgradeItem, type IUpgradeTier } from '../../data/upgrades';
import { usePlayerStore } from '../../stores/player';
import { formatMoney } from '../../lib/utils';
import UpgradeComponent from '../../components/Upgrade';
import PageHeader from '../../components/common/PageHeader';
import { Stat } from '../../components/common/Stat';
import UpgradeDetails from '../../components/UpgradeDetails';
import { useStationContext } from '../../stores/stationContext';
import { getCategoryVars, UpgradeCategoryIcon } from '../../components/Upgrade/upgradeShared';

// ---------------------------------------------------------------------------
// Page-level styled components
// ---------------------------------------------------------------------------

const UpgradeContainer = styled(Box)({
    borderRadius: 12,
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    margin: '2em',
});

const FilterBar = styled(Box)({
    padding: '16px 24px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    flexWrap: 'wrap',
    backgroundColor: 'var(--color-bg-card)',
});

const FilterLabel = styled('span')({
    fontSize: 11,
    color: 'var(--color-fg-secondary)',
    letterSpacing: '0.08em',
    marginRight: 4,
    textTransform: 'uppercase',
    userSelect: 'none',
});

const FilterChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
    '&.MuiChip-root': {
        padding: '4px 4px',
        fontSize: 12,
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        color: 'var(--color-fg-secondary)',
        height: 24,
        '&:hover': { color: 'var(--color-fg)' },
        ...(active && {
            backgroundColor: 'var(--accent-dim)',
            borderColor: 'var(--color-border-hi)',
            color: 'var(--accent)',
            boxShadow: '0 0 10px rgba(10,245,176,0.5)',
        }),
    },
}));

const UpgradesSearch = styled(TextField)({
    minWidth: 240,
    marginLeft: 'auto',
    '& .MuiOutlinedInput-root': {
        height: 30,
        fontSize: 12,
        color: 'var(--color-fg)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    '& .MuiOutlinedInput-input': { padding: '6px 10px' },
    '& .MuiInputAdornment-root': { color: 'var(--color-fg-secondary)' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-border-hover)',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--accent)',
    },
    '& .MuiInputBase-input::placeholder': { color: 'var(--color-fg-secondary)', opacity: 0.8 },
});

const UpgradesToggle = styled(FormControlLabel)({
    '&.MuiFormControlLabel-root': {
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        marginRight: 0,
    },
    '& .MuiFormControlLabel-label': {
        fontSize: 12,
        color: 'var(--color-fg-secondary)',
        userSelect: 'none',
    },
    '& .MuiSwitch-root': { padding: 8 },
    '& .MuiSwitch-track': { backgroundColor: 'var(--color-border-hi)', borderRadius: 14 },
    '& .Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--accent) !important' },
    '& .MuiSwitch-switchBase': { color: 'var(--color-fg)' },
});

const ContentArea = styled(Box)({
    padding: '0 14px 24px',
    flex: '1 1 0',
    minHeight: 0,
    backgroundColor: 'var(--color-bg-card)',
    display: 'grid',
    gap: 16,
});

const UpgradesGrid = styled(Box)({
    flex: '1 1 0',
    minHeight: 0,
    overflowY: 'auto',
    padding: 10,
    display: 'grid',
    alignContent: 'flex-start',
    alignItems: 'stretch',
    gap: 16,
});

const DetailsSidebar = styled(Box)({
    position: 'sticky',
    top: 0,
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 10,
    paddingRight: 14,
});

const BalanceStat = styled(Stat)({
    textAlign: 'right',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'rgba(0,0,0,0.2)',
});

// ---------------------------------------------------------------------------
// Confirm dialog styled components
// ---------------------------------------------------------------------------

const ConfirmPreview = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.02)',
});

const ConfirmPreviewBody = styled('div')({ flex: 1, minWidth: 0 });

const ConfirmPreviewHead = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    lineHeight: 1.2,
});

const ConfirmPreviewName = styled('span')({ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)' });

const ConfirmPreviewSeparator = styled('span')({ color: 'var(--color-fg-disabled)' });

const ConfirmPreviewTier = styled('span')({
    fontFamily: 'var(--font-code)',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--category-color)',
});

const ConfirmTotal = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
});

const ConfirmTotalLabel = styled('span')({ fontSize: 16, fontWeight: 600, color: 'var(--color-fg-secondary)' });

const ConfirmTotalValue = styled('span')({
    fontFamily: 'var(--font-code)',
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--accent)',
    textShadow: '0 0 12px rgba(10,245,176,0.45)',
});

// ---------------------------------------------------------------------------
// ConfirmDialog
// ---------------------------------------------------------------------------

interface ConfirmDialogProps {
    open: boolean;
    upgrade: IUpgradeItem | null;
    tier: IUpgradeTier | null;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmDialog({ open, upgrade, tier, onConfirm, onCancel }: ConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    style: upgrade ? getCategoryVars(upgrade.category) : undefined,
                    sx: {
                        border: '1px solid var(--color-border)',
                        borderRadius: '14px',
                        background: 'rgba(20,22,26,0.9)',
                        backdropFilter: 'blur(8px)',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    padding: '16px 20px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--color-fg)',
                }}
            >
                <span>Confirm Purchase</span>
                <Typography
                    component="span"
                    sx={{
                        fontFamily: 'var(--font-code)',
                        fontSize: 11,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--color-fg-secondary)',
                    }}
                >
                    Confirm Transaction
                </Typography>
            </DialogTitle>

            <DialogContent
                sx={{
                    padding: '18px 20px 16px !important',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                }}
            >
                {upgrade && tier && (
                    <>
                        <ConfirmPreview>
                            <UpgradeCategoryIcon variant="rounded">
                                <upgrade.icon />
                            </UpgradeCategoryIcon>
                            <ConfirmPreviewBody>
                                <ConfirmPreviewHead>
                                    <ConfirmPreviewName>{upgrade.name}</ConfirmPreviewName>
                                    <ConfirmPreviewSeparator>·</ConfirmPreviewSeparator>
                                    <ConfirmPreviewTier>{tier.title}</ConfirmPreviewTier>
                                </ConfirmPreviewHead>
                                <Typography sx={{ margin: 0, fontSize: 12, color: 'var(--color-fg-secondary)', lineHeight: 1.4 }}>
                                    {tier.description}
                                </Typography>
                            </ConfirmPreviewBody>
                        </ConfirmPreview>

                        <ConfirmTotal>
                            <ConfirmTotalLabel>Total</ConfirmTotalLabel>
                            <ConfirmTotalValue>${formatMoney(tier.cost, 0)}</ConfirmTotalValue>
                        </ConfirmTotal>
                    </>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    padding: '14px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                }}
            >
                <Button
                    onClick={onCancel}
                    sx={{
                        outline: 0,
                        color: 'var(--color-fg)',
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        borderRadius: '10px',
                        padding: '8px 20px',
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    startIcon={<CheckIcon />}
                    sx={{
                        outline: 0,
                        background: 'var(--accent)',
                        color: 'var(--color-fg-on-accent)',
                        fontSize: 13,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        borderRadius: '10px',
                        padding: '8px 22px',
                        '&:hover': { background: 'var(--accent)', boxShadow: '0 0 14px rgba(10,245,176,0.55)' },
                    }}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function UpgradesComponent() {
    const playerStore        = usePlayerStore();
    const purchaseUpgradeTier = usePlayerStore((s) => s.purchaseUpgradeTier);
    const { stationProxy }   = useStationContext();
    const purchasedUpgrades  = usePlayerStore((s) => s.purchasedUpgrades);

    const [cantAffordDialogOpen,      setCantAffordDialogOpen]      = useState(false);
    const [displayedUpgrades,         setDisplayedUpgrades]         = useState<IUpgradeItem[]>(UpgradeList);
    const [filter,                    setFilter]                    = useState<string>('all');
    const [showOwned,                 setShowOwned]                 = useState(true);
    const [hideFullyUpgraded,         setHideFullyUpgraded]         = useState(false);
    const [searchTerm,                setSearchTerm]                = useState('');
    const [debouncedSearchTerm,       setDebouncedSearchTerm]       = useState('');
    const [filterLabels,              setFilterLabels]              = useState<string[]>(['all']);
    const [selectedUpgrade,           setSelectedUpgrade]           = useState<IUpgradeItem | null>(null);
    const [confirmPurchaseDialogOpen, setConfirmPurchaseDialogOpen] = useState(false);
    const [upgradeToPurchase,         setUpgradeToPurchase]         = useState<IUpgradeItem | null>(null);
    const [tierToPurchase,            setTierToPurchase]            = useState<IUpgradeTier | null>(null);

    useEffect(() => {
        const labels = new Set<string>();
        labels.add('all');
        UpgradeList.forEach((upg) => upg.tags.forEach((tag) => labels.add(tag)));
        setFilterLabels(Array.from(labels));
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    useEffect(() => {
        const purchasedTierCountByKey = purchasedUpgrades.reduce<Record<string, number>>(
            (acc, item) => { acc[item.upgradeId] = (acc[item.upgradeId] ?? 0) + 1; return acc; },
            {},
        );
        const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();
        setDisplayedUpgrades(
            UpgradeList.filter((upg) => {
                const purchasedTierCount = purchasedTierCountByKey[upg.key] ?? 0;
                const isOwned          = purchasedTierCount > 0;
                const isFullyUpgraded  = purchasedTierCount >= upg.tiers.length;
                const tagMatches       = filter === 'all' || upg.tags.includes(filter);
                const searchMatches    = normalizedSearch.length === 0
                    || upg.name.toLowerCase().includes(normalizedSearch)
                    || upg.description.toLowerCase().includes(normalizedSearch);
                const ownedMatches         = showOwned || !isOwned;
                const fullyUpgradedMatches = !hideFullyUpgraded || !isFullyUpgraded;
                return tagMatches && searchMatches && ownedMatches && fullyUpgradedMatches;
            }),
        );
    }, [debouncedSearchTerm, filter, hideFullyUpgraded, purchasedUpgrades, showOwned]);

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

    const handleUpgradeClick = (upgrade: IUpgradeItem) => {
        setSelectedUpgrade((prev) => (prev?.key === upgrade.key ? null : upgrade));
    };

    return (
        <>
            <PageHeader
                title="Upgrades"
                subtitle="Station modifications. Each upgrade has multiple tiers — purchase the next tier to make it more powerful. Some upgrades require prerequisites."
                breadcrumbs={['home', 'upgrades']}
                actions={
                    <BalanceStat
                        label="Available Balance"
                        value={`$${formatMoney(playerStore.player.money)}`}
                        accent="accent"
                    />
                }
                icon={PublishTwoToneIcon}
            />

            <UpgradeContainer>
                <FilterBar>
                    <FilterLabel>Filter</FilterLabel>
                    {filterLabels.map((label, idx) => (
                        <FilterChip
                            key={'filter-label-' + idx.toString()}
                            label={capitalize(label)}
                            active={filter === label}
                            onClick={() => setFilter(label)}
                            variant="outlined"
                        />
                    ))}
                    <UpgradesSearch
                        size="small"
                        placeholder="Search upgrades"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                    <UpgradesToggle
                        control={<Switch checked={showOwned} onChange={() => setShowOwned((p) => !p)} color="primary" />}
                        label="Show Owned"
                    />
                    <UpgradesToggle
                        control={<Switch checked={hideFullyUpgraded} onChange={() => setHideFullyUpgraded((p) => !p)} color="primary" />}
                        label="Hide Fully Upgraded"
                    />
                </FilterBar>

                <ContentArea
                    sx={{
                        gridTemplateColumns: {
                            xs: '1fr',
                            lg: 'minmax(0, 1fr) 360px',
                        },
                    }}
                >
                    <UpgradesGrid
                        sx={{
                            gridTemplateColumns: {
                                xs: 'repeat(1, 1fr)',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(4, 1fr)',
                                xl: 'repeat(4, 1fr)',
                                xx: 'repeat(5, 1fr)',
                            },
                        }}
                    >
                        {displayedUpgrades.map((upg) => (
                            <UpgradeComponent
                                key={upg.key}
                                upgrade={upg}
                                selected={selectedUpgrade?.key === upg.key}
                                onClick={handleUpgradeClick}
                                onPurchase={handlePurchase}
                            />
                        ))}
                    </UpgradesGrid>

                    <DetailsSidebar sx={{ display: { xs: 'none', lg: 'flex' } }}>
                        <UpgradeDetails
                            upgrade={selectedUpgrade}
                            onPurchase={handlePurchase}
                            onClose={() => setSelectedUpgrade(null)}
                        />
                    </DetailsSidebar>
                </ContentArea>
            </UpgradeContainer>

            <Dialog open={cantAffordDialogOpen} onClose={() => setCantAffordDialogOpen(false)}>
                <DialogTitle>Upgrade Purchase</DialogTitle>
                <DialogContent>Sorry, you cannot afford this upgrade.</DialogContent>
                <DialogActions>
                    <Button onClick={() => setCantAffordDialogOpen(false)} variant="text" color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmPurchaseDialogOpen}
                upgrade={upgradeToPurchase}
                tier={tierToPurchase}
                onConfirm={handleConfirmPurchase}
                onCancel={() => setConfirmPurchaseDialogOpen(false)}
            />
        </>
    );
}

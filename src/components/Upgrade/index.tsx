import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

import { formatMoney } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';
import { IUpgradeItem, IUpgradeRequirement, IUpgradeTier, UpgradeList } from '../../data/upgrades';
import {
    getCategoryVars,
    UpgradeCategoryIcon,
    UpgradeCostBlock,
    UpgradeCostLabel,
    UpgradeCost,
    UpgradeActionButton,
    type CostStatus,
    type PurchaseStatus,
} from './upgradeShared';

// ---------------------------------------------------------------------------
// Local styled components
// ---------------------------------------------------------------------------

const UpgradeCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'lockedReason',
})<{ isSelected?: boolean; lockedReason?: string }>(({ isSelected, lockedReason }) => ({
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 240,
    height: '100%',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'rgba(20,22,26,0.5)',
    backdropFilter: 'blur(8px)',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
    cursor: 'pointer',
    ...(isSelected && {
        borderColor: 'var(--category-color-border)',
        boxShadow: '0 0 14px var(--category-glow)',
    }),
    ...((lockedReason === 'locked' || lockedReason === 'maxed') && { opacity: 0.92 }),
}));

const UpgradeCategory = styled('span')({
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.10em',
    textTransform: 'capitalize',
    fontFamily: 'var(--font-code)',
    color: 'var(--category-color)',
    userSelect: 'none',
});

const UpgradeHeaderAction = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
});

const UpgradeTierPill = styled('span')({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px 8px',
    fontFamily: 'var(--font-code)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--category-color)',
    backgroundColor: 'var(--category-color-soft)',
    border: '1px solid var(--category-color-border)',
    borderRadius: 6,
    userSelect: 'none',
});

const UpgradeLockPill = styled('span')({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    color: '#ff4040',
    backgroundColor: 'rgba(255,64,64,0.10)',
    border: '1px solid rgba(255,64,64,0.45)',
    borderRadius: 6,
    userSelect: 'none',
    '& .MuiSvgIcon-root': { fontSize: 16 },
});

const UpgradeCardBody = styled(CardContent)({
    '&&': {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '0 14px 12px',
    },
});

const UpgradeTierMeter = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    userSelect: 'none',
});

const UpgradeTierMeterRow = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-code)',
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--color-fg-secondary)',
});

const UpgradeTierMeterProgress = styled('span')({
    color: 'var(--color-fg)',
    fontWeight: 700,
});

const UpgradeTierMeterBars = styled('div')({ display: 'flex', gap: 4 });

const UpgradeTierMeterBar = styled('span', {
    shouldForwardProp: (prop) => prop !== 'filled' && prop !== 'isNext',
})<{ filled?: boolean; isNext?: boolean }>(({ filled, isNext }) => ({
    flex: '1 1 0',
    height: 6,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    ...(filled && { backgroundColor: 'var(--category-color)', boxShadow: '0 0 6px var(--category-glow)' }),
    ...(isNext  && { backgroundColor: 'var(--accent)', opacity: 0.6, boxShadow: '0 0 6px rgba(10,245,176,0.4)' }),
}));

const UpgradeOverview = styled('div')({
    fontSize: 12,
    lineHeight: 1.45,
    color: 'var(--color-fg-secondary)',
    userSelect: 'none',
});

const UpgradeNextBlock = styled('div', {
    shouldForwardProp: (prop) => prop !== 'nextState',
})<{ nextState?: 'locked' | 'maxed' | 'normal' }>(({ nextState }) => ({
    position: 'relative',
    border: '1px solid var(--color-border)',
    borderLeft: '3px solid var(--category-color)',
    borderRadius: 6,
    padding: '10px 12px',
    backgroundColor: 'rgba(255,255,255,0.025)',
    ...(nextState === 'locked' && { opacity: 0.9 }),
    ...(nextState === 'maxed' && {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderColor: 'rgba(10,245,176,0.30)',
        borderLeftColor: 'var(--accent)',
        backgroundColor: 'rgba(10,245,176,0.06)',
    }),
}));

const UpgradeMaxedIcon = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    color: 'var(--accent)',
    flexShrink: 0,
    '& .MuiSvgIcon-root': { fontSize: 28, filter: 'drop-shadow(0 0 6px rgba(10,245,176,0.55))' },
});

const UpgradeMaxedBody = styled('div')({ display: 'flex', flexDirection: 'column', gap: 2, userSelect: 'none' });

const UpgradeMaxedTitle = styled('div')({
    fontFamily: 'var(--font-code)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    textShadow: '0 0 10px rgba(10,245,176,0.4)',
});

const UpgradeMaxedSubtitle = styled('div')({ fontSize: 11, lineHeight: 1.4, color: 'var(--color-fg-secondary)' });

const UpgradeNextHead = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
});

const UpgradeNextLabel = styled('span', {
    shouldForwardProp: (prop) => prop !== 'initial',
})<{ initial?: boolean }>(({ initial }) => ({
    fontFamily: 'var(--font-code)',
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: initial ? 'var(--category-color)' : 'var(--color-fg-secondary)',
    fontWeight: 700,
    userSelect: 'none',
}));

const UpgradeNextCallout = styled('span')({
    fontFamily: 'var(--font-code)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--category-color)',
    userSelect: 'none',
});

const UpgradeNextDesc = styled('div')({ fontSize: 12, lineHeight: 1.45, color: 'var(--color-fg)', userSelect: 'none' });

const UpgradeRequires = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '8px 10px',
    border: '1px solid rgba(255,64,64,0.25)',
    borderRadius: 6,
    backgroundColor: 'rgba(255,64,64,0.04)',
});

const UpgradeRequiresHead = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-code)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#ff4040',
    userSelect: 'none',
    '& .MuiSvgIcon-root': { fontSize: 14 },
});

const UpgradeRequiresList = styled('ul')({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    '& li': { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-fg-secondary)', userSelect: 'none' },
    '& .MuiSvgIcon-root': { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
});

const UpgradeRequiresName = styled('span')({ flex: 1, color: 'var(--color-fg)' });

const UpgradeRequiresTier = styled('span')({
    fontFamily: 'var(--font-code)',
    fontSize: 11,
    color: 'var(--color-fg-secondary)',
    letterSpacing: '0.06em',
});

const UpgradeCardFooter = styled(CardActions)({
    '&&': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 10,
        padding: '12px 14px 14px',
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto',
    },
});

const UpgradeTags = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    width: '100%',
    '& .MuiChip-root': {
        padding: 0,
        fontSize: 10,
        height: 18,
        borderRadius: 9,
        border: '1px solid var(--color-border)',
        color: 'var(--color-fg-secondary)',
        backgroundColor: 'transparent',
        cursor: 'default',
        textTransform: 'lowercase',
        letterSpacing: '0.04em',
    },
    '& .MuiChip-label': { padding: '0 8px', fontSize: 10, userSelect: 'none' },
    '& .MuiChip-root.software': { color: '#26c6da', borderColor: 'rgba(38,198,218,0.45)' },
    '& .MuiChip-root.network':  { color: '#9c7fe0', borderColor: 'rgba(156,127,224,0.45)' },
    '& .MuiChip-root.hardware': { color: '#ff9800', borderColor: 'rgba(255,152,0,0.45)' },
    '& .MuiChip-root.security': { color: '#ff4040', borderColor: 'rgba(255,64,64,0.45)' },
    '& .MuiChip-root.active':   { color: 'var(--accent)', borderColor: 'rgba(10,245,176,0.45)' },
});

const UpgradeActions = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROMAN_NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const toRoman = (value: number): string => (value < 0 ? '0' : (ROMAN_NUMERALS[value] ?? String(value)));

interface UpgradeComponentProps {
    upgrade: IUpgradeItem;
    onClick?: (upgrade: IUpgradeItem) => void;
    selected?: boolean;
    onPurchase: (upgrade: IUpgradeItem, tier: IUpgradeTier) => void;
}

interface MissingRequirement { name: string; tierLabel: string }

const computeMissingRequirements = (
    requires: IUpgradeRequirement[] | undefined,
    purchasedUpgradeKeys: Map<string, number>,
): MissingRequirement[] => {
    if (!requires || requires.length === 0) return [];
    const missing: MissingRequirement[] = [];
    for (const req of requires) {
        const reqUpgrade = UpgradeList.find((u) => u.key === req.key);
        if (!reqUpgrade) continue;
        const requiredIdx = reqUpgrade.tiers.findIndex((t) => t.tierId === req.tierId);
        if (requiredIdx === -1) continue;
        const ownedIdx = (purchasedUpgradeKeys.get(req.key) ?? 0) - 1;
        if (ownedIdx < requiredIdx) {
            missing.push({ name: reqUpgrade.name, tierLabel: `Mk ${toRoman(requiredIdx + 1)}+` });
        }
    }
    return missing;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UpgradeComponent({ upgrade, onClick, selected, onPurchase }: UpgradeComponentProps) {
    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);
    const money             = usePlayerStore((s) => s.player.money);

    const purchasedTierCountByKey = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of purchasedUpgrades) map.set(p.upgradeId, (map.get(p.upgradeId) ?? 0) + 1);
        return map;
    }, [purchasedUpgrades]);

    const totalTiers      = upgrade.tiers.length;
    const currentTierCount = purchasedTierCountByKey.get(upgrade.key) ?? 0;
    const isMaxed         = currentTierCount >= totalTiers;
    const nextTier: IUpgradeTier | null = isMaxed ? null : upgrade.tiers[currentTierCount];

    const missingRequirements = useMemo(
        () => computeMissingRequirements(nextTier?.requires, purchasedTierCountByKey),
        [nextTier, purchasedTierCountByKey],
    );

    const isLocked   = missingRequirements.length > 0;
    const cantAfford = !!nextTier && nextTier.cost > money;
    const canPurchase = !!nextTier && !isLocked && !cantAfford;

    const currentTierLabel = currentTierCount > 0 ? toRoman(currentTierCount) : null;
    const lockedReason     = !nextTier ? 'maxed' : isLocked ? 'locked' : cantAfford ? 'cant-afford' : 'available';

    const costStatus: CostStatus = isMaxed ? 'maxed' : canPurchase ? 'available' : isLocked ? 'locked' : 'cant-afford';
    const purchaseStatus: PurchaseStatus = isMaxed ? 'maxed' : canPurchase ? 'purchase' : isLocked ? 'locked' : 'cant-afford';

    const stopCardToggle = (event: React.SyntheticEvent) => event.stopPropagation();

    const handlePurchase = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!nextTier || !canPurchase) return;
        onPurchase(upgrade, nextTier);
    };

    return (
        <UpgradeCard
            style={getCategoryVars(upgrade.category)}
            isSelected={selected}
            lockedReason={lockedReason}
            onClick={() => onClick?.(upgrade)}
        >
            <CardHeader
                sx={{
                    alignItems: 'center',
                    padding: '14px 14px 8px',
                    '& .MuiCardHeader-content': { alignSelf: 'center' },
                    '& .MuiCardHeader-title': {
                        fontSize: 16, fontWeight: 700, color: 'var(--color-fg)',
                        userSelect: 'none', lineHeight: 1.15,
                    },
                    '& .MuiCardHeader-subheader': { marginTop: '2px' },
                    '& .MuiCardHeader-action': { alignSelf: 'center', margin: 0 },
                }}
                title={upgrade.name}
                subheader={<UpgradeCategory>{upgrade.category}</UpgradeCategory>}
                avatar={
                    <UpgradeCategoryIcon variant="rounded">
                        <upgrade.icon />
                    </UpgradeCategoryIcon>
                }
                action={
                    <UpgradeHeaderAction>
                        {currentTierCount > 0 && <UpgradeTierPill>MK {currentTierLabel}</UpgradeTierPill>}
                        {isLocked && (
                            <UpgradeLockPill aria-label="Requirements not met">
                                <LockOutlinedIcon fontSize="small" />
                            </UpgradeLockPill>
                        )}
                    </UpgradeHeaderAction>
                }
            />

            <UpgradeCardBody>
                <UpgradeTierMeter>
                    <UpgradeTierMeterRow>
                        <span>Tier</span>
                        <UpgradeTierMeterProgress>
                            {toRoman(currentTierCount)} / {toRoman(totalTiers)}
                        </UpgradeTierMeterProgress>
                    </UpgradeTierMeterRow>
                    <UpgradeTierMeterBars>
                        {upgrade.tiers.map((tier, idx) => {
                            const filled = idx < currentTierCount;
                            const isNext = !filled && idx === currentTierCount && canPurchase;
                            return <UpgradeTierMeterBar key={tier.tierId} filled={filled} isNext={isNext} />;
                        })}
                    </UpgradeTierMeterBars>
                </UpgradeTierMeter>

                {currentTierCount === 0 && nextTier && (
                    <UpgradeOverview>{upgrade.description}</UpgradeOverview>
                )}

                {nextTier ? (
                    <UpgradeNextBlock nextState={isLocked ? 'locked' : 'normal'}>
                        <UpgradeNextHead>
                            <UpgradeNextLabel initial={currentTierCount === 0}>
                                {currentTierCount === 0
                                    ? `Tier ${nextTier.title.replace(/^Mk\s*/i, '')}`
                                    : `Next · ${nextTier.title}`}
                            </UpgradeNextLabel>
                            {nextTier.callout && <UpgradeNextCallout>{nextTier.callout}</UpgradeNextCallout>}
                        </UpgradeNextHead>
                        <UpgradeNextDesc>{nextTier.description}</UpgradeNextDesc>
                    </UpgradeNextBlock>
                ) : (
                    <UpgradeNextBlock nextState="maxed">
                        <UpgradeMaxedIcon><CheckCircleOutlineIcon /></UpgradeMaxedIcon>
                        <UpgradeMaxedBody>
                            <UpgradeMaxedTitle>Fully Upgraded</UpgradeMaxedTitle>
                            <UpgradeMaxedSubtitle>
                                {upgrade.name} is at its maximum tier ({toRoman(totalTiers)}). No further upgrades available.
                            </UpgradeMaxedSubtitle>
                        </UpgradeMaxedBody>
                    </UpgradeNextBlock>
                )}

                {isLocked && (
                    <UpgradeRequires>
                        <UpgradeRequiresHead>
                            <LockOutlinedIcon fontSize="small" />
                            <span>Requires</span>
                        </UpgradeRequiresHead>
                        <UpgradeRequiresList>
                            {missingRequirements.map((req) => (
                                <li key={req.name}>
                                    <RadioButtonUncheckedIcon fontSize="inherit" />
                                    <UpgradeRequiresName>{req.name}</UpgradeRequiresName>
                                    <UpgradeRequiresTier>{req.tierLabel}</UpgradeRequiresTier>
                                </li>
                            ))}
                        </UpgradeRequiresList>
                    </UpgradeRequires>
                )}
            </UpgradeCardBody>

            <UpgradeCardFooter onClick={stopCardToggle} onMouseDown={stopCardToggle}>
                <UpgradeTags>
                    {upgrade.tags.map((tag, idx) => (
                        <Chip key={'upgrade-tag-' + idx.toString()} label={tag} variant="outlined" className={tag} />
                    ))}
                </UpgradeTags>
                <UpgradeActions>
                    <UpgradeCostBlock>
                        <UpgradeCostLabel>
                            {nextTier && currentTierCount > 0 && canPurchase ? 'Upgrade Cost' : 'Cost'}
                        </UpgradeCostLabel>
                        <UpgradeCost costStatus={costStatus}>
                            {nextTier ? `$${formatMoney(nextTier.cost, 0)}` : '—'}
                        </UpgradeCost>
                    </UpgradeCostBlock>

                    {isMaxed ? (
                        <UpgradeActionButton purchaseStatus="maxed" disabled variant="contained" startIcon={<CheckCircleOutlineIcon />}>
                            Maxed
                        </UpgradeActionButton>
                    ) : canPurchase ? (
                        <UpgradeActionButton
                            purchaseStatus="purchase"
                            variant="contained"
                            startIcon={currentTierCount === 0 ? <AddIcon /> : <ArrowUpwardIcon />}
                            onClick={handlePurchase}
                            onMouseDown={stopCardToggle}
                            onPointerDown={stopCardToggle}
                        >
                            {currentTierCount === 0 ? `Buy ${nextTier?.title}` : `Upgrade → ${nextTier?.title}`}
                        </UpgradeActionButton>
                    ) : (
                        <UpgradeActionButton
                            purchaseStatus={purchaseStatus}
                            disabled
                            variant="contained"
                            startIcon={<LockOutlinedIcon />}
                        >
                            {nextTier?.title} · {isLocked ? 'Locked' : "Can't Afford"}
                        </UpgradeActionButton>
                    )}
                </UpgradeActions>
            </UpgradeCardFooter>
        </UpgradeCard>
    );
}

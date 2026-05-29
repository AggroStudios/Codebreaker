import { IUpgradeItem, IUpgradeRequirement, IUpgradeTier, UpgradeList } from '../../data/upgrades';
import { useMemo } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import clsx from 'clsx';

import { formatMoney } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';

import './style.scss';

const ROMAN_NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const toRoman = (value: number): string => {
    if (value < 0) return '0';
    return ROMAN_NUMERALS[value] ?? String(value);
};

interface UpgradeComponentProps {
    upgrade: IUpgradeItem;
    onClick?: (upgrade: IUpgradeItem) => void;
    selected?: boolean;
    onPurchase: (upgrade: IUpgradeItem, tier: IUpgradeTier) => void;
}

interface MissingRequirement {
    name: string;
    tierLabel: string;
}

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
            missing.push({
                name: reqUpgrade.name,
                tierLabel: `Mk ${toRoman(requiredIdx + 1)}+`,
            });
        }
    }
    return missing;
};

export default function UpgradeComponent(props: UpgradeComponentProps) {
    const { upgrade, onClick, selected, onPurchase } = props;

    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);
    const money = usePlayerStore((s) => s.player.money);

    const purchasedTierCountByKey = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of purchasedUpgrades) {
            map.set(p.upgradeId, (map.get(p.upgradeId) ?? 0) + 1);
        }
        return map;
    }, [purchasedUpgrades]);

    const totalTiers = upgrade.tiers.length;
    const currentTierCount = purchasedTierCountByKey.get(upgrade.key) ?? 0;
    const isMaxed = currentTierCount >= totalTiers;
    const nextTier: IUpgradeTier | null = isMaxed ? null : upgrade.tiers[currentTierCount];

    const missingRequirements = useMemo(
        () => computeMissingRequirements(nextTier?.requires, purchasedTierCountByKey),
        [nextTier, purchasedTierCountByKey],
    );

    const isLocked = missingRequirements.length > 0;
    const cantAfford = !!nextTier && nextTier.cost > money;
    const canPurchase = !!nextTier && !isLocked && !cantAfford;

    const currentTierLabel = currentTierCount > 0 ? toRoman(currentTierCount) : null;

    const lockedReason = !nextTier
        ? 'maxed'
        : isLocked
            ? 'locked'
            : cantAfford
                ? 'cant-afford'
                : 'available';

    const stopCardToggle = (event: React.SyntheticEvent) => {
        event.stopPropagation();
    };

    const handlePurchase = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!nextTier || !canPurchase) return;
        onPurchase(upgrade, nextTier);
    };

    return (
        <Card
            className={clsx('upgrade', upgrade.category, selected && 'selected', lockedReason)}
            onClick={() => onClick?.(upgrade)}
        >
            <CardHeader
                className="upgrade-header"
                title={upgrade.name}
                subheader={
                    <span className={clsx('upgrade-category', upgrade.category)}>
                        {upgrade.category}
                    </span>
                }
                avatar={
                    <Avatar
                        className={clsx('upgrade-category-icon', upgrade.category)}
                        variant="rounded"
                    >
                        <upgrade.icon />
                    </Avatar>
                }
                action={
                    <div className="upgrade-header-action">
                        {currentTierCount > 0 && (
                            <span className={clsx('upgrade-tier-pill', upgrade.category)}>
                                MK {currentTierLabel}
                            </span>
                        )}
                        {isLocked && (
                            <span className="upgrade-lock-pill" aria-label="Requirements not met">
                                <LockOutlinedIcon fontSize="small" />
                            </span>
                        )}
                    </div>
                }
            />
            <CardContent className="upgrade-body">
                <div className="upgrade-tier-meter">
                    <div className="upgrade-tier-meter-row">
                        <span className="upgrade-tier-meter-label">Tier</span>
                        <span className="upgrade-tier-meter-progress">
                            {toRoman(currentTierCount)} / {toRoman(totalTiers)}
                        </span>
                    </div>
                    <div className="upgrade-tier-meter-bars">
                        {upgrade.tiers.map((tier, idx) => {
                            const filled = idx < currentTierCount;
                            const isNext = !filled && idx === currentTierCount && canPurchase;
                            return (
                                <span
                                    key={tier.tierId}
                                    className={clsx(
                                        'upgrade-tier-meter-bar',
                                        filled && 'filled',
                                        isNext && 'next',
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="upgrade-overview">
                    {upgrade.description}
                </div>

                {nextTier ? (
                    <div className={clsx('upgrade-next', isLocked && 'locked', currentTierCount === 0 && 'initial')}>
                        <div className="upgrade-next-head">
                                <span
                                    className={clsx(
                                        'upgrade-next-label',
                                        currentTierCount === 0 && 'initial',
                                        upgrade.category,
                                    )}
                                >
                                    {currentTierCount === 0
                                        ? `Tier ${nextTier.title.replace(/^Mk\s*/i, '')}`
                                        : `Next · ${nextTier.title}`}
                                </span>
                            {nextTier.callout && (
                                <span className={clsx('upgrade-next-callout', upgrade.category)}>
                                        {nextTier.callout}
                                    </span>
                            )}
                        </div>
                        <div className="upgrade-next-description">
                            {nextTier.description}
                        </div>
                    </div>
                ) : (
                    <div className="upgrade-next maxed">
                        <div className="upgrade-maxed-icon">
                            <CheckCircleOutlineIcon />
                        </div>
                        <div className="upgrade-maxed-body">
                            <div className="upgrade-maxed-title">Fully Upgraded</div>
                            <div className="upgrade-maxed-subtitle">
                                {upgrade.name} is at its maximum tier ({toRoman(totalTiers)}). No further upgrades available.
                            </div>
                        </div>
                    </div>
                )}

                {isLocked && (
                    <div className="upgrade-requires">
                        <div className="upgrade-requires-head">
                            <LockOutlinedIcon fontSize="small" />
                            <span>Requires</span>
                        </div>
                        <ul className="upgrade-requires-list">
                            {missingRequirements.map((req) => (
                                <li key={req.name}>
                                    <RadioButtonUncheckedIcon fontSize="inherit" />
                                    <span className="upgrade-requires-name">{req.name}</span>
                                    <span className="upgrade-requires-tier">{req.tierLabel}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
            <CardActions
                className="upgrade-footer"
                onClick={stopCardToggle}
                onMouseDown={stopCardToggle}
            >
                <div className="upgrade-tags">
                    {upgrade.tags.map((tag, idx) => (
                        <Chip
                            key={'upgrade-tag-' + idx.toString()}
                            label={tag}
                            variant="outlined"
                            className={tag}
                        />
                    ))}
                </div>
                <div className="upgrade-actions">
                    <div className="upgrade-cost-block">
                        <div className="upgrade-cost-label">
                            {nextTier && currentTierCount > 0 && canPurchase ? 'Upgrade Cost' : 'Cost'}
                        </div>
                        <div
                            className={clsx(
                                'upgrade-cost',
                                canPurchase && 'available',
                                cantAfford && 'cant-afford',
                                isLocked && 'locked',
                                isMaxed && 'maxed',
                            )}
                        >
                            {nextTier ? `$${formatMoney(nextTier.cost, 0)}` : '—'}
                        </div>
                    </div>
                    {isMaxed ? (
                        <Button
                            className="upgrade-button maxed"
                            disabled
                            variant="contained"
                            startIcon={<CheckCircleOutlineIcon />}
                        >
                            Maxed
                        </Button>
                    ) : canPurchase ? (
                        <Button
                            type="button"
                            className="upgrade-button purchase"
                            variant="contained"
                            startIcon={currentTierCount === 0 ? <AddIcon /> : <ArrowUpwardIcon />}
                            onClick={handlePurchase}
                            onMouseDown={stopCardToggle}
                            onPointerDown={stopCardToggle}
                        >
                            {currentTierCount === 0
                                ? `Buy ${nextTier?.title}`
                                : `Upgrade → ${nextTier?.title}`}
                        </Button>
                    ) : (
                        <Button
                            className={clsx('upgrade-button', isLocked ? 'locked' : 'cant-afford')}
                            disabled
                            variant="contained"
                            startIcon={<LockOutlinedIcon />}
                        >
                            {nextTier?.title} · {isLocked ? 'Locked' : "Can't Afford"}
                        </Button>
                    )}
                </div>
            </CardActions>
        </Card>

    );
}

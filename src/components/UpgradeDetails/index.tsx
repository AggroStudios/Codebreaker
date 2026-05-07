import { useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import clsx from 'clsx';

import { IUpgradeItem, IUpgradeRequirement, IUpgradeTier, UpgradeList } from '../../lib/upgrades';
import { formatMoney } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';

import './index.scss';

const ROMAN_NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const toRoman = (value: number): string => {
    if (value < 0) return '0';
    return ROMAN_NUMERALS[value] ?? String(value);
};

interface UpgradeDetailsProps {
    upgrade?: IUpgradeItem | null;
    onPurchase?: (upgrade: IUpgradeItem, tier: IUpgradeTier) => void;
    onClose?: () => void;
}

interface PrereqStatus {
    key: string;
    name: string;
    tierLabel: string;
    shortRequirement: string;
    met: boolean;
}

const buildPrereqStatus = (
    requirements: IUpgradeRequirement[],
    purchasedTierCountByKey: Map<string, number>,
): PrereqStatus[] =>
    requirements.map((req) => {
        const reqUpgrade = UpgradeList.find((u) => u.key === req.key);
        const requiredIdx = reqUpgrade
            ? reqUpgrade.tiers.findIndex((t) => t.tierId === req.tierId)
            : -1;
        const ownedIdx = (purchasedTierCountByKey.get(req.key) ?? 0) - 1;
        const met = ownedIdx >= requiredIdx && requiredIdx >= 0;
        const rank = requiredIdx >= 0 ? toRoman(requiredIdx + 1) : req.tierId;
        return {
            key: req.key,
            name: reqUpgrade?.name ?? req.key,
            tierLabel: requiredIdx >= 0 ? `Mk ${rank}+` : req.tierId,
            shortRequirement: `${req.key}@Mk${rank}`,
            met,
        };
    });

export default function UpgradeDetails({ upgrade, onPurchase, onClose }: UpgradeDetailsProps) {
    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);
    const money = usePlayerStore((s) => s.player.money);

    const purchasedTierCountByKey = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of purchasedUpgrades) {
            map.set(p.upgradeId, (map.get(p.upgradeId) ?? 0) + 1);
        }
        return map;
    }, [purchasedUpgrades]);

    if (!upgrade) {
        return (
            <div className="upgrade-details upgrade-details-empty">
                <TouchAppOutlinedIcon />
                <span>Select an upgrade to inspect its full tier ladder.</span>
            </div>
        );
    }

    const totalTiers = upgrade.tiers.length;
    const currentTierCount = purchasedTierCountByKey.get(upgrade.key) ?? 0;
    const isMaxed = currentTierCount >= totalTiers;
    const nextTier: IUpgradeTier | null = isMaxed ? null : upgrade.tiers[currentTierCount];

    const combinedRequirements: IUpgradeRequirement[] = [...(upgrade.requires ?? [])];
    for (const req of nextTier?.requires ?? []) {
        if (!combinedRequirements.some((r) => r.key === req.key && r.tierId === req.tierId)) {
            combinedRequirements.push(req);
        }
    }

    const prereqs = buildPrereqStatus(combinedRequirements, purchasedTierCountByKey);
    const isLocked = prereqs.some((p) => !p.met);
    const cantAfford = !!nextTier && nextTier.cost > money;
    const canPurchase = !!nextTier && !isLocked && !cantAfford;

    const subtitleStatus = currentTierCount > 0
        ? `Mk ${toRoman(currentTierCount)}`
        : 'Not Owned';

    const handlePurchase = () => {
        if (!nextTier || !canPurchase) return;
        onPurchase?.(upgrade, nextTier);
    };

    const Icon = upgrade.icon;

    return (
        <div className={clsx('upgrade-details', upgrade.category)}>
            <header className="upgrade-details-header">
                <Avatar
                    className={clsx('upgrade-category-icon', upgrade.category)}
                    variant="rounded"
                >
                    <Icon />
                </Avatar>
                <div className="upgrade-details-title">
                    <div className="upgrade-details-name">{upgrade.name}</div>
                    <div className="upgrade-details-subtitle">
                        <span className={clsx('upgrade-details-category', upgrade.category)}>
                            {upgrade.category}
                        </span>
                        <span className="upgrade-details-separator">·</span>
                        <span
                            className={clsx(
                                'upgrade-details-status',
                                currentTierCount > 0 ? 'owned' : 'not-owned',
                            )}
                        >
                            {subtitleStatus}
                        </span>
                    </div>
                </div>
                {onClose && (
                    <IconButton
                        className="upgrade-details-close"
                        onClick={onClose}
                        size="small"
                        aria-label="Close upgrade details"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </header>

            <div className="upgrade-details-description">{upgrade.description}</div>

            <div className="upgrade-details-body">
                {prereqs.length > 0 && (
                    <section className="upgrade-details-section">
                        <div className="upgrade-details-section-label">Prerequisites</div>
                        <ul className="upgrade-prereq-list">
                            {prereqs.map((p) => (
                                <li
                                    key={p.key}
                                    className={clsx(
                                        'upgrade-prereq-row',
                                        p.met ? 'met' : 'missing',
                                    )}
                                >
                                    {p.met ? (
                                        <CheckCircleOutlinedIcon fontSize="small" />
                                    ) : (
                                        <ErrorOutlineIcon fontSize="small" />
                                    )}
                                    <span className="upgrade-prereq-name">{p.name}</span>
                                    <span className="upgrade-prereq-tier">{p.tierLabel}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="upgrade-details-section">
                    <div className="upgrade-details-section-label">Tier Ladder</div>
                    <ul className="upgrade-tier-list">
                        {upgrade.tiers.map((tier, idx) => {
                            const owned = idx < currentTierCount;
                            const isNext = !owned && idx === currentTierCount;
                            const future = !owned && !isNext;
                            const tierRanksRoman = toRoman(idx + 1);
                            const tierPrereqs = isNext
                                ? buildPrereqStatus(
                                      tier.requires ?? [],
                                      purchasedTierCountByKey,
                                  )
                                : [];
                            return (
                                <li
                                    key={tier.tierId}
                                    className={clsx(
                                        'upgrade-tier-row',
                                        owned && 'owned',
                                        isNext && 'next',
                                        future && 'future',
                                        upgrade.category,
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            'upgrade-tier-badge',
                                            upgrade.category,
                                            owned && 'owned',
                                            isNext && 'next',
                                            future && 'future',
                                        )}
                                    >
                                        {tierRanksRoman}
                                    </span>
                                    <div className="upgrade-tier-row-body">
                                        <div className="upgrade-tier-row-head">
                                            <span className="upgrade-tier-row-name">
                                                {tier.title}
                                            </span>
                                            {owned && (
                                                <span
                                                    className={clsx(
                                                        'upgrade-tier-owned-pill',
                                                        upgrade.category,
                                                    )}
                                                >
                                                    Owned
                                                </span>
                                            )}
                                        </div>
                                        <div className="upgrade-tier-row-description">
                                            {tier.description}
                                        </div>
                                        {tierPrereqs.length > 0 && (
                                            <div className="upgrade-tier-row-requires">
                                                <span className="upgrade-tier-row-requires-label">
                                                    requires:
                                                </span>{' '}
                                                {tierPrereqs.map((p, i) => (
                                                    <span
                                                        key={p.shortRequirement}
                                                        className={clsx(
                                                            'upgrade-tier-row-requires-item',
                                                            p.met ? 'met' : 'missing',
                                                        )}
                                                    >
                                                        {p.shortRequirement}
                                                        {i < tierPrereqs.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={clsx(
                                            'upgrade-tier-row-cost',
                                            owned && 'owned',
                                            isNext && 'next',
                                            future && 'future',
                                        )}
                                    >
                                        ${formatMoney(tier.cost, 0)}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>

            <footer className="upgrade-details-footer">
                <div className="upgrade-cost-block">
                    <div className="upgrade-cost-label">
                        {isMaxed
                            ? 'Status'
                            : currentTierCount > 0
                                ? 'Next Tier'
                                : 'Purchase'}
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
                        {nextTier ? `$${formatMoney(nextTier.cost, 0)}` : 'Maxed'}
                    </div>
                </div>
                {isMaxed ? (
                    <Button
                        className="upgrade-button maxed"
                        disabled
                        variant="contained"
                        startIcon={<CheckCircleOutlinedIcon />}
                    >
                        Maxed
                    </Button>
                ) : canPurchase ? (
                    <Button
                        className="upgrade-button purchase"
                        variant="contained"
                        startIcon={
                            currentTierCount === 0 ? <AddIcon /> : <ArrowUpwardIcon />
                        }
                        onClick={handlePurchase}
                    >
                        {currentTierCount === 0
                            ? `Buy ${nextTier?.title}`
                            : `Upgrade to ${nextTier?.title}`}
                    </Button>
                ) : (
                    <Button
                        className={clsx('upgrade-button', isLocked ? 'locked' : 'cant-afford')}
                        disabled
                        variant="contained"
                        startIcon={
                            isLocked ? <LockOutlinedIcon /> : <ArrowUpwardIcon />
                        }
                    >
                        {isLocked ? 'Locked' : "Can't Afford"}
                    </Button>
                )}
            </footer>
        </div>
    );
}

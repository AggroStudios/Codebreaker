import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';

import { IUpgradeItem, IUpgradeRequirement, IUpgradeTier, UpgradeList } from '../../data/upgrades';
import { formatMoney } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';
import {
    getCategoryVars,
    UpgradeCategoryIcon,
    UpgradeCostBlock,
    UpgradeCostLabel,
    UpgradeCost,
    UpgradeActionButton,
    type CostStatus,
} from '../Upgrade/upgradeShared';

// ---------------------------------------------------------------------------
// Local styled components
// ---------------------------------------------------------------------------

const DetailsPanel = styled('div', {
    shouldForwardProp: (prop) => prop !== 'empty',
})<{ empty?: boolean }>(({ empty }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'rgba(20,22,26,0.5)',
    backdropFilter: 'blur(8px)',
    ...(empty && {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
    }),
}));

const EmptyIcon = styled('div')({
    '& .MuiSvgIcon-root': { fontSize: 32, color: 'rgba(255,255,255,0.25)' },
});

const EmptyText = styled('span')({
    maxWidth: 220,
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-fg-secondary)',
    userSelect: 'none',
});

const DetailsHeader = styled('header')({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '16px 14px 10px',
});

const DetailsTitleBlock = styled('div')({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
});

const DetailsName = styled('div')({
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-fg)',
    lineHeight: 1.2,
    userSelect: 'none',
});

const DetailsSubtitle = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-code)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    userSelect: 'none',
});

const DetailsCategory = styled('span')({ color: 'var(--category-color)' });

const DetailsSeparator = styled('span')({ color: 'var(--color-fg-disabled)' });

const DetailsStatus = styled('span', {
    shouldForwardProp: (prop) => prop !== 'isOwned',
})<{ isOwned?: boolean }>(({ isOwned }) => ({
    color: isOwned ? 'var(--category-color)' : 'var(--color-fg-secondary)',
}));

const DetailsDescription = styled('div')({
    padding: '0 14px 14px',
    fontSize: 12,
    lineHeight: 1.5,
    color: 'var(--color-fg-secondary)',
    userSelect: 'none',
});

const DetailsBody = styled('div')({
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 14px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
});

const DetailsSection = styled('section')({ display: 'flex', flexDirection: 'column', gap: 6 });

const DetailsSectionLabel = styled('div')({
    fontFamily: 'var(--font-code)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
    color: 'var(--color-fg-disabled)',
    userSelect: 'none',
});

const PrereqList = styled('ul')({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
});

const PrereqRow = styled('li', {
    shouldForwardProp: (prop) => prop !== 'met',
})<{ met?: boolean }>(({ met }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--color-border)',
    fontSize: 12,
    userSelect: 'none',
    ...(met === true && {
        borderColor: 'rgba(10,245,176,0.30)',
        backgroundColor: 'rgba(10,245,176,0.05)',
        '& .MuiSvgIcon-root': { color: 'var(--accent)', fontSize: 16 },
    }),
    ...(met === false && {
        borderColor: 'rgba(255,64,64,0.30)',
        backgroundColor: 'rgba(255,64,64,0.05)',
        '& .MuiSvgIcon-root': { color: '#ff4040', fontSize: 16 },
    }),
}));

const PrereqName = styled('span')({ flex: 1, color: 'var(--color-fg)' });

const PrereqTier = styled('span')({
    fontFamily: 'var(--font-code)',
    fontSize: 11,
    color: 'var(--color-fg-secondary)',
    letterSpacing: '0.06em',
});

const TierList = styled('ul')({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
});

type TierState = 'owned' | 'next' | 'future';

const TierRow = styled('li', {
    shouldForwardProp: (prop) => prop !== 'tierState',
})<{ tierState?: TierState }>(({ tierState }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 6,
    border: '1px solid transparent',
    backgroundColor: 'rgba(255,255,255,0.02)',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    ...(tierState === 'owned' && {
        borderColor: 'var(--color-border)',
        backgroundColor: 'rgba(255,255,255,0.025)',
    }),
    ...(tierState === 'next' && {
        borderColor: 'var(--category-color-border)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 1px var(--category-color-border)',
    }),
    ...(tierState === 'future' && { opacity: 0.55 }),
}));

const TierBadge = styled('span', {
    shouldForwardProp: (prop) => prop !== 'tierState',
})<{ tierState?: TierState }>(({ tierState }) => ({
    flexShrink: 0,
    width: 28,
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    fontFamily: 'var(--font-code)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    border: '1px solid transparent',
    userSelect: 'none',
    ...(tierState === 'owned' && {
        backgroundColor: 'var(--category-color-owned)',
        color: 'var(--category-color)',
        borderColor: 'var(--category-color-border)',
        boxShadow: 'inset 0 0 0 1px var(--category-color-border), 0 0 8px var(--category-glow)',
    }),
    ...(tierState === 'next' && {
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: 'var(--category-color)',
        borderColor: 'var(--category-color-border)',
    }),
    ...(tierState === 'future' && {
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: 'var(--color-fg-disabled)',
        borderColor: 'var(--color-border)',
    }),
}));

const TierRowBody = styled('div')({ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 });

const TierRowHead = styled('div')({ display: 'flex', alignItems: 'center', gap: 8 });

const TierRowName = styled('span', {
    shouldForwardProp: (prop) => prop !== 'future',
})<{ future?: boolean }>(({ future }) => ({
    fontSize: 13,
    fontWeight: 700,
    color: future ? 'var(--color-fg-secondary)' : 'var(--color-fg)',
    userSelect: 'none',
}));

const TierOwnedPill = styled('span')({
    fontFamily: 'var(--font-code)',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    userSelect: 'none',
});

const TierRowDescription = styled('div')({
    fontSize: 12,
    lineHeight: 1.4,
    color: 'var(--color-fg-secondary)',
    userSelect: 'none',
});

const TierRowRequires = styled('div')({
    marginTop: 4,
    fontFamily: 'var(--font-code)',
    fontSize: 10,
    color: 'var(--color-fg-disabled)',
    letterSpacing: '0.04em',
    userSelect: 'none',
});

const TierRequiresLabel = styled('span')({ color: 'var(--color-fg-disabled)' });

const TierRequiresItem = styled('span', {
    shouldForwardProp: (prop) => prop !== 'met',
})<{ met?: boolean }>(({ met }) => ({
    color: met ? 'var(--accent)' : '#ff7070',
}));

const TierRowCost = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tierState',
})<{ tierState?: TierState }>(({ tierState }) => ({
    flexShrink: 0,
    fontFamily: 'var(--font-code)',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--accent)',
    userSelect: 'none',
    ...(tierState === 'owned'  && { color: 'var(--color-fg-disabled)', textDecoration: 'line-through' }),
    ...(tierState === 'future' && { opacity: 0.85 }),
}));

const DetailsFooter = styled('footer')({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 14px 14px',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'rgba(0,0,0,0.2)',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROMAN_NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const toRoman = (value: number): string => (value < 0 ? '0' : (ROMAN_NUMERALS[value] ?? String(value)));

interface UpgradeDetailsProps {
    upgrade?: IUpgradeItem | null;
    onPurchase?: (upgrade: IUpgradeItem, tier: IUpgradeTier) => void;
    onClose?: () => void;
}

interface PrereqStatus {
    key: string; name: string; tierLabel: string; shortRequirement: string; met: boolean;
}

const buildPrereqStatus = (
    requirements: IUpgradeRequirement[],
    purchasedTierCountByKey: Map<string, number>,
): PrereqStatus[] =>
    requirements.map((req) => {
        const reqUpgrade   = UpgradeList.find((u) => u.key === req.key);
        const requiredIdx  = reqUpgrade ? reqUpgrade.tiers.findIndex((t) => t.tierId === req.tierId) : -1;
        const ownedIdx     = (purchasedTierCountByKey.get(req.key) ?? 0) - 1;
        const met          = ownedIdx >= requiredIdx && requiredIdx >= 0;
        const rank         = requiredIdx >= 0 ? toRoman(requiredIdx + 1) : req.tierId;
        return {
            key: req.key,
            name: reqUpgrade?.name ?? req.key,
            tierLabel: requiredIdx >= 0 ? `Mk ${rank}+` : req.tierId,
            shortRequirement: `${req.key}@Mk${rank}`,
            met,
        };
    });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UpgradeDetails({ upgrade, onPurchase, onClose }: UpgradeDetailsProps) {
    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);
    const money             = usePlayerStore((s) => s.player.money);

    const purchasedTierCountByKey = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of purchasedUpgrades) map.set(p.upgradeId, (map.get(p.upgradeId) ?? 0) + 1);
        return map;
    }, [purchasedUpgrades]);

    if (!upgrade) {
        return (
            <DetailsPanel empty>
                <EmptyIcon><TouchAppOutlinedIcon /></EmptyIcon>
                <EmptyText>Select an upgrade to inspect its full tier ladder.</EmptyText>
            </DetailsPanel>
        );
    }

    const totalTiers      = upgrade.tiers.length;
    const currentTierCount = purchasedTierCountByKey.get(upgrade.key) ?? 0;
    const isMaxed         = currentTierCount >= totalTiers;
    const nextTier: IUpgradeTier | null = isMaxed ? null : upgrade.tiers[currentTierCount];

    const combinedRequirements: IUpgradeRequirement[] = [...(upgrade.requires ?? [])];
    for (const req of nextTier?.requires ?? []) {
        if (!combinedRequirements.some((r) => r.key === req.key && r.tierId === req.tierId)) {
            combinedRequirements.push(req);
        }
    }

    const prereqs         = buildPrereqStatus(combinedRequirements, purchasedTierCountByKey);
    const isLocked        = prereqs.some((p) => !p.met);
    const cantAfford      = !!nextTier && nextTier.cost > money;
    const canPurchase     = !!nextTier && !isLocked && !cantAfford;
    const subtitleStatus  = currentTierCount > 0 ? `Mk ${toRoman(currentTierCount)}` : 'Not Owned';

    const costStatus: CostStatus = isMaxed ? 'maxed' : canPurchase ? 'available' : isLocked ? 'locked' : 'cant-afford';

    const handlePurchase = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (!nextTier || !canPurchase) return;
        onPurchase?.(upgrade, nextTier);
    };

    const Icon = upgrade.icon;

    return (
        <DetailsPanel style={getCategoryVars(upgrade.category)}>
            <DetailsHeader>
                <UpgradeCategoryIcon variant="rounded"><Icon /></UpgradeCategoryIcon>
                <DetailsTitleBlock>
                    <DetailsName>{upgrade.name}</DetailsName>
                    <DetailsSubtitle>
                        <DetailsCategory>{upgrade.category}</DetailsCategory>
                        <DetailsSeparator>·</DetailsSeparator>
                        <DetailsStatus isOwned={currentTierCount > 0}>{subtitleStatus}</DetailsStatus>
                    </DetailsSubtitle>
                </DetailsTitleBlock>
                {onClose && (
                    <IconButton
                        onClick={onClose}
                        size="small"
                        aria-label="Close upgrade details"
                        sx={{
                            color: 'var(--color-fg-secondary)',
                            alignSelf: 'flex-start',
                            marginTop: '-4px',
                            marginRight: '-4px',
                            '&:hover': { color: 'var(--color-fg)', backgroundColor: 'rgba(255,255,255,0.06)' },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </DetailsHeader>

            <DetailsDescription>{upgrade.description}</DetailsDescription>

            <DetailsBody>
                {prereqs.length > 0 && (
                    <DetailsSection>
                        <DetailsSectionLabel>Prerequisites</DetailsSectionLabel>
                        <PrereqList>
                            {prereqs.map((p) => (
                                <PrereqRow key={p.key} met={p.met}>
                                    {p.met ? <CheckCircleOutlinedIcon fontSize="small" /> : <ErrorOutlineIcon fontSize="small" />}
                                    <PrereqName>{p.name}</PrereqName>
                                    <PrereqTier>{p.tierLabel}</PrereqTier>
                                </PrereqRow>
                            ))}
                        </PrereqList>
                    </DetailsSection>
                )}

                <DetailsSection>
                    <DetailsSectionLabel>Tier Ladder</DetailsSectionLabel>
                    <TierList>
                        {upgrade.tiers.map((tier, idx) => {
                            const owned  = idx < currentTierCount;
                            const isNext = !owned && idx === currentTierCount;
                            const future = !owned && !isNext;
                            const tierState: TierState = owned ? 'owned' : isNext ? 'next' : 'future';
                            const tierRankRoman = toRoman(idx + 1);
                            const tierPrereqs = isNext
                                ? buildPrereqStatus(tier.requires ?? [], purchasedTierCountByKey)
                                : [];
                            return (
                                <TierRow key={tier.tierId} tierState={tierState}>
                                    <TierBadge tierState={tierState}>{tierRankRoman}</TierBadge>
                                    <TierRowBody>
                                        <TierRowHead>
                                            <TierRowName future={future}>{tier.title}</TierRowName>
                                            {owned && <TierOwnedPill>Owned</TierOwnedPill>}
                                        </TierRowHead>
                                        <TierRowDescription>{tier.description}</TierRowDescription>
                                        {tierPrereqs.length > 0 && (
                                            <TierRowRequires>
                                                <TierRequiresLabel>requires: </TierRequiresLabel>
                                                {tierPrereqs.map((p, i) => (
                                                    <TierRequiresItem key={p.shortRequirement} met={p.met}>
                                                        {p.shortRequirement}{i < tierPrereqs.length - 1 ? ', ' : ''}
                                                    </TierRequiresItem>
                                                ))}
                                            </TierRowRequires>
                                        )}
                                    </TierRowBody>
                                    <TierRowCost tierState={tierState}>${formatMoney(tier.cost, 0)}</TierRowCost>
                                </TierRow>
                            );
                        })}
                    </TierList>
                </DetailsSection>
            </DetailsBody>

            <DetailsFooter>
                <UpgradeCostBlock>
                    <UpgradeCostLabel>
                        {isMaxed ? 'Status' : currentTierCount > 0 ? 'Next Tier' : 'Purchase'}
                    </UpgradeCostLabel>
                    <UpgradeCost costStatus={costStatus}>
                        {nextTier ? `$${formatMoney(nextTier.cost, 0)}` : 'Maxed'}
                    </UpgradeCost>
                </UpgradeCostBlock>

                {isMaxed ? (
                    <UpgradeActionButton purchaseStatus="maxed" disabled variant="contained" startIcon={<CheckCircleOutlinedIcon />}>
                        Maxed
                    </UpgradeActionButton>
                ) : canPurchase ? (
                    <UpgradeActionButton
                        purchaseStatus="purchase"
                        variant="contained"
                        startIcon={currentTierCount === 0 ? <AddIcon /> : <ArrowUpwardIcon />}
                        onClick={handlePurchase}
                    >
                        {currentTierCount === 0 ? `Buy ${nextTier?.title}` : `Upgrade to ${nextTier?.title}`}
                    </UpgradeActionButton>
                ) : (
                    <UpgradeActionButton
                        purchaseStatus={isLocked ? 'locked' : 'cant-afford'}
                        disabled
                        variant="contained"
                        startIcon={isLocked ? <LockOutlinedIcon /> : <ArrowUpwardIcon />}
                    >
                        {isLocked ? 'Locked' : "Can't Afford"}
                    </UpgradeActionButton>
                )}
            </DetailsFooter>
        </DetailsPanel>
    );
}

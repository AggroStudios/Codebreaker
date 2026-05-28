import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

// ---------------------------------------------------------------------------
// Category colour tokens
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS = {
    software: { color: '#26c6da', soft: 'rgba(38,198,218,0.12)',  border: 'rgba(38,198,218,0.45)',  glow: 'rgba(38,198,218,0.45)',  owned: 'rgba(38,198,218,0.24)' },
    network:  { color: '#9c7fe0', soft: 'rgba(103,58,183,0.18)',  border: 'rgba(156,127,224,0.45)', glow: 'rgba(103,58,183,0.45)',  owned: 'rgba(156,127,224,0.24)' },
    hardware: { color: '#ff9800', soft: 'rgba(255,152,0,0.14)',   border: 'rgba(255,152,0,0.45)',   glow: 'rgba(255,152,0,0.45)',   owned: 'rgba(255,152,0,0.28)' },
    security: { color: '#ff4040', soft: 'rgba(255,64,64,0.14)',   border: 'rgba(255,64,64,0.45)',   glow: 'rgba(255,64,64,0.45)',   owned: 'rgba(255,64,64,0.24)' },
} as const;

const DEFAULT_CATEGORY = {
    color: 'var(--color-fg-secondary)',
    soft:  'rgba(255,255,255,0.07)',
    border:'rgba(255,255,255,0.18)',
    glow:  'rgba(255,255,255,0.18)',
    owned: 'rgba(255,255,255,0.07)',
};

/** Returns CSS custom-property overrides that drive all category-coloured children. */
export function getCategoryVars(category: string): React.CSSProperties {
    const v = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? DEFAULT_CATEGORY;
    return {
        '--category-color':        v.color,
        '--category-color-soft':   v.soft,
        '--category-color-border': v.border,
        '--category-glow':         v.glow,
        '--category-color-owned':  v.owned,
    } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// UpgradeCategoryIcon — theme-registered following the LiveDot pattern
// ---------------------------------------------------------------------------

declare module '@mui/material/styles' {
    interface Components {
        UpgradeCategoryIcon?: {
            defaultProps?: Record<string, unknown>;
        };
    }
}

export const UpgradeCategoryIcon = styled(Avatar, {
    name: 'UpgradeCategoryIcon',
    slot: 'Root',
})({});

// ---------------------------------------------------------------------------
// Shared cost / action block
// ---------------------------------------------------------------------------

export const UpgradeCostBlock = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    userSelect: 'none',
});

export const UpgradeCostLabel = styled('div')({
    fontFamily: 'var(--font-code)',
    fontSize: 9,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--color-fg-secondary)',
});

export type CostStatus = 'available' | 'cant-afford' | 'locked' | 'maxed' | 'default';

export const UpgradeCost = styled('div', {
    shouldForwardProp: (prop) => prop !== 'costStatus',
})<{ costStatus?: CostStatus }>(({ costStatus }) => ({
    fontFamily: 'var(--font-code)',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--color-fg)',
    lineHeight: 1,
    ...(costStatus === 'available'   && { color: 'var(--accent)', textShadow: '0 0 10px rgba(10,245,176,0.5)' }),
    ...(costStatus === 'cant-afford' && { color: '#ff4040' }),
    ...(costStatus === 'locked'      && { color: 'var(--color-fg-secondary)' }),
    ...(costStatus === 'maxed'       && { color: 'var(--color-fg-secondary)' }),
}));

export type PurchaseStatus = 'purchase' | 'maxed' | 'locked' | 'cant-afford';

export const UpgradeActionButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'purchaseStatus',
})<{ purchaseStatus?: PurchaseStatus }>(({ purchaseStatus }) => ({
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: 8,
    boxShadow: 'none',
    minWidth: 0,
    whiteSpace: 'nowrap',
    '& .MuiButton-startIcon': { marginRight: 6 },
    '& .MuiButton-startIcon .MuiSvgIcon-root': { fontSize: 16 },
    ...(purchaseStatus === 'purchase' && {
        backgroundColor: 'var(--accent)',
        color: 'var(--color-fg-on-accent)',
        '&:hover': { backgroundColor: 'var(--accent)', boxShadow: '0 0 14px rgba(10,245,176,0.55)' },
    }),
    ...(purchaseStatus === 'cant-afford' && {
        '&.Mui-disabled': {
            backgroundColor: 'var(--color-bg-cant-afford)',
            color: '#ff4040',
            border: '1px solid rgba(255,64,64,0.25)',
        },
    }),
    ...(purchaseStatus === 'locked' && {
        '&.Mui-disabled': {
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: 'var(--color-fg-secondary)',
            border: '1px solid var(--color-border)',
        },
    }),
    ...(purchaseStatus === 'maxed' && {
        '&.Mui-disabled': {
            backgroundColor: 'var(--accent-dim)',
            color: 'var(--accent)',
            border: '1px solid rgba(10,245,176,0.30)',
        },
    }),
}));

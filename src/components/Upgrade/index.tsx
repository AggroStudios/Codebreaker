import { IUpgradeItem, UpgradeList } from '../../lib/upgrades';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import './index.scss';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { LockOutlined } from '@mui/icons-material';
import { formatMoney } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';
import { useStationContext } from '../../stores/stationContext';
import clsx from 'clsx';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';

interface ConfirmDialogProps {
    open: boolean;
    upgrade: IUpgradeItem | null;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmDialog({
    open,
    upgrade,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogContent>
                {upgrade && (
                    <Typography variant="body2" color="text.secondary">
                        Purchase{' '}
                        <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                            {upgrade.name}
                        </Box>{' '}
                        for{' '}
                        <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            ${upgrade.cost.toLocaleString()}
                        </Box>
                        ?
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit" sx={{ outline: 0 }}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} variant="contained" color="primary" sx={{ outline: 0 }}>
                    Purchase
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function UpgradeComponent(props: { upgrade: IUpgradeItem }) {
    const { upgrade } = props;

    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);
    const purchaseUpgrade = usePlayerStore((s) => s.purchaseUpgrade);
    const money = usePlayerStore((s) => s.player.money);
    const { stationProxy } = useStationContext();

    const [confirmPurchaseDialogOpen, setConfirmPurchaseDialogOpen] = useState(false);

    const isOwned = purchasedUpgrades.includes(upgrade.key);
    const missingRequirements = (upgrade.requires ?? [])
        .filter((req) => !purchasedUpgrades.includes(req))
        .map((req) => UpgradeList.find((u) => u.key === req)?.name ?? req);
    const isLocked = missingRequirements.length > 0;
    const cantAfford = upgrade.cost > money;

    const purchaseClassname = isOwned ? 'owned' : isLocked ? 'cant-afford' : cantAfford ? 'cant-afford' : 'purchase';
    const purchaseButtonText = isOwned ? 'Purchased' : isLocked ? 'Locked' : cantAfford ? "Can't Afford" : 'Purchase';

    const handleConfirmPurchaseDialogClose = () => {
        setConfirmPurchaseDialogOpen(false);
    };

    const handlePurchase = () => {
        if (isOwned || isLocked || cantAfford) return;
        setConfirmPurchaseDialogOpen(true);
    };

    const handleConfirmPurchase = () => {
        upgrade.onPurchase?.(stationProxy);
        purchaseUpgrade(upgrade.key, upgrade.cost);
        setConfirmPurchaseDialogOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ position: 'relative', flex: 1 }} className="upgrade">
                {isOwned && 
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                }} />}
                <CardHeader
                    sx={{ paddingBottom: '8px', alignItems: 'flex-start' }}
                    title={upgrade.name}
                    subheader={<div className="upgrade-category">{upgrade.category}</div>}
                    avatar={
                        <Avatar className={upgrade.category} variant="rounded" sx={{ borderRadius: '8px !important' }}>
                            <upgrade.icon />
                        </Avatar>
                    }
                    action={
                        isOwned
                            ? <Chip label="Owned" className="owned-chip" />
                            : isLocked
                                ? (
                                    <Tooltip title={`Requires: ${missingRequirements.join(', ')}`} placement="top">
                                        <LockOutlined fontSize="small" sx={{ color: 'rgba(255,255,255,0.3)', mt: 0.5 }} />
                                    </Tooltip>
                                )
                                : null
                    }
                />
                <CardContent sx={{ paddingTop: 0 }}>
                    <div className="upgrade-description">{upgrade.description}</div>
                    {isLocked && (
                        <div className="upgrade-requires">
                            <LockOutlined sx={{ fontSize: 11 }} />
                            {missingRequirements.join(', ')}
                        </div>
                    )}
                </CardContent>
                <CardActions sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '12px' }}>
                    <div className="upgrade-tags">
                        {upgrade.tags.map((tag, idx: number) => (
                            <Chip key={'upgrade-tag-' + idx.toString()} label={tag} variant="outlined" className={tag} />
                        ))}
                    </div>
                    <div className="upgrade-actions">
                        <span className={clsx('upgrade-cost', purchaseClassname)}>${formatMoney(upgrade.cost, 0)}</span>
                        <Button className={clsx('upgrade-button', purchaseClassname)} disabled={isOwned || isLocked || cantAfford} variant="contained" color="primary" onClick={handlePurchase}>{purchaseButtonText}</Button>
                    </div>
                </CardActions>
            </Card>
            <ConfirmDialog
                open={confirmPurchaseDialogOpen}
                upgrade={upgrade}
                onConfirm={handleConfirmPurchase}
                onCancel={handleConfirmPurchaseDialogClose}
            />
        </Box>
    );
}
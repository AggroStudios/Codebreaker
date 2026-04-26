import { IUpgradeItem } from '../../lib/upgrades';
import { memo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import './index.scss';
import Button from '@mui/material/Button';
import { formatMoney } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';
import clsx from 'clsx';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';

export default memo(function Upgrade(props: { upgrade: IUpgradeItem }) {
    const { upgrade } = props;

    const purchasedUpgrades = usePlayerStore((s) => s.purchasedUpgrades);
    const purchaseUpgrade = usePlayerStore((s) => s.purchaseUpgrade);
    const money = usePlayerStore((s) => s.player.money);

    const [isOwned, setIsOwned] = useState(false);
    const [cantAfford, setCantAfford] = useState(false);
    const [purchaseButtonText, setPurchaseButtonText] = useState('Purchase');
    const [purchaseClassname, setPurchaseClassname] = useState('purchase');
    const [confirmPurchaseDialogOpen, setConfirmPurchaseDialogOpen] = useState(false);

    useEffect(() => {
        if (purchasedUpgrades.includes(upgrade.key)) {
            setIsOwned(true);
        }
    }, [purchasedUpgrades]);

    useEffect(() => {
        setCantAfford(upgrade.cost > money);
        setPurchaseButtonText(isOwned ? 'Purchased' : (upgrade.cost <= money) ? 'Purchase' : 'Cant Afford');
        setPurchaseClassname(isOwned ? 'owned' : (upgrade.cost <= money) ? 'purchase' : 'cant-afford');
    }, [isOwned, money]);

    const handleConfirmPurchaseDialogClose = () => {
        setConfirmPurchaseDialogOpen(false);
    };

    const handlePurchase = () => {
        if (isOwned || cantAfford) return;
        setConfirmPurchaseDialogOpen(true);
    };

    const handleConfirmPurchase = () => {
        purchaseUpgrade(upgrade.key, upgrade.cost);
        setConfirmPurchaseDialogOpen(false);
    };

    return (
        <Grid size={2} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ position: 'relative', flex: 1 }} className={clsx('upgrade', isOwned && 'disabled')}>
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
                    alignItems: 'center',
                    justifyContent: 'center',
                }} />}
                <CardHeader
                    sx={{ paddingBottom: '8px' }}
                    title={upgrade.name}
                    subheader={<div className="upgrade-category">{upgrade.category}</div>}
                    avatar={
                        <Avatar className={upgrade.category} variant="rounded" sx={{ borderRadius: '8px !important' }}>
                            <upgrade.icon />
                        </Avatar>
                    }
                    action={
                        isOwned && <Chip label="Owned" className="owned-chip" />
                    }
                />
                <CardContent sx={{ paddingTop: 0}}>
                    <div className="upgrade-description">{upgrade.description}</div>
                </CardContent>
                <CardActions sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '12px' }}>
                    <div className="upgrade-tags">
                        {upgrade.tags.map((tag) => (
                            <Chip label={tag} variant="outlined" className={tag} />
                        ))}
                    </div>
                    <div className="upgrade-actions">
                        <span className={clsx('upgrade-cost', purchaseClassname)}>${formatMoney(upgrade.cost, 0)}</span>
                        <Button className={clsx('upgrade-button', purchaseClassname)} disabled={isOwned || cantAfford} variant="contained" color="primary" onClick={handlePurchase}>{purchaseButtonText}</Button>
                    </div>
                </CardActions>
            </Card>
            <Dialog open={confirmPurchaseDialogOpen} onClose={handleConfirmPurchaseDialogClose}>
                <DialogTitle>Confirm Purchase Upgrade</DialogTitle>
                <DialogContent>
                    Are you sure you want to purchase this upgrade?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmPurchase}>Purchase</Button>
                    <Button onClick={handleConfirmPurchaseDialogClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}); 
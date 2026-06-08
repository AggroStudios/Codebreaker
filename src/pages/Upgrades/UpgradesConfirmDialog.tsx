import { type IUpgradeItem, type IUpgradeTier } from '../../data/upgrades';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { formatMoney } from '../../lib/utils';
import clsx from 'clsx';
import './style.scss';

interface UpgradesConfirmDialogProps {
    open: boolean;
    upgrade: IUpgradeItem | null;
    tier: IUpgradeTier | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export function UpgradesConfirmDialog({
   open,
   upgrade,
   tier,
   onConfirm,
   onCancel,
}: UpgradesConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { className: clsx('upgrade-confirm-dialog', upgrade?.category) } }}
        >
            <DialogTitle className="upgrade-confirm-dialog-title">
                <Stack direction="column" spacing={0.5}>
                    <Typography variant="h4">
                        Confirm Purchase
                    </Typography>
                    <Typography color="grey" variant="code4">
                        Confirm Transaction
                    </Typography>
                </Stack>

            </DialogTitle>
            <DialogContent className="upgrade-confirm-dialog-content">
                {upgrade && tier && (
                    <Grid container spacing={2}>
                        <Grid container size={12}>
                            <Grid size="auto">
                                <Avatar
                                    className={clsx('upgrade-category-icon', upgrade.category)}
                                    variant="rounded"
                                >
                                    <upgrade.icon />
                                </Avatar>
                            </Grid>
                            <Grid size="grow">
                                <Stack direction="column">
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="h5">
                                            {upgrade.name}
                                        </Typography>
                                        <Typography>
                                            &#183;
                                        </Typography>
                                        <Typography color="blue" variant="code4">
                                            {tier.title}
                                        </Typography>
                                    </Stack>
                                    <Stack>
                                        <Typography>
                                            {tier.description}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Grid>
                        </Grid>

                        <Grid size={12} className="upgrade-confirm-total">
                            <span className="upgrade-confirm-total-label">Total</span>
                            <span className="upgrade-confirm-total-value">${formatMoney(tier.cost, 0)}</span>
                        </Grid>
                    </Grid>
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
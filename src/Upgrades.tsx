import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import upgrades from './upgrades.json';

import { type Upgrade, usePlayerStore } from './stores/player';
import { memo, useEffect, useState } from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default memo(function UpgradesComponent() {
    const playerStore = usePlayerStore();

    const [selectedUpgradeKey, setSelectedUpgradeKey] = useState<string | null>(null);
    const [cantAffordDialogOpen, setCantAffordDialogOpen] = useState(false);

    const handleUpgradeClick = (key: string) => {
        setSelectedUpgradeKey((prev) => prev === key ? null : key);
    };

    const handlePurchaseUpgrade = (key: string) => {
        const upgrade = upgrades[key] as Upgrade;

        if (playerStore.player.money < upgrade.cost) {
            setCantAffordDialogOpen(true);
            return;
        }
        playerStore.purchaseUpgrade(key, upgrade.cost);
    };

    const handleCantAffordDialogClose = () => {
        setCantAffordDialogOpen(false);
    };

    useEffect(() => {
        console.log(selectedUpgradeKey);
    }, [selectedUpgradeKey]);

    const PurchaseButton = memo(({ upgradeKey }: { upgradeKey: string }) => {
        
        return (
            <Button variant="contained" color="primary" disabled={playerStore.purchasedUpgrades.includes(upgradeKey)} onClick={() => handlePurchaseUpgrade(upgradeKey)}>
                {playerStore.purchasedUpgrades.includes(upgradeKey) ? 'Purchased' : 'Purchase'}
            </Button>
        );
    });

    return (
        <>
            <div
                className="card"
                style={{ flex: 1, minHeight: 0, boxSizing: 'border-box' }}
            >
                <Grid container spacing={2} sx={{ height: '100%' }}>
                    <Grid size={2} sx={{ height: '100%' }}>
                        <Card sx={{ height: '100%' }} className="background">
                            <CardHeader title="Upgrades" />
                            <CardContent>
                                <MenuList>
                                {Object.keys(upgrades).map((key) => 
                                    <MenuItem key={key} onClick={() => handleUpgradeClick(key)}>
                                        <ListItemText primary={upgrades[key].name} />
                                    </MenuItem>
                                )}
                                </MenuList>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={10} sx={{ height: '100%' }}>
                        <Card sx={{ height: '100%' }} className="background">
                            <CardHeader title="Description" />
                            <CardContent>
                                {selectedUpgradeKey && (
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell sx={{ width: '100%' }}>{upgrades[selectedUpgradeKey].name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Description</TableCell>
                                                <TableCell sx={{ width: '100%' }}>{upgrades[selectedUpgradeKey].description}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Cost</TableCell>
                                                <TableCell sx={{ width: '100%' }}>${upgrades[selectedUpgradeKey].cost}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Tags</TableCell>
                                                <TableCell sx={{ width: '100%' }}>{upgrades[selectedUpgradeKey].tags.join(', ')}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={2}>
                                                    <PurchaseButton upgradeKey={selectedUpgradeKey} />
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
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

        </>
    );
});

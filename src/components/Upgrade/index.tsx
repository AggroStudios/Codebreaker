import { IUpgradeItem } from '../../lib/upgrades';
import { memo, useEffect, useState } from 'react';
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

export default memo(function Upgrade(props: { upgrade: IUpgradeItem }) {
    const { upgrade } = props;
    const playerStore = usePlayerStore();

    const [isOwned, setIsOwned] = useState(false);

    useEffect(() => {
        if (playerStore.purchasedUpgrades.includes(upgrade.key)) {
            setIsOwned(true);
        }
    }, [playerStore.purchasedUpgrades]);

    return (
        <Card className={clsx('upgrade', !isOwned && 'disabled')}>
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
                    isOwned && <Chip label="Owned" className="owned" />
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
                    <span className="upgrade-cost">${formatMoney(upgrade.cost, 0)}</span>
                    <Button className="button-purchase" variant="contained" color="primary">Purchase</Button>
                </div>
            </CardActions>
        </Card>
    );
}); 
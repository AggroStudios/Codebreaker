import PageHeader from '../../components/common/PageHeader';
import { Chip, Grid } from '@mui/material';
import { HubOutlined, PublicTwoTone } from '@mui/icons-material';

import { darkWebFactions } from '../../data/darkWebFactions';

import './style.scss';
import DarkWebCard from '../../components/DarkWebCard';
import { ReputationTiers } from '../../includes/DarkWeb.interface';
import { ICipherType } from '../../includes/Cipher.interface';

export default function DarkWeb() {

    const onlineFactions = (darkWebFactions.filter((faction) => faction.online) ?? []).length;
    const sortedFactions = darkWebFactions.sort((a, b) => 
        Object.keys(ReputationTiers).indexOf(b.reputation?.reputationTier ?? ReputationTiers.Unknown) - Object.keys(ReputationTiers).indexOf(a.reputation?.reputationTier ?? ReputationTiers.Unknown) ||
        (b.reputation?.reputation ?? 0) - (a.reputation?.reputation ?? 0)
    );

    const handleSellCipher = (factionId: string, cipher: ICipherType, quantityToSell: number, payout: number) => {
        const faction = darkWebFactions.find((faction) => faction.id === factionId);
        console.log('Sell cipher to faction', faction.name);
        console.log(cipher, quantityToSell, payout);
    }

    const handleMessage = (factionId: string) => {
        const faction = darkWebFactions.find((faction) => faction.id === factionId);
        console.log('Message faction', faction.name);
    }

    return (
        <>
            <PageHeader
                className="dark-web-header"
                title="Dark Web"
                subtitle="Move broken ciphers to anonymous buyers. Build reputation with each group to unlock better rates and exclusive contracts."
                breadcrumbs={['home', 'dark_web']}
                actions={
                    <div className="chips">
                        <Chip label="ONION ROUTED" size="small" variant="outlined" className="accent" style={{ marginRight: 6 }} icon={<span className="live-dot" />} />
                        <Chip label={onlineFactions + ' GROUP' + (onlineFactions > 1 ? 'S' : '') + ' ONLINE'} variant="outlined" className="cyan" icon={<HubOutlined fontSize="small" />} />
                    </div>
                }
                icon={PublicTwoTone}
            />
            <Grid container spacing={2} className="dark-web-container">
                {sortedFactions.map((faction) => (
                    <DarkWebCard key={faction.id} faction={faction} onSellCipher={handleSellCipher} onMessage={handleMessage} />
                ))}
            </Grid>
        </>
    );
}

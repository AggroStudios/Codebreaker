import { Card, Typography, CardContent, Grid, Avatar, SvgIconTypeMap, Chip, Box, Button } from '@mui/material';
import { IDarkWebFaction, ReputationTiers, RiskTier } from '../../includes/DarkWeb.interface';
import './style.scss';
import GlyphCardHeader from '../common/GlyphCardHeader';
import { ForumOutlined, GppGoodOutlined, LocalOfferOutlined, SendOutlined, ShieldOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import clsx from 'clsx';
import { OfferCipher, ReputationProgress } from './components';
import { Stat } from '../common/Stat';
import { useEffect, useState } from 'react';
import { ICipherType } from '../../includes/Cipher.interface';

const DarkWebChipIcon: Record<RiskTier, OverridableComponent<SvgIconTypeMap<object, 'svg'>>> = {
    [RiskTier.low]: GppGoodOutlined,
    [RiskTier.medium]: ShieldOutlined,
    [RiskTier.high]: WarningAmberOutlined,
};

const DarkWebChipLabel: Record<RiskTier, string> = {
    [RiskTier.low]: 'low risk',
    [RiskTier.medium]: 'med risk',
    [RiskTier.high]: 'high risk',
};

export interface IDarkWebCardProps {
    faction: Partial<IDarkWebFaction>;
    onSellCipher: (factionId: string, cipher: ICipherType, quantityToSell: number, payout: number) => void;
    onMessage: (factionId: string) => void;
}

export default function DarkWebCard(props: IDarkWebCardProps) {
    const ChipIcon = DarkWebChipIcon[props.faction.riskTier];
    const ChipLabel = DarkWebChipLabel[props.faction.riskTier];

    const [selectedCipher, setSelectedCipher] = useState<ICipherType | null>(null);
    const [bonusRate, setBonusRate] = useState<number | null>(null);
    const [quantityToSell, setQuantityToSell] = useState<number | null>(null);
    const [payout, setPayout] = useState<number | null>(null);

    useEffect(() => {
        if (selectedCipher) {
            const foundBonus = props.faction.bonus?.find((b) => b.cipher.name === selectedCipher.name);
            setBonusRate(foundBonus ? foundBonus.multiplier : null);
        }
    }, [selectedCipher])

    const nextReputationTier = ReputationTiers[Object.keys(ReputationTiers)[Object.keys(ReputationTiers).indexOf(props.faction.reputation?.reputationTier ?? ReputationTiers.Unknown) + 1]];

    const handleSelectCipher = (cipher: ICipherType, quantityToSell: number, payout: number) => {
        setSelectedCipher(cipher);
        setQuantityToSell(quantityToSell);
        setPayout(payout);
    }

    const handleSellCipher = () => {
        props.onSellCipher(props.faction.id, selectedCipher, quantityToSell, payout);
    }

    const handleMessage = () => {
        props.onMessage(props.faction.id);
    }

    return (
        <Grid size={{sm: 12, lg: 6, xl: 4}} key={props.faction.id}>
            <Card className="dark-web-card background">
                <GlyphCardHeader
                    className={props.faction.color.className}
                    title={props.faction.name}
                    subheader={`${props.faction.handle} · ${props.faction.region}`}
                    glyphColor={props.faction.color.color}
                    online={props.faction.online}
                    avatar={
                        <Avatar variant="rounded" className={props.faction.color.className}>
                            <props.faction.glyph />
                        </Avatar>
                    }
                    action={
                        <Chip className={clsx('dark-web-chip', props.faction.riskTier.toLowerCase())} label={ChipLabel} size="small" variant="outlined" avatar={
                            <ChipIcon className={clsx('dark-web-chip-icon', props.faction.riskTier.toLowerCase())} />
                        } />
                    }
                />
                <CardContent>
                    <Typography variant="body1" className="dark-web-card-blurb">{props.faction.blurb}</Typography>
                    <ReputationProgress currentBracket={props.faction.reputation?.reputationTier ?? ReputationTiers.Unknown} nextBracket={nextReputationTier} currentValue={props.faction.reputation?.reputation ?? 0} totalValue={10000} color={props.faction.color.className} />
                    <Box className="dark-web-card-stats">
                        <Stat label="Rate" value={'×' + (bonusRate ? bonusRate.toFixed(2) : '1.00')} accent={props.faction.color.className} />
                        <Stat label="Deals" value={props.faction.bonus?.length?.toString() ?? '0'} />
                        <Stat label="Bonus" value={bonusRate ? 'Active' : 'None'} accent={bonusRate ? 'income' : undefined} />
                    </Box>
                    <Box className="dark-web-card-offer-cipher-container">
                        <Typography variant="body2" className="dark-web-card-offer-cipher-title"><LocalOfferOutlined className={clsx('dark-web-card-offer-cipher-icon', props.faction.color.className)} />Offer Cipher</Typography>
                        <OfferCipher accent={props.faction.color.className} ciphers={props.faction.acceptedCiphers} bonuses={props.faction.bonus} onSelect={handleSelectCipher} />
                    </Box>
                    <Box className="dark-web-card-footer-container">
                        <Button variant="text" disabled={!props.faction.online} color="primary" className="dark-web-card-footer-button" onClick={handleMessage}><ForumOutlined />Message</Button>
                        <Button variant="contained" disabled={!selectedCipher || quantityToSell <= 0} color="primary" className="dark-web-card-footer-button" onClick={handleSellCipher}><SendOutlined />Sell</Button>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}

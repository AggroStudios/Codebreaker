import { Card, Typography, CardContent, Grid, Avatar, SvgIconTypeMap, Chip, Box, Button } from '@mui/material';
import { IDarkWebFaction, ReputationTiers, RiskTier } from '../../../includes/DarkWeb.interface';
import './style.scss';
import GlyphCardHeader from '../GlyphCardHeader';
import { ForumOutlined, GppGoodOutlined, LocalOfferOutlined, SendOutlined, ShieldOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import clsx from 'clsx';
import { OfferCipher, ReputationProgress, SellQuantity } from './components';
import { Stat } from '../Stat';
import { useEffect, useState } from 'react';
import { ICipherType } from '../../../includes/Cipher.interface';
import { formatMoney } from '../../../lib/utils';

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

export default function DarkWebCard(props: IDarkWebFaction) {
    const ChipIcon = DarkWebChipIcon[props.riskTier];
    const ChipLabel = DarkWebChipLabel[props.riskTier];

    const [selectedCipher, setSelectedCipher] = useState<ICipherType | null>(null);
    const [available, setAvailable] = useState<number | null>(null);
    const [quantityToSell, setQuantityToSell] = useState<number | null>(null);
    const [bonusRate, setBonusRate] = useState<number | null>(null);

    useEffect(() => {
        if (selectedCipher) {
            const foundBonus = props.bonus?.find((b) => b.cipher.name === selectedCipher.name);
            setBonusRate(foundBonus ? foundBonus.multiplier : null);
        }
    }, [selectedCipher])

    const nextReputationTier = ReputationTiers[Object.keys(ReputationTiers)[Object.keys(ReputationTiers).indexOf(props.reputationTier) + 1]];

    const handleSelectCipher = (cipher: ICipherType, available: number) => {
        setSelectedCipher(cipher);
        setAvailable(available);
    }

    const handleChangeQuantity = (quantity: number) => {
        setQuantityToSell(quantity);
    }

    return (
        <Grid size={{sm: 12, lg: 6, xl: 4}} key={props.id}>
            <Card className="dark-web-card">
                <GlyphCardHeader
                    className={props.color.className}
                    title={props.name}
                    subheader={props.handle}
                    glyphColor={props.color.color}
                    online={props.online}
                    avatar={
                        <Avatar variant="rounded" className={props.color.className}>
                            <props.glyph />
                        </Avatar>
                    }
                    action={
                        <Chip className={clsx('dark-web-chip', props.riskTier.toLowerCase())} label={ChipLabel} size="small" variant="outlined" avatar={
                            <ChipIcon className={clsx('dark-web-chip-icon', props.riskTier.toLowerCase())} />
                        } />
                    }
                />
                <CardContent>
                    <Typography variant="body1" className="dark-web-card-blurb">{props.blurb}</Typography>
                    <ReputationProgress currentBracket={props.reputationTier} nextBracket={nextReputationTier} currentValue={props.reputation} totalValue={10000} color={props.color.className} />
                    <Box className="dark-web-card-stats">
                        <Stat label="Rate" value={'×' + (bonusRate ? bonusRate.toFixed(2) : '1.00')} accent={props.color.className} />
                        <Stat label="Deals" value={props.bonus?.length?.toString() ?? '0'} />
                        <Stat label="Bonus" value={bonusRate ? 'Active' : 'None'} accent={bonusRate ? 'income' : undefined} />
                    </Box>
                    <Box className="dark-web-card-offer-cipher-container">
                        <Typography variant="body2" className="dark-web-card-offer-cipher-title"><LocalOfferOutlined className={clsx('dark-web-card-offer-cipher-icon', props.color.className)} />Offer Cipher</Typography>
                        <OfferCipher accent={props.color.className} ciphers={props.acceptedCiphers} bonuses={props.bonus} onSelect={handleSelectCipher} />
                        <SellQuantity available={available} onChange={handleChangeQuantity} />
                        <Box className="dark-web-card-sell-payout-container">
                            <Box>
                                <span className="dark-web-card-sell-payout-label">Payout</span>
                                <span className={clsx('dark-web-card-sell-payout-value', selectedCipher && quantityToSell > 0 ? 'income' : undefined)}>${formatMoney((selectedCipher ? selectedCipher.payout * (bonusRate ?? 1) * (quantityToSell ?? 1) : 0))}</span>
                            </Box>
                            <Box className="dark-web-card-sell-payout-xp-container">
                                <span>+36 XP</span>
                                <span>{selectedCipher && `$${(selectedCipher ? selectedCipher.payout * (bonusRate ?? 1) : 0)} each`}</span>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="dark-web-card-footer-container">
                        <Box><Button variant="text" disabled={!props.online} color="primary" className="dark-web-card-footer-button"><ForumOutlined />Message</Button></Box>
                        <Box><Button variant="contained" disabled={!selectedCipher || quantityToSell <= 0} color="primary" className="dark-web-card-footer-button"><SendOutlined />Sell</Button></Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}

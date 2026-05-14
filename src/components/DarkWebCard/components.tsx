import { Box, Button, IconButton, LinearProgress, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import clsx from 'clsx';
import { ICipherType } from '../../includes/Cipher.interface';
import { useEffect, useState } from 'react';
import { useStationState } from '../../stores/stationContext';
import { formatMoney } from '../../lib/utils';
import { Add, Remove } from '@mui/icons-material';
import { FactionBonus } from '../../includes/DarkWeb.interface';

interface ReputationProgressProps {
    currentBracket: string;
    nextBracket: string;
    currentValue: number;
    totalValue: number;
    color: string;
}

const SHIMMER_DURATION_MS = 5000;

interface OfferCipherProps {
    ciphers: ICipherType[];
    accent?: string;
    bonuses?: FactionBonus[];
    onSelect: (cipher: ICipherType, quantityToSell: number, payout: number) => void;
}

export function ReputationProgress({
    currentBracket,
    nextBracket,
    currentValue,
    totalValue,
    color,
}: ReputationProgressProps) {
    const percent = totalValue > 0 ? Math.min(100, (currentValue / totalValue) * 100) : 0;
    const remaining = Math.max(0, totalValue - currentValue);

    return (
        <Box className="dark-web-card-reputation-container">
            <Box className="dark-web-card-reputation-header">
                <span className="dark-web-card-reputation-label">
                    Reputation · <span className="dark-web-card-reputation-bracket">{currentBracket}</span>
                </span>
                <span className={clsx('dark-web-card-reputation-value', color)}>
                    {currentValue.toLocaleString()} / {totalValue.toLocaleString()}
                </span>
            </Box>
            <LinearProgress
                className={clsx('reputation-progress-bar', color)}
                variant="determinate"
                value={percent}
                style={{
                    '--progress': `${percent}%`,
                    '--shimmer-delay': `-${Date.now() % SHIMMER_DURATION_MS}ms`,
                } as Record<string, string>}
            />
            <Box className="dark-web-card-reputation-footer">
                <span className="dark-web-card-reputation-next-bracket">
                    {remaining.toLocaleString()} XP to {nextBracket}
                </span>
            </Box>
        </Box>
    );
}

export function OfferCipher(props: OfferCipherProps) {
    const [selectedCipher, setSelectedCipher] = useState<ICipherType | null>(null);
    const [foundCiphers, setFoundCiphers] = useState<Record<string, number> | null>(null);
    const [available, setAvailable] = useState<number | null>(null);
    const [quantityToSell, setQuantityToSell] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(0);
    const [bonusRate, setBonusRate] = useState<number | null>(null);
    const operatingSystem = useStationState((s) => s.os);

    useEffect(() => {
        
        const ciphersToFind = props.ciphers.map((c) => c.name.replaceAll(' ', '-').toLowerCase());
        const foundCiphers = (operatingSystem?.storedFiles.filter((f) => ciphersToFind.includes(f.path)) ?? []).reduce((acc, curr) => {
            acc[curr.path] = (acc[curr.path] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        setFoundCiphers(foundCiphers);
    }, [operatingSystem?.storedFiles]);
    
    useEffect(() => {
        if (selectedCipher) {
            const availableCiphers = foundCiphers?.[selectedCipher.name.replaceAll(' ', '-').toLowerCase()] ?? 0;
            setAvailable(availableCiphers);
            if (availableCiphers > 0) {
                setQuantity(1);
            } else {
                setQuantity(0);
            }
            const foundBonus = props.bonuses?.find((b) => b.cipher.name === selectedCipher.name);
            setBonusRate(foundBonus ? foundBonus.multiplier : null);
        }
    }, [selectedCipher])

    useEffect(() => {
        setQuantityToSell(quantity);
    }, [quantity])

    useEffect(() => {
        if (selectedCipher) {
            const payout = selectedCipher.payout * (bonusRate ?? 1) * (quantityToSell ?? 1);
            props.onSelect(selectedCipher, quantityToSell, payout);
        }
    }, [selectedCipher, quantityToSell])

    return (
        <>
            <Select
                variant="filled"
                disableUnderline={false}
                displayEmpty
                className={clsx('dark-web-card-offer-cipher-select', props.accent)}
                value={selectedCipher?.name ?? ''}
                renderValue={(value) =>
                    value
                        ? `${(value as string)} · ${foundCiphers?.[(value as string).replaceAll(' ', '-').toLowerCase()] ?? 0} in stock`
                        : <span className="dark-web-card-offer-cipher-placeholder">Select cipher type...</span>
                }
                onChange={(event: SelectChangeEvent<string>) => setSelectedCipher(props.ciphers.find((c) => c.name === event.target.value) ?? null)}
            >
                {props.ciphers.map((cipher) => {
                    return (
                        <MenuItem
                            key={cipher.name}
                            value={cipher.name}
                            className={clsx('dark-web-card-offer-cipher-menu-item', props.accent)}
                        >
                            <Box className="dark-web-card-offer-cipher-menu-item-content">  
                                <span className="dark-web-card-offer-cipher-menu-item-name">{cipher.name} · {foundCiphers?.[cipher.name.replaceAll(' ', '-').toLowerCase()] ?? 0} in stock</span>
                                <span className="dark-web-card-offer-cipher-menu-item-price">{props.bonuses?.find((b) => b.cipher.name === cipher.name) ? '(DEAL)' : ''} ${formatMoney(cipher.payout * (props.bonuses?.find((b) => b.cipher.name === cipher.name)?.multiplier ?? 1))}</span>
                            </Box>
                        </MenuItem>
                    );
                })}
            </Select>
            <Box className="dark-web-card-sell-quantity-container">
                <span className="dark-web-card-sell-quantity-label">QTY</span>
                <Box className="dark-web-card-sell-quantity-input-container">
                    <IconButton 
                        className="dark-web-card-sell-quantity-icon-button"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity(Math.max(0, quantity - 1))}
                    >
                        <Remove />
                    </IconButton>
                    <span className="dark-web-card-sell-quantity-input-value">{quantity}</span>
                    <IconButton 
                        className="dark-web-card-sell-quantity-icon-button"
                        disabled={quantity >= available}
                        onClick={() => setQuantity(Math.min(available, quantity + 1))}
                    >
                        <Add />
                    </IconButton>
                    <Button variant="outlined" className="dark-web-card-sell-quantity-input-button" disabled={available <= 0 || quantity >= available} onClick={() => setQuantity(available)}>MAX</Button>
                </Box>
            </Box>
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
        </>
    );
}
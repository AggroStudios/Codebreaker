import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    InputAdornment,
    Slider,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import {
    CheckCircleOutlined,
    LocalOfferOutlined,
    Search,
    Tune,
} from '@mui/icons-material';
import clsx from 'clsx';

import './style.scss';
import {
    Server,
    ServerFormFactor,
    ServerFormFactorsArray,
    ServerFormFactorRecord,
    ServerTier,
    ServerTierRecord,
    ServerTiersArray,
} from '../../includes/Servers.interface';

type TierFilterRow = Omit<ServerTierRecord, 'id'> & { id: ServerTier | undefined };
type FormFactorFilterRow = Omit<ServerFormFactorRecord, 'id'> & {
    id: ServerFormFactor | undefined;
};

const ACCENT = 'var(--accent)';

function formatPriceCompact(value: number) {
    if (value >= 1000) {
        const k = value / 1000;
        const rounded = Number.isInteger(k) ? k : Math.round(k);
        return `$${rounded}K`;
    }
    return `$${value.toLocaleString()}`;
}

function formatPriceFull(value: number) {
    return `$${value.toLocaleString()}`;
}

export interface ServerFilters {
    search?: string;
    tierId?: ServerTier;
    formFactor?: ServerFormFactor;
    maxPrice?: number;
    onSaleOnly?: boolean;
    affordableOnly?: boolean;
}

export interface ServerFiltersProps {
    servers: Server[];
    className?: string;
    priceRange: ServerPriceMinMax;
    onChange: (filters: ServerFilters) => void;
}

export interface ServerPriceMinMax {
    min: number;
    max: number;
}

export default function ServerFilters({ servers, className, priceRange, onChange }: ServerFiltersProps) {
    const [search, setSearch] = useState<string>('');
    const [tierId, setTierId] = useState<ServerTier | undefined>(undefined);
    const [formFactor, setFormFactor] = useState<ServerFormFactor | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
    const [affordableOnly, setAffordableOnly] = useState<boolean>(false);
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    const serverTiersArray = useMemo((): TierFilterRow[] => {
        const pool = servers;
        return [
            { id: undefined, label: 'All', count: pool.length, swatch: '#ffffff' },
            ...ServerTiersArray.map((row) => ({
                ...row,
                count: pool.filter((server) => server.tier === row.id).length,
            })),
        ];
    }, [servers]);

    const formFactorsArray = useMemo((): FormFactorFilterRow[] => [
        { id: undefined, label: 'All' },
        ...ServerFormFactorsArray,
    ], []);

    const sliderValue = useMemo(() =>
        maxPrice === undefined
            ? priceRange.max
            : Math.min(priceRange.max, Math.max(priceRange.min, maxPrice)),
    [maxPrice]);

    const handleClear = () => {
        setSearch('');
        setDebouncedSearch('');
        setTierId(undefined);
        setFormFactor(undefined);
        setMaxPrice(undefined);
        setOnSaleOnly(false);
        setAffordableOnly(false);
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [search]);

    useEffect(() => {
        onChange({
            search: debouncedSearch,
            tierId,
            formFactor,
            maxPrice,
            onSaleOnly,
            affordableOnly,
        });
    }, [debouncedSearch, tierId, formFactor, maxPrice, onSaleOnly, affordableOnly]);

    return (
        <Card className={clsx('server-filters', className)} elevation={0}>
            <CardContent>
                <Box className="server-filters__header">
                    <Tune className="server-filters__header-icon" />
                    <Typography component="span" className="server-filters__title">
                        FILTERS
                    </Typography>
                </Box>

                <Box>
                    <Typography component="label" className="server-filters__section-label">
                        SEARCH
                    </Typography>
                    <TextField
                        className="server-filters__search"
                        placeholder="SKU or CPU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        fullWidth
                        variant="standard"
                        name="server-search"
                        autoComplete="off"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search
                                            sx={{
                                                color: 'var(--fg-secondary)',
                                                fontSize: 20,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                            // Keep password managers (LastPass, 1Password, Dashlane,
                            // Chrome autofill) off this plain search field.
                            htmlInput: {
                                'data-lpignore': 'true',
                                'data-1p-ignore': 'true',
                                'data-form-type': 'other',
                                'data-bwignore': 'true',
                                autoComplete: 'off',
                                autoCorrect: 'off',
                                autoCapitalize: 'off',
                                spellCheck: false,
                            },
                        }}
                    />
                </Box>

                <Box>
                    <Typography component="span" className="server-filters__section-label">
                        TIER
                    </Typography>
                    <Box className="server-filters__tier-list" role="list">
                        {serverTiersArray.map((row) => {
                            const selected = tierId === row.id;
                            return (
                                <Button
                                    type="button"
                                    key={row.id ?? 'all-tiers'}
                                    role="listitem"
                                    color="inherit"
                                    className={clsx(
                                        'server-filters__tier-row',
                                        selected && 'server-filters__tier-row--selected',
                                    )}
                                    onClick={() => setTierId(row.id)}
                                    disableRipple
                                >
                                    <span className="server-filters__tier-left">
                                        <span
                                            className="server-filters__tier-swatch"
                                            style={{ backgroundColor: row.swatch }}
                                            aria-hidden
                                        />
                                        {row.label}
                                    </span>
                                    <span className="server-filters__tier-count">{row.count}</span>
                                </Button>
                            );
                        })}
                    </Box>
                </Box>

                <Box>
                    <Typography component="span" className="server-filters__section-label">
                        FORM FACTOR
                    </Typography>
                    <Box className="server-filters__chips">
                        {formFactorsArray.map((label) => {
                            const active = formFactor === label.id as ServerFormFactor;
                            return (
                                <Chip
                                    key={label.id ?? 'all-form'}
                                    label={label.label}
                                    size="small"
                                    className={clsx(
                                        'server-filters__chip',
                                        active && 'server-filters__chip--active',
                                    )}
                                    onClick={() => setFormFactor(label.id)}
                                    variant="outlined"
                                />
                            );
                        })}
                    </Box>
                </Box>

                <Box>
                    <Typography component="span" className="server-filters__section-label">
                        MAX PRICE — {formatPriceFull(sliderValue)}
                    </Typography>
                    <Slider
                        className="server-filters__slider"
                        value={sliderValue}
                        onChange={(_, v) => setMaxPrice(Array.isArray(v) ? v[0] : v)}
                        min={priceRange.min}
                        max={priceRange.max}
                        step={1000}
                        sx={{
                            color: ACCENT,
                            height: 4,
                            '& .MuiSlider-thumb': {
                                backgroundColor: ACCENT,
                            },
                            '& .MuiSlider-track': {
                                backgroundColor: ACCENT,
                                border: 'none',
                            },
                        }}
                    />
                    <Box className="server-filters__slider-labels">
                        <span>{formatPriceCompact(priceRange.min)}</span>
                        <span>{formatPriceCompact(priceRange.max)}</span>
                    </Box>
                </Box>

                <Box>
                    <Typography component="span" className="server-filters__section-label">
                        QUICK TOGGLES
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                        }}
                    >
                        <Box className="server-filters__toggle-row">
                            <Switch
                                size="small"
                                checked={onSaleOnly}
                                onChange={(_, c) => setOnSaleOnly(c)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: ACCENT,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: 'rgba(10, 245, 176, 0.5)',
                                    },
                                }}
                            />
                            <LocalOfferOutlined className="server-filters__toggle-icon" />
                            <Typography className="server-filters__toggle-label">
                                On Sale Only
                            </Typography>
                        </Box>
                        <Box className="server-filters__toggle-row">
                            <Switch
                                size="small"
                                checked={affordableOnly}
                                onChange={(_, c) => setAffordableOnly(c)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: ACCENT,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: 'rgba(10, 245, 176, 0.5)',
                                    },
                                }}
                            />
                            <CheckCircleOutlined className="server-filters__toggle-icon" />
                            <Typography className="server-filters__toggle-label">
                                Affordable Only
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Button
                    type="button"
                    className="server-filters__clear"
                    variant="outlined"
                    fullWidth
                    onClick={handleClear}
                >
                    CLEAR FILTERS
                </Button>
            </CardContent>
        </Card>
    );
}

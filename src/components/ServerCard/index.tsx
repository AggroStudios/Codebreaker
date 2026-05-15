import { Box, Button, Card, Chip, IconButton, Typography } from '@mui/material';
import {
    BoltOutlined,
    CompareArrowsOutlined,
    DeveloperBoardOutlined,
    Favorite,
    FavoriteBorderOutlined,
    HubOutlined,
    LockOutlined,
    MemoryOutlined,
    ShoppingCartOutlined,
    StorageOutlined,
} from '@mui/icons-material';
import clsx from 'clsx';

import { Server, ServerTier, ServerTiers } from '../../includes/Servers.interface';
import { formatMoney } from '../../lib/utils';

import './style.scss';

const TIER_CLASS: Record<ServerTier, string> = {
    [ServerTier.ENTRY]: 'tier-1',
    [ServerTier.STANDARD]: 'tier-2',
    [ServerTier.PRO]: 'tier-3',
    [ServerTier.ENTERPRISE]: 'tier-4',
    [ServerTier.QUANTUM]: 'tier-5',
};

export interface ServerCardProps {
    server: Server;
    /** Logical CPU thread count when distinct from physical cores. Falls back to `server.cpu.cores`. */
    threads?: number;
    /** Mining-style hashrate in MH/s, displayed as a corner badge over the image. */
    hashrate?: number;
    /** Sub-label that follows the form factor, e.g. `Edge`, `Rack`, `Storage`, `HPC`. */
    classLabel?: string;
    /** Image asset for the server hero artwork. */
    imageSrc?: string;
    /** Pre-formatted network label override (e.g. `10 Gbps`). When omitted, derived from `server.network`. */
    networkLabel?: string;
    /** Pre-formatted storage label override (e.g. `0.5 TB SSD`). When omitted, derived from `server.storage`. */
    storageLabel?: string;
    /** Apply a percent discount to `server.price`. The original price is shown struck-through. */
    discount?: number;
    /** Quantity of this server already owned by the player. Hidden when `0`/undefined. */
    owned?: number;
    /** Render the card in a locked state (greyed out, "Locked" CTA, no glow). */
    locked?: boolean;
    /** Whether the favorite/heart toggle is currently active. */
    favorite?: boolean;
    onBuy?: (server: Server) => void;
    onCompare?: (server: Server) => void;
    onFavoriteToggle?: (server: Server) => void;
    className?: string;
}

const formatStorage = (totalGb: number, type: string) => {
    let label: string;
    if (totalGb >= 1000) {
        const tb = totalGb / 1000;
        label = `${Number.isInteger(tb) ? tb : tb.toFixed(1)} TB`;
    } else if (totalGb >= 1) {
        label = `${totalGb} GB`;
    } else {
        label = `${totalGb * 1000} MB`;
    }
    return `${label} ${type.toUpperCase()}`;
};

const formatNetwork = (kbps: number) => {
    const gbps = kbps / 1_000_000;
    if (gbps >= 1000) return `${(gbps / 1000).toFixed(0)} Tbps`;
    if (gbps >= 1) return `${Number.isInteger(gbps) ? gbps : gbps.toFixed(1)} Gbps`;
    return `${(kbps / 1000).toFixed(0)} Mbps`;
};

const formatHashrate = (mhs: number) => {
    if (mhs >= 1_000_000) return `${(mhs / 1_000_000).toFixed(2).replace(/\.?0+$/, '')} TH/s`;
    if (mhs >= 1_000) return `${(mhs / 1_000).toFixed(2).replace(/\.?0+$/, '')} GH/s`;
    return `${mhs} MH/s`;
};

export default function ServerCard(props: ServerCardProps) {
    const { server } = props;
    const tierClass = TIER_CLASS[server.tier];
    const tierBadge = `${ServerTiers[server.tier]} · ${server.tier.toUpperCase()}`;

    const cpuCores = (server.cpu.cores ?? 0) * server.cpuAmount;
    const cpuThreads = cpuCores * server.threadingFactor;

    const totalStorageGb = (server.storage ?? []).reduce((sum, s) => sum + (s?.capacity ?? 0), 0);
    const storageType = server.storage?.[0]?.type?.toString() ?? 'SSD';
    const storageLabel = props.storageLabel ?? formatStorage(totalStorageGb, storageType);

    const networkSpeed = server.network.network.speedInBps * server.networkPorts;
    const networkLabel = props.networkLabel ?? formatNetwork(networkSpeed);

    const originalPrice = server.price ?? 0;
    const onSale = !!server.discount && server.discount > 0;
    const salePrice = onSale ? originalPrice * (1 - (server.discount / 100)) : originalPrice;

    const isFavorite = !!props.favorite;
    const isOwned = !!props.owned && props.owned > 0;
    const isLocked = !!props.locked;

    const handleBuy = () => {
        if (!isLocked) props.onBuy?.(server);
    };
    const handleCompare = () => props.onCompare?.(server);
    const handleFavorite = () => props.onFavoriteToggle?.(server);

    return (
        <Card
            className={clsx('server-card', tierClass, props.className, {
                'is-locked': isLocked,
                'is-owned': isOwned,
                'is-on-sale': onSale,
            })}
        >
            <Box className={clsx('server-card-glow', tierClass)} />

            <Box className="server-card-image-section">
                <Box className="server-card-top-row">
                    <Box className="server-card-tags">
                        <Chip className={clsx('server-card-tier-chip', tierClass)} label={tierBadge} size="small" />
                        {onSale && (
                            <Chip
                                className="server-card-tag-chip sale"
                                label={`SALE −${server.discount}%`}
                                size="small"
                            />
                        )}
                        {isOwned && (
                            <Chip
                                className="server-card-tag-chip owned"
                                label={`OWNED ×${props.owned}`}
                                size="small"
                            />
                        )}
                    </Box>
                    <Box className="server-card-actions-top">
                        <IconButton
                            className="server-card-icon-button"
                            size="small"
                            onClick={handleCompare}
                            aria-label="Compare server"
                        >
                            <CompareArrowsOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                            className={clsx('server-card-icon-button', { active: isFavorite })}
                            size="small"
                            onClick={handleFavorite}
                            aria-label={isFavorite ? 'Unfavorite server' : 'Favorite server'}
                        >
                            {isFavorite ? <Favorite fontSize="small" /> : <FavoriteBorderOutlined fontSize="small" />}
                        </IconButton>
                    </Box>
                </Box>

                {server.imageSrc && (
                    <Box className="server-card-image-container">
                        <img
                            className="server-card-image"
                            src={server.imageSrc}
                            alt={`${server.manufacturer} ${server.model}`}
                            draggable={false}
                        />
                        {server.manufacturerLogoSrc && (
                            <img
                                className="server-card-manufacturer-logo"
                                src={server.manufacturerLogoSrc}
                                alt={`${server.manufacturer} logo`}
                                draggable={false}
                            />
                        )}
                    </Box>
                )}

                {props.hashrate !== undefined && (
                    <Box className="server-card-hashrate">{formatHashrate(props.hashrate)}</Box>
                )}
            </Box>

            <Box className="server-card-body">
                <Typography className="server-card-eyebrow" component="div">
                    {server.manufacturer.toUpperCase()} · {server.formFactor}
                    {props.classLabel ? ` ${props.classLabel.toUpperCase()}` : ''}
                </Typography>
                <Typography className="server-card-model" component="div">
                    {server.model}
                </Typography>

                <Box className="server-card-specs">
                    <Box className="server-card-spec">
                        <MemoryOutlined className="server-card-spec-icon" />
                        <span>
                            {cpuCores}c / {cpuThreads}t
                        </span>
                    </Box>
                    <Box className="server-card-spec">
                        <DeveloperBoardOutlined className="server-card-spec-icon" />
                        <span>{server.memory?.capacity ?? 0} GB RAM</span>
                    </Box>
                    <Box className="server-card-spec">
                        <StorageOutlined className="server-card-spec-icon" />
                        <span>{storageLabel}</span>
                    </Box>
                    <Box className="server-card-spec">
                        <HubOutlined className="server-card-spec-icon" />
                        <span>{networkLabel}</span>
                    </Box>
                    <Box className="server-card-spec">
                        <BoltOutlined className="server-card-spec-icon" />
                        <span>{server.powerConsumption} W</span>
                    </Box>
                </Box>
            </Box>

            <Box className="server-card-footer">
                <Box className="server-card-price">
                    {onSale && (
                        <Typography className="server-card-price-original" component="span">
                            ${formatMoney(originalPrice, 0)}
                        </Typography>
                    )}
                    <Typography
                        className={clsx('server-card-price-current', { sale: onSale })}
                        component="span"
                    >
                        ${formatMoney(salePrice, 0)}
                    </Typography>
                </Box>
                {isLocked ? (
                    <Button
                        className="server-card-cta locked"
                        variant="contained"
                        disabled
                        startIcon={<LockOutlined />}
                    >
                        Locked
                    </Button>
                ) : (
                    <Button
                        className="server-card-cta"
                        variant="contained"
                        startIcon={<ShoppingCartOutlined />}
                        onClick={handleBuy}
                    >
                        Buy
                    </Button>
                )}
            </Box>
        </Card>
    );
}

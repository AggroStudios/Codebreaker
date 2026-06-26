import { Button, Chip, Typography } from '@mui/material';
import { Bolt, ShoppingCartOutlined, StarBorderOutlined } from '@mui/icons-material';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Server } from '../../includes/Servers.interface';
import { formatMoney } from '../../lib/utils';

import './style.scss';

export interface ServerDailyDealCardProps {
    server: Server;
    owned?: number;
    /** Percent off list price (e.g. `13` for 13% off). */
    discount: number;
    /** When the offer ends (ms or Date). Defaults to end of local calendar day. */
    dealEndsAt?: number | Date;
    onPurchase?: (server: Server) => void;
    className?: string;
}

function endOfLocalDay(): Date {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
}

function formatCountdown(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

const formatNetworkUplink = (kbps: number) => {
    const gbps = kbps / 1_000_000;
    if (gbps >= 1000) return `${(gbps / 1000).toFixed(0)} Tbps`;
    if (gbps >= 1) return `${Number.isInteger(gbps) ? gbps : gbps.toFixed(0)} Gbps`;
    return `${(kbps / 1000).toFixed(0)} Mbps`;
};

export default function ServerDailyDealCard({
    server,
    owned,
    discount,
    dealEndsAt,
    onPurchase,
    className,
}: ServerDailyDealCardProps) {
    const ends = useMemo(() => {
        if (dealEndsAt === undefined) return endOfLocalDay();
        return dealEndsAt instanceof Date ? dealEndsAt : new Date(dealEndsAt);
    }, [dealEndsAt]);

    const [secondsLeft, setSecondsLeft] = useState(() =>
        Math.max(0, Math.floor((ends.getTime() - Date.now()) / 1000)),
    );

    const tick = useCallback(() => {
        setSecondsLeft(Math.max(0, Math.floor((ends.getTime() - Date.now()) / 1000)));
    }, [ends]);

    useEffect(() => {
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [tick]);

    const listPrice = server.price ?? 0;
    const pct = Math.min(100, Math.max(0, discount));
    const salePrice = listPrice * (1 - pct / 100);

    const cpuCores = (server.cpu.cores ?? 0) * server.cpuAmount;
    const cpuThreads = cpuCores * server.threadingFactor;
    const memGb = server.memory?.capacity ?? 0;
    const networkSpeed = server.network.network.speedInBps * server.networkPorts;
    const uplinkLabel = formatNetworkUplink(networkSpeed);

    const specLine = useMemo(() => {
        const tierLine = `${server.tier}-tier compute`;
        return `${tierLine}. ${cpuCores} cores • ${cpuThreads} threads • ${memGb} GB RAM • ${server.cpuAmount}× processors • ${uplinkLabel} uplink.`;
    }, [cpuCores, cpuThreads, memGb, server.cpuAmount, server.tier, uplinkLabel]);

    const eyebrow = `${server.manufacturer.toUpperCase()} • ${server.tier.toUpperCase()}`;

    const tierClass = `tier-${server.tier.toLowerCase()}`;

    const isOwned = !!owned && owned > 0;

    return (
        <div className={clsx('server-daily-deal-card', tierClass, className)}>
            <div className="server-daily-deal-card__backdrop" aria-hidden />
            <div className="server-daily-deal-card__row">
                <div className="server-daily-deal-card__inner">
                    <div className="server-daily-deal-card__tags">
                        <div className={clsx('server-daily-deal-card__badge', tierClass)}>
                            <Bolt fontSize="small" />
                            <span>Deal of the day</span>
                            <span className="server-daily-deal-card__badge-sep">·</span>
                            <span className="server-daily-deal-card__badge-time">{formatCountdown(secondsLeft)} left</span>
                        </div>
                        {isOwned &&
                            <Chip
                                className={clsx('server-daily-deal-card__badge', 'tier-pro')}
                                label={`OWNED ×${owned}`}
                                size="small"
                            />
                        }
                    </div>
                    <div className="server-daily-deal-card__copy">
                        <Typography className={clsx('server-daily-deal-card__eyebrow', tierClass)} component="div">
                            {eyebrow}
                        </Typography>
                        <div className="server-daily-deal-card__title-row">
                            <Typography className="server-daily-deal-card__model" component="span">
                                {server.model}
                            </Typography>
                            <Typography className="server-daily-deal-card__form" component="span">
                                {server.formFactor}
                            </Typography>
                        </div>
                        <Typography className="server-daily-deal-card__specs" component="p">
                            {specLine}
                        </Typography>

                        <div className="server-daily-deal-card__pricing">
                            <span className="server-daily-deal-card__price-sale">${formatMoney(salePrice, 0)}</span>
                            <span className="server-daily-deal-card__price-list">${formatMoney(listPrice, 0)}</span>
                            <span className="server-daily-deal-card__discount-chip">−{Math.round(pct)}%</span>
                        </div>

                        <div className="server-daily-deal-card__actions">
                            <Button
                                variant="contained"
                                className="server-daily-deal-card__btn-purchase"
                                startIcon={<ShoppingCartOutlined />}
                                onClick={() => onPurchase?.(server)}
                            >
                                Purchase now
                            </Button>
                        </div>
                    </div>

                </div>

                <div className="server-daily-deal-card__visual">
                    <div className="server-daily-deal-card__featured">
                        <StarBorderOutlined fontSize="inherit" />
                        Featured
                    </div>
                    {server.imageSrc ? (
                        <div className="server-daily-deal-card__image-wrap">
                            <img
                                className="server-daily-deal-card__image"
                                src={server.imageSrc}
                                alt={`${server.manufacturer} ${server.model}`}
                                draggable={false}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

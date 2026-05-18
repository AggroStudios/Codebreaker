import { useEffect, useMemo, useState } from 'react';
import { Box, Button, InputBase, Typography } from '@mui/material';
import {
    CheckCircleTwoTone,
    KeyboardTwoTone,
    SellTwoTone,
    WarningTwoTone,
} from '@mui/icons-material';

import ServerModalShell from './ServerModalShell';
import ServerIdentityStrip from './ServerIdentityStrip';
import { Server } from '../../includes/Servers.interface';
import { formatMoney } from '../../lib/utils';
import { usePlayerStore } from '../../stores/player';
import { useServersStore } from '../../stores/servers';

const RED = '#f44336';

interface PayoutRowProps {
    label: string;
    value: string;
    color?: string;
    isNet?: boolean;
    glow?: boolean;
}

function PayoutRow({ label, value, color, isNet, glow }: PayoutRowProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                py: 1.25,
                borderBottom: isNet ? 'none' : '1px solid rgba(255,255,255,0.06)',
                borderTop: isNet ? '1px solid rgba(255,255,255,0.10)' : 'none',
                mt: isNet ? 0.5 : 0,
                gap: 1,
            }}
        >
            <Typography
                sx={{
                    fontSize: 12,
                    letterSpacing: isNet ? '0.14em' : '0.02em',
                    textTransform: isNet ? 'uppercase' : 'none',
                    fontWeight: isNet ? 600 : 400,
                    color: 'rgba(255,255,255,0.65)',
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: isNet ? 17 : 13,
                    fontWeight: isNet ? 700 : 500,
                    color: color ?? 'rgba(255,255,255,0.85)',
                    textShadow: glow ? '0 0 10px rgba(40,255,40,0.6)' : 'none',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

interface SellModalProps {
    open: boolean;
    onClose: () => void;
    server: Server;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function SellModal({ open, onClose, server }: SellModalProps) {
    const sellServer = useServersStore((s) => s.sellServer);
    const addMoney = usePlayerStore((s) => s.addMoney);

    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (open) setConfirmText('');
    }, [open, server.name]);

    const nickname = server.name ?? server.model;
    const match = confirmText.trim() === nickname;

    const { wearPct, wearAmount, salvage, fee, net } = useMemo(() => {
        const retail = server.price;
        const util = server.util ?? 0;
        const wearPct = clamp(util * 0.3 + 12, 8, 40);
        const wearAmount = Math.round((retail * wearPct) / 100);
        const salvage = Math.round(retail * (1 - wearPct / 100) * 0.6);
        const fee = Math.round(salvage * 0.08);
        const net = salvage - fee;
        return { wearPct, wearAmount, salvage, fee, net };
    }, [server.price, server.util]);

    const handleSell = () => {
        if (!match) return;
        addMoney(net);
        sellServer(server);
        onClose();
    };

    return (
        <ServerModalShell
            open={open}
            onClose={onClose}
            accent={RED}
            icon={SellTwoTone}
            eyebrow="List for Sale"
            title="Sell this node?"
            width={560}
            footer={
                <>
                    <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={!match}
                        onClick={handleSell}
                        startIcon={<SellTwoTone />}
                    >
                        Sell for ${formatMoney(net, 0)}
                    </Button>
                </>
            }
        >
            <ServerIdentityStrip server={server} />

            <Box
                sx={{
                    p: 1.75,
                    background: 'rgba(244,67,54,0.08)',
                    border: '1px solid rgba(244,67,54,0.30)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <WarningTwoTone sx={{ fontSize: 16, color: RED }} />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            color: RED,
                        }}
                    >
                        THIS ACTION CANNOT BE UNDONE
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                    Selling this node will <strong>permanently remove</strong> it from your fleet,
                    free its rack slot ({server.location ?? '—'}), and forfeit any in-flight cipher
                    cycles. Re-buying the same SKU is at retail price.
                </Typography>
            </Box>

            <Box
                sx={{
                    background: 'rgba(0,0,0,0.30)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    px: 1.75,
                    py: 0.5,
                }}
            >
                <PayoutRow label="Retail Price" value={`$${formatMoney(server.price, 0)}`} />
                <PayoutRow
                    label={`Wear & Tear (−${Math.round(wearPct)}%)`}
                    value={`−$${formatMoney(wearAmount, 0)}`}
                    color="#ff6464"
                />
                <PayoutRow
                    label="Resale Mult. (×0.60)"
                    value={`$${formatMoney(salvage, 0)}`}
                    color="rgba(255,255,255,0.6)"
                />
                <PayoutRow
                    label="Marketplace Fee (8%)"
                    value={`−$${formatMoney(fee, 0)}`}
                    color="#ff6464"
                />
                <PayoutRow
                    label="Net Payout"
                    value={`+ $${formatMoney(net, 0)}`}
                    color="#28ff28"
                    isNet
                    glow
                />
            </Box>

            <Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.55)',
                        mb: 0.75,
                    }}
                >
                    Type node name to confirm
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${match ? 'rgba(244,67,54,0.40)' : 'rgba(255,255,255,0.12)'}`,
                        borderBottom: `2px solid ${match ? RED : 'rgba(244,67,54,0.4)'}`,
                        borderRadius: '6px 6px 0 0',
                    }}
                >
                    <KeyboardTwoTone sx={{ fontSize: 18, color: 'rgba(255,255,255,0.55)' }} />
                    <InputBase
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 14,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            color: match ? RED : 'rgba(255,255,255,0.87)',
                        }}
                    />
                    {match && <CheckCircleTwoTone sx={{ fontSize: 18, color: '#0af5b0' }} />}
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.45)',
                        mt: 0.5,
                    }}
                >
                    Required: {nickname}
                </Typography>
            </Box>
        </ServerModalShell>
    );
}

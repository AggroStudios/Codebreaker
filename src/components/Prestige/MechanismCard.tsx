import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import {
    AutoAwesomeMotionTwoTone,
    InfoTwoTone,
    SettingsBackupRestoreTwoTone,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import { fmtNum } from '../../lib/utils';
import { initiatePrestige } from '../../lib/prestigeAction';
import { usePrestigeDerived } from './usePrestigeDerived';

interface BulletListProps {
    color: string;
    items: string[];
}

function BulletList({ color, items }: BulletListProps) {
    return (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map((it) => (
                <Box
                    key={it}
                    component="li"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.85)',
                    }}
                >
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: color,
                            boxShadow: `0 0 6px ${color}aa`,
                            flexShrink: 0,
                        }}
                    />
                    <span>{it}</span>
                </Box>
            ))}
        </Box>
    );
}

interface MechRowProps {
    tone: 'good' | 'bad';
    title: string;
    items: string[];
}

function MechRow({ tone, title, items }: MechRowProps) {
    const color = tone === 'good' ? '#0af5b0' : '#ff7676';
    return (
        <Box
            sx={{
                p: 1.75,
                borderRadius: '10px',
                border: `1px solid ${color}55`,
                background: `${color}0a`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
            }}
        >
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color,
                }}
            >
                {title}
            </Typography>
            <BulletList color={color} items={items} />
        </Box>
    );
}

export default function MechanismCard() {
    const { canPrestige, totalEarned, totalSpent, level, levelRequirement, xpPerPoint } =
        usePrestigeDerived();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const nextPP = Math.max(0, totalEarned - totalSpent);

    const handlePrestige = () => {
        if (!canPrestige) return;
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        setConfirmOpen(false);
        initiatePrestige();
    };

    return (
        <>
            <StationCard
                avatar={AutoAwesomeMotionTwoTone}
                accent={StationCardAccentType.ACCENT}
                title="The Prestige Mechanism"
                subheader="WHAT YOU GAIN · WHAT RESETS"
                headerAction={
                    <Box sx={{ mr: 1 }}>
                        {canPrestige ? (
                            <Chip
                                label="READY"
                                size="small"
                                variant="outlined"
                                className="accent"
                                icon={<span className="live-dot" />}
                            />
                        ) : (
                            <Chip
                                label={`NEED L${levelRequirement}`}
                                size="small"
                                variant="outlined"
                                className="orange"
                                icon={<span className="live-dot warn" />}
                            />
                        )}
                    </Box>
                }
                content={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                            <MechRow
                                tone="good"
                                title="You keep"
                                items={[
                                    'All Prestige Points and allocated skills',
                                    'Permanent upgrades (Perm Upgrades)',
                                    'Neural Net training points',
                                    'Statistics & lifetime totals',
                                ]}
                            />
                            <MechRow
                                tone="bad"
                                title="You reset"
                                items={[
                                    'Operator level → 1',
                                    'Servers, racks, data centers, networks',
                                    'Cash on hand → $0.00',
                                    'Active cipher queue',
                                ]}
                            />
                        </Box>

                        <Box
                            sx={{
                                p: 1.75,
                                borderRadius: '10px',
                                border: '1px solid rgba(10,245,176,0.22)',
                                background:
                                    'linear-gradient(135deg, rgba(10,245,176,0.10), rgba(38,198,218,0.05))',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <InfoTwoTone sx={{ fontSize: 16, color: '#0af5b0' }} />
                                <Typography
                                    sx={{
                                        fontFamily: 'Fira Code, monospace',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: '#0af5b0',
                                    }}
                                >
                                    How points are minted
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: 13,
                                    color: 'rgba(255,255,255,0.75)',
                                    lineHeight: 1.55,
                                }}
                            >
                                Reach{' '}
                                <strong style={{ color: 'rgba(255,255,255,0.92)' }}>
                                    Operator Level {levelRequirement}
                                </strong>{' '}
                                to unlock the Prestige action. For every{' '}
                                <strong style={{ color: 'rgba(255,255,255,0.92)' }}>
                                    {fmtNum(xpPerPoint)} XP
                                </strong>{' '}
                                banked across your career, one extra Prestige Point is minted.
                                Spend points on the skill tree below — they remain across all
                                future prestiges, and can be refunded at any time.
                            </Typography>
                        </Box>

                        <Box
                            component="button"
                            type="button"
                            disabled={!canPrestige}
                            onClick={handlePrestige}
                            className={canPrestige ? 'prestige-cta armed' : 'prestige-cta'}
                            sx={{
                                position: 'relative',
                                width: '100%',
                                p: '14px 18px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: canPrestige ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.25,
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                background: canPrestige
                                    ? 'linear-gradient(90deg, #0af5b0, #26c6da)'
                                    : 'rgba(255,255,255,0.05)',
                                color: canPrestige ? '#04221a' : 'rgba(255,255,255,0.4)',
                                boxShadow: canPrestige
                                    ? '0 8px 24px rgba(10,245,176,0.25)'
                                    : 'none',
                                transition: 'all 225ms cubic-bezier(0,0,0.2,1)',
                                '&:hover': canPrestige
                                    ? {
                                          background: 'linear-gradient(90deg, #3afac3, #9ffce0)',
                                      }
                                    : {},
                            }}
                        >
                            <SettingsBackupRestoreTwoTone sx={{ fontSize: 22 }} />
                            <span style={{ flex: 1, textAlign: 'left' }}>
                                {canPrestige
                                    ? 'Initiate Prestige'
                                    : `Locked — Reach Level ${levelRequirement}`}
                            </span>
                            <Box
                                sx={{
                                    px: 1.25,
                                    py: 0.5,
                                    borderRadius: 9999,
                                    background: canPrestige
                                        ? 'rgba(4,34,26,0.20)'
                                        : 'rgba(255,255,255,0.06)',
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 12,
                                    letterSpacing: '0.1em',
                                }}
                            >
                                {canPrestige ? `+${fmtNum(nextPP)} PP` : `${Math.floor(level)} / ${levelRequirement}`}
                            </Box>
                        </Box>
                    </Box>
                }
            />

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Initiate prestige?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        This is a hard reset. Your operator returns to Level 1, cash to $0, and all
                        purchased servers, racks, datacenter contracts, and network links are
                        cleared. Your{' '}
                        <strong style={{ color: '#0af5b0' }}>
                            {fmtNum(nextPP)} Prestige Point{nextPP === 1 ? '' : 's'}
                        </strong>
                        , allocated skills, neural-net training, and lifetime stats are preserved.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        sx={{
                            bgcolor: '#0af5b0',
                            color: '#0a0f0d',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#0adf99' },
                        }}
                    >
                        Initiate
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

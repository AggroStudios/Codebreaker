import { Box, Button, Chip, LinearProgress, Typography } from '@mui/material';
import {
    GppGoodTwoTone,
    PolicyTwoTone,
    ReceiptLongTwoTone,
    RuleTwoTone,
    SecurityTwoTone,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import {
    FW_MODES,
    Firewall,
    FirewallMode,
    NetNode,
    fwStatusChipClass,
    fwStatusDotClass,
} from '../../includes/networks.interface';
import { fmtNum, formatMbps } from '../../lib/utils';
import { useNetworksStore } from '../../stores/networks';

interface MiniStatProps {
    label: string;
    value: string;
    color: string;
}

function MiniStat({ label, value, color }: MiniStatProps) {
    return (
        <Box
            sx={{
                p: '8px 10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
            }}
        >
            <Typography
                sx={{
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 16,
                    fontWeight: 600,
                    color,
                    lineHeight: 1.1,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

interface SegmentedModeProps {
    value: FirewallMode;
    disabled: boolean;
    onChange: (mode: FirewallMode) => void;
}

function SegmentedMode({ value, disabled, onChange }: SegmentedModeProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 0.5,
                p: '3px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                opacity: disabled ? 0.55 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
            }}
        >
            {FW_MODES.map((m) => {
                const active = value === m;
                return (
                    <Box
                        key={m}
                        component="button"
                        type="button"
                        onClick={() => onChange(m)}
                        sx={{
                            padding: '6px 4px',
                            borderRadius: '6px',
                            background: active ? 'rgba(10,245,176,0.18)' : 'transparent',
                            border: active
                                ? '1px solid rgba(10,245,176,0.35)'
                                : '1px solid transparent',
                            color: active ? '#0af5b0' : 'rgba(255,255,255,0.7)',
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                            transition: 'all 180ms cubic-bezier(0,0,0.2,1)',
                            '&:hover': {
                                background: active
                                    ? 'rgba(10,245,176,0.22)'
                                    : 'rgba(255,255,255,0.04)',
                            },
                        }}
                    >
                        {m}
                    </Box>
                );
            })}
        </Box>
    );
}

interface ToggleRowProps {
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    disabled?: boolean;
    onToggle: () => void;
}

function ToggleRow({ icon, label, checked, disabled, onToggle }: ToggleRowProps) {
    return (
        <Box
            onClick={() => !disabled && onToggle()}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: '8px 10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                transition: 'all 180ms cubic-bezier(0,0,0.2,1)',
                '&:hover': {
                    background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                },
            }}
        >
            <Box
                sx={{
                    color: checked ? '#0af5b0' : 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    transition: 'color 180ms cubic-bezier(0,0,0.2,1)',
                }}
            >
                {icon}
            </Box>
            <Typography sx={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                {label}
            </Typography>
            <Box
                sx={{
                    position: 'relative',
                    width: 32,
                    height: 18,
                    borderRadius: 9999,
                    background: checked ? 'rgba(10,245,176,0.30)' : 'rgba(255,255,255,0.18)',
                    transition: 'background 180ms cubic-bezier(0,0,0.2,1)',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 2,
                        left: checked ? 16 : 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: checked ? '#0af5b0' : 'rgba(255,255,255,0.85)',
                        transition: 'all 180ms cubic-bezier(0,0,0.2,1)',
                    }}
                />
            </Box>
        </Box>
    );
}

interface FirewallCardProps {
    fw: Firewall;
    node: NetNode | undefined;
}

export default function FirewallCard({ fw, node }: FirewallCardProps) {
    const setFirewallMode = useNetworksStore((s) => s.setFirewallMode);
    const toggleFirewallIPS = useNetworksStore((s) => s.toggleFirewallIPS);
    const toggleFirewallDeepInspect = useNetworksStore((s) => s.toggleFirewallDeepInspect);

    const isStation = node?.isStation === true;
    const isActive = fw.status === 'ACTIVE';
    const statusClass = fwStatusChipClass[fw.status];
    const dotClass = fwStatusDotClass[fw.status];
    const cpuColor = fw.cpuPct > 80 ? '#ff9800' : '#26c6da';

    return (
        <StationCard
            avatar={SecurityTwoTone}
            accent={isStation ? StationCardAccentType.ACCENT : StationCardAccentType.CYAN}
            highlight={isStation}
            title={fw.name}
            subheader={`${fw.model.toUpperCase()} · ${node?.city ?? '—'}`}
            headerAction={
                <Box sx={{ mr: 1 }}>
                    <Chip
                        label={fw.status}
                        size="small"
                        variant="outlined"
                        className={statusClass}
                        icon={<span className={`live-dot${dotClass ? ` ${dotClass}` : ''}`} />}
                    />
                </Box>
            }
            content={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1,
                        }}
                    >
                        <MiniStat label="Allow" value={fmtNum(fw.rulesAllow)} color="#0af5b0" />
                        <MiniStat label="Deny" value={fmtNum(fw.rulesDeny)} color="#f44336" />
                        <MiniStat
                            label="Blocked"
                            value={fmtNum(fw.threatsBlocked24h)}
                            color="#ff9800"
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontSize: 10,
                                fontWeight: 600,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.5)',
                                mb: 0.75,
                            }}
                        >
                            Inspection Mode
                        </Typography>
                        <SegmentedMode
                            value={fw.mode}
                            disabled={!isActive}
                            onChange={(m) => setFirewallMode(fw.id, m)}
                        />
                    </Box>

                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                mb: 0.5,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.55)',
                                }}
                            >
                                Throughput
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 12,
                                    color: '#26c6da',
                                }}
                            >
                                {formatMbps(fw.throughputMbps)}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={fw.cpuPct}
                            sx={{
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: cpuColor,
                                    boxShadow: `0 0 6px ${cpuColor}77`,
                                },
                            }}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mt: 0.5,
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 10,
                                color: 'rgba(255,255,255,0.5)',
                                letterSpacing: '0.06em',
                            }}
                        >
                            <span>FW LOAD</span>
                            <span>{fw.cpuPct}%</span>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <ToggleRow
                            icon={<GppGoodTwoTone sx={{ fontSize: 16 }} />}
                            label="Intrusion Prevention"
                            checked={fw.ips}
                            disabled={!isActive}
                            onToggle={() => toggleFirewallIPS(fw.id)}
                        />
                        <ToggleRow
                            icon={<PolicyTwoTone sx={{ fontSize: 16 }} />}
                            label="Deep Packet Inspection"
                            checked={fw.deepInspect}
                            disabled={!isActive}
                            onToggle={() => toggleFirewallDeepInspect(fw.id)}
                        />
                    </Box>
                </Box>
            }
            action={
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        size="small"
                        startIcon={<RuleTwoTone />}
                        sx={{ color: 'rgba(255,255,255,0.85)' }}
                    >
                        Edit Rules
                    </Button>
                    <Button
                        size="small"
                        startIcon={<ReceiptLongTwoTone />}
                        sx={{ color: '#26c6da' }}
                    >
                        View Log
                    </Button>
                </Box>
            }
        />
    );
}

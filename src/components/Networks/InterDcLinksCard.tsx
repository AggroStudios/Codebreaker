import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    LinearProgress,
    MenuItem,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddTwoTone,
    CableTwoTone,
    CheckTwoTone,
    CloseTwoTone,
    EastTwoTone,
    LinkOffTwoTone,
    UpgradeTwoTone,
} from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import {
    LINK_TYPE_DEFAULTS,
    LINK_TYPE_ORDER,
    LinkType,
    NetLink,
    NetNode,
    NodeId,
    linkStatusChipClass,
    linkStatusDotClass,
    utilBarClass,
} from '../../includes/networks.interface';
import { formatMoneyDay, formatMs } from '../../lib/utils';
import { linkExistsBetween, useNetworksStore } from '../../stores/networks';
import { findNode, useNetworkNodesWithSeed } from './nodes';
import NodeChip from './NodeChip';

const COLS = 'minmax(0, 2.2fr) 80px minmax(140px, 1fr) 90px 110px 140px';

const UTIL_HEX: Record<'accent' | 'cyan' | 'orange', string> = {
    accent: '#0af5b0',
    cyan: '#26c6da',
    orange: '#ff9800',
};

interface LinkRowProps {
    link: NetLink;
    nodes: NetNode[];
}

function LinkRow({ link, nodes }: LinkRowProps) {
    const upgradeLink = useNetworksStore((s) => s.upgradeLink);
    const removeLink = useNetworksStore((s) => s.removeLink);

    const src = findNode(nodes, link.src);
    const dst = findNode(nodes, link.dst);
    const util = Math.round(link.utilizationPct);
    const utilColorKey = utilBarClass(util);
    const utilHex = UTIL_HEX[utilColorKey];
    const statusClass = linkStatusChipClass[link.status];
    const dotClass = linkStatusDotClass[link.status];
    const upgradable = LINK_TYPE_ORDER.indexOf(link.type) < LINK_TYPE_ORDER.length - 1;
    const isFree = link.costDay === 0;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: COLS,
                gap: 2,
                alignItems: 'center',
                px: 2.25,
                py: 1.75,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <NodeChip node={src} />
                <EastTwoTone sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                <NodeChip node={dst} />
            </Box>

            <Chip
                label={link.type.toUpperCase()}
                size="small"
                variant="outlined"
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.18)',
                }}
            />

            <Box sx={{ minWidth: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        mb: 0.5,
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                    }}
                >
                    <span style={{ color: 'rgba(255,255,255,0.78)' }}>{link.gbps} Gbps</span>
                    <span style={{ color: utilHex }}>{util}%</span>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={util}
                    sx={{
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: utilHex,
                            boxShadow: `0 0 6px ${utilHex}88`,
                        },
                    }}
                />
            </Box>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.85)',
                }}
            >
                {formatMs(link.latencyMs)}
            </Typography>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 13,
                    fontWeight: 500,
                    color: isFree ? '#0af5b0' : 'rgba(255,255,255,0.85)',
                }}
            >
                {isFree ? 'FREE' : formatMoneyDay(link.costDay)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                <Chip
                    label={link.status}
                    size="small"
                    variant="outlined"
                    className={statusClass}
                    icon={<span className={`live-dot${dotClass ? ` ${dotClass}` : ''}`} />}
                />
                <Tooltip title={upgradable ? 'Upgrade link' : 'Already top tier'}>
                    <span>
                        <IconButton
                            size="small"
                            disabled={!upgradable}
                            onClick={() => upgradeLink(link.id)}
                            sx={{ color: '#0af5b0' }}
                        >
                            <UpgradeTwoTone fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Remove link">
                    <IconButton
                        size="small"
                        onClick={() => removeLink(link.id)}
                        sx={{ color: '#f44336' }}
                    >
                        <LinkOffTwoTone fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}

interface AddLinkRowProps {
    nodes: NetNode[];
    existing: NetLink[];
    onProvision: (src: NodeId, dst: NodeId, type: LinkType) => void;
}

function AddLinkRow({ nodes, existing, onProvision }: AddLinkRowProps) {
    const [src, setSrc] = useState<NodeId>('');
    const [dst, setDst] = useState<NodeId>('');
    const [type, setType] = useState<LinkType>('VPN');

    const def = LINK_TYPE_DEFAULTS[type];
    const previewLatency = Math.max(8, 64 + def.latencyBoost);
    const isFree = def.costDay === 0;

    const usedPair = src && dst ? linkExistsBetween(existing, src, dst) : false;
    const disabled = !src || !dst || src === dst || usedPair;

    const targetNodes = nodes.filter((n) => n.id !== src);

    const handleProvision = () => {
        if (disabled) return;
        onProvision(src, dst, type);
        setSrc('');
        setDst('');
        setType('VPN');
    };

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: COLS,
                gap: 2,
                alignItems: 'center',
                px: 2.25,
                py: 1.75,
                background: 'rgba(10,245,176,0.04)',
                borderBottom: '1px solid rgba(10,245,176,0.18)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Select
                    size="small"
                    displayEmpty
                    value={src}
                    onChange={(e) => setSrc(String(e.target.value))}
                    sx={{ minWidth: 0, flex: 1, background: 'rgba(0,0,0,0.35)' }}
                >
                    <MenuItem value="" disabled>Source…</MenuItem>
                    {nodes.map((n) => (
                        <MenuItem key={n.id} value={n.id}>
                            {n.code} · {n.city}
                        </MenuItem>
                    ))}
                </Select>
                <EastTwoTone sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                <Select
                    size="small"
                    displayEmpty
                    value={dst}
                    onChange={(e) => setDst(String(e.target.value))}
                    sx={{ minWidth: 0, flex: 1, background: 'rgba(0,0,0,0.35)' }}
                >
                    <MenuItem value="" disabled>Target…</MenuItem>
                    {targetNodes.map((n) => (
                        <MenuItem key={n.id} value={n.id}>
                            {n.code} · {n.city}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <Select
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value as LinkType)}
                sx={{ background: 'rgba(0,0,0,0.35)' }}
            >
                {LINK_TYPE_ORDER.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
            </Select>

            <Typography
                sx={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.4,
                }}
            >
                {def.desc}
            </Typography>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.7)',
                }}
            >
                {formatMs(previewLatency)}
            </Typography>

            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 13,
                    color: isFree ? '#0af5b0' : '#ff9800',
                }}
            >
                {isFree ? 'FREE' : formatMoneyDay(def.costDay)}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckTwoTone />}
                    disabled={disabled}
                    onClick={handleProvision}
                    sx={{
                        bgcolor: '#0af5b0',
                        color: '#0a0f0d',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#0adf99' },
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(10,245,176,0.25)',
                            color: 'rgba(10,15,13,0.5)',
                        },
                    }}
                >
                    Provision
                </Button>
            </Box>
        </Box>
    );
}

export default function InterDcLinksCard() {
    const links = useNetworksStore((s) => s.links);
    const provisionLink = useNetworksStore((s) => s.provisionLink);
    const nodes = useNetworkNodesWithSeed();
    const [adding, setAdding] = useState(false);

    const visibleLinks = useMemo(
        () =>
            links.filter(
                (l) => findNode(nodes, l.src) != null && findNode(nodes, l.dst) != null,
            ),
        [links, nodes],
    );

    return (
        <StationCard
            avatar={CableTwoTone}
            accent={StationCardAccentType.CYAN}
            title="Inter-Datacenter Links"
            subheader="PEERING / TRANSIT"
            headerAction={
                <Box sx={{ mr: 1 }}>
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={adding ? <CloseTwoTone /> : <AddTwoTone />}
                        onClick={() => setAdding((a) => !a)}
                        sx={{
                            bgcolor: adding ? 'rgba(255,255,255,0.08)' : '#0af5b0',
                            color: adding ? 'rgba(255,255,255,0.85)' : '#0a0f0d',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: adding ? 'rgba(255,255,255,0.14)' : '#0adf99',
                            },
                        }}
                    >
                        {adding ? 'Cancel' : 'New Link'}
                    </Button>
                </Box>
            }
            content={
                <Box sx={{ mx: -2, mt: -2, mb: -2 }}>
                    {adding && (
                        <AddLinkRow
                            nodes={nodes}
                            existing={links}
                            onProvision={(src, dst, type) => {
                                provisionLink(src, dst, type);
                                setAdding(false);
                            }}
                        />
                    )}

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: COLS,
                            gap: 2,
                            px: 2.25,
                            py: 1.25,
                            background: 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.16em',
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                        }}
                    >
                        <span>Endpoints</span>
                        <span>Class</span>
                        <span>Capacity / Util</span>
                        <span>Latency</span>
                        <span>Cost</span>
                        <span style={{ textAlign: 'right' }}>Status</span>
                    </Box>

                    {visibleLinks.length === 0 ? (
                        <Box
                            sx={{
                                p: 5,
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.55)',
                                fontSize: 13,
                            }}
                        >
                            No links provisioned. Click{' '}
                            <span style={{ color: '#0af5b0', fontWeight: 700 }}>New Link</span>{' '}
                            to connect two data centers.
                        </Box>
                    ) : (
                        visibleLinks.map((l) => <LinkRow key={l.id} link={l} nodes={nodes} />)
                    )}
                </Box>
            }
        />
    );
}

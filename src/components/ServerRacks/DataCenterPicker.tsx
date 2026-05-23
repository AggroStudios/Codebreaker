import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
    AddBusinessOutlined,
    ApartmentOutlined,
    CheckOutlined,
    KeyboardArrowDownOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';

import { useDataCentersStore } from '../../stores/dataCenters';
import { useActiveDataCenters } from './useActiveDataCenters';
import { useRacksStore } from '../../stores/racks';

const FLAGS: Record<string, string> = {
    'us-west': '🇺🇸',
    'us-central': '🇺🇸',
    'us-east': '🇺🇸',
    'ca-central': '🇨🇦',
    'sa-east': '🇧🇷',
    'eu-west': '🇮🇪',
    'eu-central': '🇩🇪',
    'eu-north': '🇸🇪',
    'me-central': '🇧🇭',
    'af-south': '🇿🇦',
    'ap-south': '🇮🇳',
    'ap-southeast-1': '🇸🇬',
    'ap-east': '🇭🇰',
    'ap-northeast': '🇯🇵',
    'ap-southeast-2': '🇦🇺',
    'eu-iceland': '🇮🇸',
};

const flagFor = (id: string): string => FLAGS[id] ?? '🌐';

interface DataCenterPickerProps {
    selectedDcId: string;
}

export default function DataCenterPicker({ selectedDcId }: DataCenterPickerProps) {
    const navigate = useNavigate();
    const contracts = useDataCentersStore((s) => s.contracts);
    const active = useActiveDataCenters();
    const selectDc = useRacksStore((s) => s.selectDC);

    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener('mousedown', onClick);
        return () => window.removeEventListener('mousedown', onClick);
    }, [open]);

    const selected =
        active.find((a) => a.dataCenter.id === selectedDcId) ?? active[0] ?? null;
    if (!selected) return null;

    // First contract in store insertion order acts as the player's primary DC.
    const primaryDcId = Object.keys(contracts)[0];

    const handleDcSelect = (dcId: string) => {
        selectDc(dcId);
        navigate(`/racks/${dcId}`);
        setOpen(false);
    }

    return (
        <Box ref={containerRef} sx={{ position: 'relative', display: 'inline-block' }}>
            <Box
                role="combobox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                sx={{
                    minWidth: 280,
                    p: 1,
                    background: 'rgba(25,25,25,0.85)',
                    border: '1px solid rgba(10,245,176,0.30)',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'all 180ms cubic-bezier(0,0,0.2,1)',
                    '&:hover': { borderColor: 'rgba(10,245,176,0.55)' },
                }}
            >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{flagFor(selected.dataCenter.id)}</span>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            letterSpacing: '0.16em',
                            color: '#0af5b0',
                            textTransform: 'uppercase',
                        }}
                    >
                        Datacenter
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.9)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {selected.dataCenter.name} · {selected.dataCenter.code}
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.55)',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                        ml: 1,
                    }}
                >
                    {selected.contract.racks} rack{selected.contract.racks === 1 ? '' : 's'}
                </Typography>
                <KeyboardArrowDownOutlined
                    sx={{
                        color: 'rgba(255,255,255,0.55)',
                        transition: 'transform 180ms ease',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                />
            </Box>

            {open && (
                <Box
                    role="listbox"
                    sx={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        minWidth: 360,
                        zIndex: 50,
                        background: 'rgba(28,28,30,0.98)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 1,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
                        overflow: 'hidden',
                        maxHeight: 420,
                        overflowY: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            px: 1.5,
                            py: 1,
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            color: 'rgba(255,255,255,0.45)',
                            textTransform: 'uppercase',
                        }}
                    >
                        Switch Datacenter
                    </Box>
                    {active.map(({ dataCenter: d, contract }) => {
                        const isActive = d.id === selectedDcId;
                        const isPrimary = d.id === primaryDcId;
                        return (
                            <Box
                                key={d.id}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => handleDcSelect(d.id)}
                                sx={{
                                    px: 1.5,
                                    py: 1,
                                    display: 'grid',
                                    gridTemplateColumns: '24px 1fr auto',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    background: isActive ? 'rgba(10,245,176,0.08)' : 'transparent',
                                    borderLeft: isActive
                                        ? '2px solid #0af5b0'
                                        : '2px solid transparent',
                                    '&:hover': { background: 'rgba(255,255,255,0.04)' },
                                }}
                            >
                                <span style={{ fontSize: 20, lineHeight: 1 }}>{flagFor(d.id)}</span>
                                <Box sx={{ minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: 'rgba(255,255,255,0.92)',
                                            }}
                                        >
                                            {d.name}
                                        </Typography>
                                        {isPrimary && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontFamily: 'Fira Code, monospace',
                                                    fontSize: 8,
                                                    letterSpacing: '0.18em',
                                                    px: 0.5,
                                                    py: '1px',
                                                    border: '1px solid rgba(10,245,176,0.55)',
                                                    color: '#0af5b0',
                                                    borderRadius: 0.5,
                                                }}
                                            >
                                                PRIMARY
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontFamily: 'Fira Code, monospace',
                                            fontSize: 10,
                                            color: 'rgba(255,255,255,0.5)',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        {d.code} · TIER {d.tier} · {contract.racks} rack
                                        {contract.racks === 1 ? '' : 's'} · {contract.powerKw} kW
                                    </Typography>
                                </Box>
                                {isActive && (
                                    <CheckOutlined sx={{ fontSize: 16, color: '#0af5b0' }} />
                                )}
                            </Box>
                        );
                    })}

                    <Box
                        sx={{
                            px: 1.5,
                            py: 1,
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#0af5b0',
                            cursor: 'pointer',
                            '&:hover': { background: 'rgba(10,245,176,0.06)' },
                        }}
                        onClick={() => {
                            setOpen(false);
                            navigate('/dataCenters');
                        }}
                    >
                        <AddBusinessOutlined sx={{ fontSize: 16 }} />
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 11,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Lease new datacenter…
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export const dcBreadcrumbIcon = ApartmentOutlined;

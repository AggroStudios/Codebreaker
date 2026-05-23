import { useMemo, useState } from 'react';

import { ICipherType } from '../../includes/Cipher.interface';
import { formatMoney } from '../../lib/utils';
import { Box, Select, Button, SelectChangeEvent, MenuItem, InputLabel, FormControl, LinearProgress, ListItemText, Typography, ListItem } from '@mui/material';
import { AddCircleOutlineOutlined, MemoryTwoTone, PlayArrowTwoTone, TerminalTwoTone } from '@mui/icons-material';

import './styles.scss';
import { useStationContext } from '../../stores/stationContext';
import { ProcessorArchitecture } from '../../includes/Process.interface';
import { CipherTypes } from '../../data/cipherList';
import { useCipherStore } from '../../stores/cipher';
import StationCard, { StationCardAccentType } from '../StationCard';

/** Convert authored cipher memory (MB) to the GB units the station's memory capacity uses. */
const cipherMemoryGb = (type: ICipherType): number =>
    Math.ceil((type.memoryRequired ?? 0) / 1024);

export default function CipherAdd({ onAdd }: { onAdd: (id: string, cipherType: ICipherType) => void }) {
    const [picked, setPicked] = useState('');
    const { stationProxy } = useStationContext();
    const runningProcesses = useCipherStore((s) => s.runningProcesses);

    const totalMemoryGb = stationProxy.memory?.capacity ?? 0;
    const usedMemoryGb = useMemo(
        () => runningProcesses.reduce((sum, p) => sum + cipherMemoryGb(p.type), 0),
        [runningProcesses],
    );
    const freeMemoryGb = Math.max(0, totalMemoryGb - usedMemoryGb);
    const pickedType = picked ? CipherTypes.find((c) => c.name === picked) ?? null : null;
    const pickedGb = pickedType ? cipherMemoryGb(pickedType) : 0;
    const wouldOverflow = pickedType != null && pickedGb > freeMemoryGb;
    const memoryUsedPct = totalMemoryGb > 0 ? Math.min(100, (usedMemoryGb / totalMemoryGb) * 100) : 0;

    const opts = CipherTypes
    .filter((t) => t.requiredArchitecture.includes(stationProxy.cpu.architecture as ProcessorArchitecture))
    .map((t) => ({
        value: t.name,
        label: t.name,
        meta: `${formatMoney(t.payout)}`,
        gb: cipherMemoryGb(t),
        fits: cipherMemoryGb(t) <= freeMemoryGb,
    }));
    return (
        
        <StationCard
            id="cipher-add-card"
            avatar={AddCircleOutlineOutlined}
            accent={StationCardAccentType.ACCENT}
            title="Queue Cipher Break"
            subheader="ADD NEW PROCESS"
            highlight={true}
            content={
                <div className="cipher-add-container">
                    <TerminalTwoTone fontSize="large" style={{ color: 'rgba(10, 245, 176, 0.6)' }} />
                    <div className="cipher-add-description">
                        Pick a cipher type to spin up a new break.
                        Larger ciphers pay more but require more processing power.
                    </div>

                    <Box
                        sx={{
                            width: '100%',
                            mt: 1,
                            mb: 1.5,
                            p: 1.25,
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                            <MemoryTwoTone sx={{ fontSize: 14, color: 'rgba(10,245,176,0.85)' }} />
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    letterSpacing: '0.16em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.55)',
                                    flex: 1,
                                }}
                            >
                                Memory
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.85)',
                                }}
                            >
                                {usedMemoryGb} / {totalMemoryGb} GB
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={memoryUsedPct}
                            sx={{
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: memoryUsedPct > 80 ? '#ff9800' : '#0af5b0',
                                    boxShadow: memoryUsedPct > 80
                                        ? '0 0 6px rgba(255,152,0,0.5)'
                                        : '0 0 6px rgba(10,245,176,0.5)',
                                },
                            }}
                        />
                        {pickedType && (
                            <Typography
                                sx={{
                                    fontFamily: 'Fira Code, monospace',
                                    fontSize: 10,
                                    color: wouldOverflow ? '#ff5252' : 'rgba(255,255,255,0.55)',
                                    mt: 0.75,
                                }}
                            >
                                {wouldOverflow
                                    ? `Needs ${pickedGb} GB · only ${freeMemoryGb} GB free — upgrade Codium Memory`
                                    : `Selected cipher reserves ${pickedGb} GB`}
                            </Typography>
                        )}
                    </Box>

                    <div className="cipher-type-select-container">
                        <FormControl variant="standard" className="cipher-type-select-form-control">
                        <InputLabel id="cipher-type-label">Select cipher type...</InputLabel>
                        <Select
                            value={picked}
                            onChange={(event: SelectChangeEvent<string>) => setPicked(event.target.value)}
                            renderValue={(selected) => {
                                const t = CipherTypes.find((x) => x.name === selected);
                                const returnObj = <ListItem>
                                <ListItemText>{t.name}</ListItemText>
                                <Typography variant="body2" color="text.secondary">${formatMoney(t.payout)}</Typography>
                                </ListItem>
                                return t ? returnObj : 'Select cipher type…';
                            }}
                        >
                            {opts.map((type, idx) => (
                                <MenuItem
                                    key={`cipher-type-${idx}`}
                                    value={type.value}
                                    sx={{ opacity: type.fits ? 1 : 0.55 }}
                                >
                                    <ListItemText>{type.label}</ListItemText>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: type.fits ? 'text.secondary' : '#ff9800',
                                            fontFamily: 'Fira Code, monospace',
                                            mr: 1,
                                        }}
                                    >
                                        {type.gb} GB
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">${type.meta}</Typography>
                                </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                        <Button
                            className="cipher-add-button"
                            variant="contained" color="primary" fullWidth
                            disabled={!picked || wouldOverflow}
                            onClick={() => {
                                const t = CipherTypes.find((x) => x.name === picked);
                                if (!t) return;
                                if (cipherMemoryGb(t) > freeMemoryGb) return;
                                onAdd(crypto.randomUUID(), t);
                                setPicked('');
                            }}
                            startIcon={<PlayArrowTwoTone />}
                        >
                            {wouldOverflow ? 'Memory Full' : 'Begin Break'}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
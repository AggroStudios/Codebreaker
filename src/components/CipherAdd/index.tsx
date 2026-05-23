import { useMemo, useState } from 'react';

import { ICipherType } from '../../includes/Cipher.interface';
import { formatMoney } from '../../lib/utils';
import { Box, Select, Button, SelectChangeEvent, MenuItem, InputLabel, FormControl, ListItemText, Typography, ListItem } from '@mui/material';
import {
    AddCircleOutlineOutlined,
    BoltTwoTone,
    DeveloperBoardTwoTone,
    MemoryTwoTone,
    PlayArrowTwoTone,
    StarTwoTone,
    TerminalTwoTone,
} from '@mui/icons-material';

import './styles.scss';
import { useStationContext } from '../../stores/stationContext';
import { ProcessorArchitecture } from '../../includes/Process.interface';
import { CipherTypes } from '../../data/cipherList';
import { useCipherStore } from '../../stores/cipher';
import StationCard, { StationCardAccentType } from '../StationCard';

/** Convert authored cipher memory (MB) to the GB units the station's memory capacity uses. */
const cipherMemoryGb = (type: ICipherType): number =>
    Math.ceil((type.memoryRequired ?? 0) / 1024);

const complexityTier = (value: number): string => {
    if (value < 2) return 'Low';
    if (value < 5) return 'Med';
    if (value < 10) return 'Hi';
    return 'Xtr';
};

const STAT_LABEL_SX = {
    fontFamily: 'Fira Code, monospace',
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.55)',
};

const STAT_VALUE_SX = {
    fontFamily: 'Fira Code, monospace',
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.9)',
};

function CipherStat({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minHeight: 22 }}>
            <Icon sx={{ fontSize: 14, color: 'rgba(10,245,176,0.85)' }} />
            <Typography sx={{ ...STAT_LABEL_SX, flex: 1, textAlign: 'left' }}>{label}</Typography>
            <Typography sx={STAT_VALUE_SX}>{value}</Typography>
        </Box>
    );
}

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

    const maxSlots = stationProxy.memory?.maxConcurrentBreaks ?? Infinity;
    const slotsUsed = runningProcesses.length;
    const slotsFull = slotsUsed >= maxSlots;

    const opts = CipherTypes
    .filter((t) => t.requiredArchitecture.includes(stationProxy.cpu.architecture as ProcessorArchitecture))
    .map((t) => ({
        value: t.name,
        label: t.name,
        meta: `${formatMoney(t.payout)}`,
        gb: cipherMemoryGb(t),
        fits: cipherMemoryGb(t) <= freeMemoryGb,
    }));

    const buttonLabel = wouldOverflow
        ? 'Memory Full'
        : slotsFull
            ? 'All Slots In Use'
            : 'Begin Break';

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
                            mb: 1.5,
                            p: 1.25,
                            background: 'rgba(0,0,0,0.30)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                        }}
                    >
                        <Typography sx={{ ...STAT_LABEL_SX, mb: 0.5 }}>
                            {pickedType ? `Cipher · ${pickedType.name}` : 'Cipher · --'}
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                columnGap: 1.5,
                                rowGap: 0.5,
                            }}
                        >
                            <CipherStat
                                icon={DeveloperBoardTwoTone}
                                label="Cores"
                                value={pickedType ? String(pickedType.parallelism) : '--'}
                            />
                            <CipherStat
                                icon={BoltTwoTone}
                                label="Complexity"
                                value={pickedType ? `${complexityTier(pickedType.complexity)} · ${pickedType.complexity}` : '--'}
                            />
                            <CipherStat
                                icon={MemoryTwoTone}
                                label="Memory"
                                value={pickedType ? `${pickedGb} GB` : '--'}
                            />
                            <CipherStat
                                icon={StarTwoTone}
                                label="XP"
                                value={pickedType ? String(pickedType.xp) : '--'}
                            />
                        </Box>
                        {wouldOverflow && (
                            <Typography sx={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: '#ff5252', mt: 0.5 }}>
                                Needs {pickedGb} GB · only {freeMemoryGb} GB free — upgrade Codium Memory
                            </Typography>
                        )}
                        {!wouldOverflow && slotsFull && (
                            <Typography sx={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: '#ff5252', mt: 0.5 }}>
                                All slots in use — upgrade Codium Memory for more.
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
                            disabled={!picked || wouldOverflow || slotsFull}
                            onClick={() => {
                                const t = CipherTypes.find((x) => x.name === picked);
                                if (!t) return;
                                if (cipherMemoryGb(t) > freeMemoryGb) return;
                                if (slotsUsed >= maxSlots) return;
                                onAdd(crypto.randomUUID(), t);
                                setPicked('');
                            }}
                            startIcon={<PlayArrowTwoTone />}
                        >
                            {buttonLabel}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}

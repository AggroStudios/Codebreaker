import { useState } from 'react';

import { ICipherType } from '../../includes/Cipher.interface';
import { formatMoney } from '../../lib/utils';
import { Select, Button, SelectChangeEvent, MenuItem, InputLabel, FormControl, ListItemText, Typography, ListItem } from '@mui/material';
import { AddCircleOutlineOutlined, PlayArrowTwoTone, TerminalTwoTone } from '@mui/icons-material';

import './styles.scss';
import { useStationContext } from '../../stores/stationContext';
import { ProcessorArchitecture } from '../../includes/Process.interface';
import { CipherTypes } from '../../lib/cipherList';
import StationCard, { StationCardAccentType } from '../StationCard';

export default function CipherAdd({ onAdd }: { onAdd: (id: string, cipherType: ICipherType) => void }) {
    const [picked, setPicked] = useState('');
    const { stationProxy } = useStationContext();
    const opts = CipherTypes
    .filter((t) => t.requiredArchitecture.includes(stationProxy.cpu.architecture as ProcessorArchitecture))
    .map((t) => ({ value: t.name, label: t.name, meta: `${formatMoney(t.payout)}` }));
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
                                <MenuItem key={`cipher-type-${idx}`} value={type.value}>
                                <ListItemText>{type.label}</ListItemText>
                                <Typography variant="body2" color="text.secondary">${type.meta}</Typography>
                                </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                        <Button
                            className="cipher-add-button"
                            variant="contained" color="primary" fullWidth
                            disabled={!picked}
                            onClick={() => {
                                const t = CipherTypes.find((x) => x.name === picked);
                                if (!t) return;
                                onAdd(crypto.randomUUID(), t);
                                setPicked('');
                            }}
                            startIcon={<PlayArrowTwoTone />}
                        >
                            Begin Break
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
import { useState } from 'react';

import { ICipherType, CipherTypes } from '../../includes/Cipher.interface';
import { formatMoney } from '../../lib/utils';
import { Card, CardHeader, Avatar, CardContent, Select, Button, SelectChangeEvent, MenuItem, InputLabel, FormControl, ListItemText, Typography, ListItem } from '@mui/material';
import { AddCircleOutlineOutlined, PlayArrowTwoTone, TerminalTwoTone } from '@mui/icons-material';

import './styles.scss';

export default function CipherAdd({ onAdd }: { onAdd: (id: string, cipherType: ICipherType) => void }) {
    const [picked, setPicked] = useState('');
    const opts = CipherTypes.map((t) => ({
      value: t.name, label: t.name, meta: `${formatMoney(t.payout)}`
    }));
    return (
      <Card id="cipher-add-card" style={{ borderStyle: 'dotted', borderWidth: 1, borderColor: 'rgba(10,245,176,0.30)', height: '100%' }}>
        <CardHeader
          avatar={<Avatar sx={{ color: '#0af5b0', bgcolor: 'rgba(10,245,176,0.15)' }}><AddCircleOutlineOutlined /></Avatar>}
          title="Queue Cipher Break"
          subheader="ADD NEW PROCESS"
        />
        <CardContent>
          <div style={{
            minHeight: 200,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 14, padding: 16, textAlign: 'center',
            background: 'rgba(0,0,0,0.30)',
            border: '1px dashed rgba(255,255,255,0.10)',
            borderRadius: 8,
          }}>
            <TerminalTwoTone fontSize="large" style={{ color: 'rgba(10,245,176,0.6)' }} />
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 280, lineHeight: 1.5 }}>
              Pick a cipher type to spin up a new break.
              Larger ciphers pay more but require more processing power.
            </div>
            <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        </CardContent>
      </Card>
    );
  }
  
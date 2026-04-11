import './App.css'
import { create } from 'solid-zustand/store';

import { CounterState } from './includes/Counter.interface';

import { StationStoreType } from './includes/Process.interface';
import { Component } from 'solid-js';

import CipherBreak from './components/Widgets/cipherBreak';
import StationStatistics from './components/StationStatistics';

import Grid from '@suid/material/Grid';

import Cipher from './lib/Cipher';
import { CpuActivityWidget } from './components/Widgets/cpuActivity';
import { CipherTypes } from './includes/Cipher.interface';
import Button from '@suid/material/Button';

const useStore = create<CounterState>(set => ({
    runningCiphers: [],
    addCipher: (cipher: Cipher) => set(state => ({ runningCiphers: [...state.runningCiphers, cipher] })),
    removeCipher: (cipher: Cipher) => set(state => ({ runningCiphers: state.runningCiphers.filter(c => c !== cipher) })),
    setStation: (station: StationStoreType) => set(() => ({ station })),
    station: null,
    cpuActivity: [],
    setCpuActivity: (cpuActivity: { x: number, y: number }[]) => set(() => ({ cpuActivity })),
}));

const App: Component<{ stationStore?: StationStoreType }> = props => {
  
    const state = useStore();
    let hideMoneyLabelTimer: ReturnType<typeof setTimeout> | null = null;

    const completeCipher = (cipher: Cipher) => {
        state.removeCipher(cipher);
        // Add notification
    }

    const addCipher = () => {
        const cipherType = CipherTypes[Math.floor(Math.random() * CipherTypes.length)];
        const cssClasses = [ 'breaking-1', 'breaking-2', 'breaking-3', 'breaking-4' ];
        const c = new Cipher(20, 10, cssClasses, cipherType, stationStore);
        state.addCipher(c);
    }

    const { stationStore } = props;
    state.setStation(stationStore);

    const showMoneyLabel = () => {
        if (hideMoneyLabelTimer !== null) {
            clearTimeout(hideMoneyLabelTimer);
            hideMoneyLabelTimer = null;
        }
        let amount = Math.ceil(Math.random() * 100);
        const positive = Math.random() > 0.5;
        if (!positive) {
            amount = -amount;
        }
        stationStore.os.player.setMoneyLabel(amount);
        hideMoneyLabelTimer = setTimeout(() => {
            stationStore.os.player.setMoneyLabel(null);
            hideMoneyLabelTimer = null;
        }, 990);
    }
    
    return (
        <>
            <div class="card">
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <StationStatistics station={stationStore} />
                    </Grid>
                    <Grid item xs={8}>
                        <CpuActivityWidget state={state} title="CPU Activity" />
                    </Grid>
                </Grid>
            </div>
            <div><Button onClick={showMoneyLabel}>Show Money Label</Button></div>
            <div class="card">
                <Grid container spacing={2}>
                    {state.runningCiphers.length > 0 && state.runningCiphers.map(cipher =>
                        <Grid item xs={4}>
                            <CipherBreak station={state.station} width={20} cipher={cipher} newCipher={addCipher} onComplete={completeCipher} />
                        </Grid>
                    ) || 
                    <Grid item xs={4}>
                        <CipherBreak station={state.station} width={20} newCipher={addCipher} />
                    </Grid>
                    }
                </Grid>
            </div>
        </>
    )
}

export default App

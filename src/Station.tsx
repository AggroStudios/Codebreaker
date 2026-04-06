import './App.css'
import create from 'solid-zustand';

import { CounterState } from './includes/Counter.interface';

import Counter from './Counter';
import CounterDecrease from './CounterDecrease';

import { StationStoreType } from './includes/Process.interface';
import { Component } from 'solid-js';

import CipherBreak from './components/Widgets/cipherBreak';
import StationStatistics from './components/StationStatistics';

import Grid from '@suid/material/Grid';

import Cipher from './lib/Cipher';
import { CpuActivityWidget } from './components/Widgets/cpuActivity';

const useStore = create<CounterState>(set => ({
    count: 1,
    increase: () => set(state => ({ count: state.count + 1 })),
    decrease: () => set(state => ({ count: Math.max(1, state.count - 1) })),
    runningCiphers: [],
    addCipher: (cipher: Cipher) => set(state => ({ runningCiphers: [...state.runningCiphers, cipher] })),
    removeCipher: (cipher: Cipher) => set(state => ({ runningCiphers: state.runningCiphers.filter(c => c !== cipher) })),
    cipher: null,
    setCipher: (cipher: Cipher) => set(() => ({ cipher })),
    setStation: (station: StationStoreType) => set(() => ({ station })),
    station: null,
    cpuActivity: [],
    setCpuActivity: (cpuActivity: { x: number, y: number }[]) => set(() => ({ cpuActivity })),
}));

const App: Component<{ stationStore?: StationStoreType }> = props => {
  
    const state = useStore();

    const addCipher = () => {
        const cssClasses = [ 'breaking-1', 'breaking-2', 'breaking-3', 'breaking-4' ];
        const c = new Cipher(20, 10, cssClasses);
        state.addCipher(c);
        console.log(c);
        stationStore.os.addProcess(c);
    }

    const { stationStore } = props;
    state.setStation(stationStore);

    return (
        <>
            <div class="card">
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <StationStatistics station={stationStore} />
                    </Grid>
                    <Grid item xs={8}>
                        <CpuActivityWidget state={state} />
                    </Grid>
                </Grid>
            </div>
            <div class="card">
                <Counter store={state} />
                <CounterDecrease store={state} />
            </div>
            <div class="card">
                <Grid container spacing={2}>
                    {state.runningCiphers.length > 0 && state.runningCiphers.map(cipher =>
                        <Grid item xs={4}>
                            <CipherBreak station={state.station} width={20} cipher={cipher} newCipher={addCipher} />
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

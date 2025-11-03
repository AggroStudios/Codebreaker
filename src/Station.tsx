import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
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
    cipher: null,
    setCipher: (cipher: Cipher) => set(() => ({ cipher })),
    setStation: (station: StationStoreType) => set(() => ({ station })),
    station: null,
    cpuActivity: [],
    setCpuActivity: (cpuActivity: { x: number, y: number }[]) => set(() => ({ cpuActivity })),
}));

const App: Component<{ stationStore?: StationStoreType }> = props => {
  
    const state = useStore();

    const addCipher = (c: Cipher) => {
        stationStore.os.addProcess(c);
    }

    const { stationStore } = props;
    state.setStation(stationStore);

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} class="logo" alt="Vite logo" />
                </a>
                <a href="https://solidjs.com" target="_blank">
                    <img src={solidLogo} class="logo solid" alt="Solid logo" />
                </a>
            </div>
            <h1>Vite + Solid</h1>
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
                <Grid container>
                    <Grid item xs={4}>
                        <CipherBreak state={state} width={20} queueProcess={addCipher} />
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default App

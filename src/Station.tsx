import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import './App.css'
import create from 'solid-zustand';
// import { useNavigate } from '@solidjs/router';

import { CounterState } from './includes/Counter.interface';

import Counter from './Counter';
import CounterDecrease from './CounterDecrease';
// import { Button } from '@suid/material';

import Process, { StationStoreType } from './includes/Process.interface';
import { Component, onMount } from 'solid-js';

import CipherBreak from './components/Widgets/cipherBreak';
import StationStatistics from './components/StationStatistics';

import Grid from '@suid/material/Grid';
import Cipher from './lib/Cipher';
import LineChart from './components/LineChart';

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

class CpuActivity implements Process {

    private maxDataPoints: number;
    private maxValue: number;
    private currentX: number;
    private state: CounterState;

    constructor(maxValue: number, maxDataPoints: number, state: CounterState) {
        this.maxDataPoints = maxDataPoints;
        this.maxValue = maxValue;
        this.state = state;
        const initialData = []
        for (let x = 0; x < this.maxDataPoints; x++) {
            initialData.push({ x, y: Math.random() * this.maxValue });
        }
        this.currentX = this.maxDataPoints - 1;
        this.state.setCpuActivity(initialData);
    }

    private randomizeData() {
        const x = ++this.currentX;
        const y = Math.random() * this.maxValue;
        const newData = [...this.state.cpuActivity];
        newData.splice(0, 1);
        newData.push({ x, y });
        this.state.setCpuActivity(newData);
    }

    public get id() {
        return 'cpuActivity';
    }

    public callback(frame: number) {
        if (parseFloat((frame / 0.01).toFixed(2)) % 1 === 0) {
            this.randomizeData();
        }
    }
}

const App: Component<{ stationStore?: StationStoreType }> = props => {
  
    // const navigate = useNavigate();
    const state = useStore();

    const addCipher = (c: Cipher) => {
        stationStore.os.addProcess(c);
    }

    const { stationStore } = props;
    state.setStation(stationStore);

    onMount(() => {
        console.log('Station mounted');
        const cpuActivity = new CpuActivity(100, 50, state);
        stationStore?.os?.addProcess(cpuActivity);
    });

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
                        <LineChart
                            data={state.cpuActivity}
                            maxDataPoints={50}
                            height={400}
                            xLabel="Time"
                            yLabel="Value"
                            strokeColor="#2563eb"
                            strokeWidth={2}
                        />
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

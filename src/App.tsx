import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import './App.css'
import create from 'solid-zustand';
import { useNavigate } from '@solidjs/router';

import { CounterState } from './includes/Counter.interface';

import Counter from './Counter';
import CounterDecrease from './CounterDecrease';
import { Button } from '@suid/material';

import { StationStoreType } from './includes/Process.interface';
import { Component } from 'solid-js';

import CipherBreak from './components/Widgets/cipherBreak';

import Grid from '@suid/material/Grid';
import Cipher from './lib/Cipher';

const useStore = create<CounterState>(set => ({
    count: 1,
    increase: () => set(state => ({ count: state.count + 1 })),
    decrease: () => set(state => ({ count: Math.max(1, state.count - 1) })),
    cipher: null,
    setCipher: (cipher: Cipher) => set(() => ({ cipher }))
}));

const App: Component<{ stationStore?: StationStoreType }> = props => {
  
    const navigate = useNavigate();
    const state = useStore();

    const addCipher = () => {
        const c = new Cipher(20, 10, cssClasses);
        state.setCipher(c);
        console.log('Adding cipher!', c);
        stationStore.os.addProcess(c);
    }

    const cssClasses = [ 'breaking-1', 'breaking-2', 'breaking-3', 'breaking-4' ];

    const { stationStore } = props;

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
                <Counter store={state} />
                <CounterDecrease store={state} />
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR<br />
                    <code>{stationStore.frame}</code>
                </p>
            </div>
            <div class="card">
                <Grid container>
                    <Grid item xs={4}>
                        <CipherBreak cipher={state.cipher} width={20} addCipher={addCipher} />
                    </Grid>
                </Grid>
            </div>
            <div class="card">
                <Button variant='contained' onClick={() => navigate('/second')}>Go to second app</Button>
            </div>
            <p class="read-the-docs">
                Click on the Vite and Solid logos to learn more
            </p>
        </>
    )
}

export default App

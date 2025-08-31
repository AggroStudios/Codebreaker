import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import './App.css'
import create from 'solid-zustand';
import { Button } from '@suid/material';

import { useNavigate } from '@solidjs/router';
import { CounterState } from './includes/Counter.interface';

import Counter from './Counter';
import CounterDecrease from './CounterDecrease';
import Cipher from './lib/Cipher';

const useStore = create<CounterState>(set => ({
    count: 0,
    increase: () => set(state => ({ count: state.count + 1 })),
    decrease: () => set(state => ({ count: Math.max(0, state.count - 1)})),
    cipher: null,
    setCipher: (cipher: Cipher) => set(() => ({ cipher })),
}));

function SecondApp() {
    const navigate = useNavigate();
    const state = useStore();
    return (
        <>
            <div>
                <a href="https://solidjs.com" target="_blank">
                    <img src={solidLogo} class="logo solid" alt="Solid logo" />
                </a>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} class="logo" alt="Vite logo" />
                </a>
            </div>
            <h1>Solid + Vite</h1>
            <div class="card">
                <Counter store={state} />
                <CounterDecrease store={state} />
                <p>
                    Edit <code>src/SecondApp.tsx</code> and save to test HMR
                </p>
            </div>
            <div class="card">
                <Button variant='contained' onClick={() => navigate('/')}>Go to first app</Button>
            </div>
            <p class="read-the-docs">
                Click on the Vite and Solid logos to learn more
            </p>
        </>
    );
}

export default SecondApp

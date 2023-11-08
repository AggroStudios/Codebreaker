import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import './App.css'
import create from 'solid-zustand';
import { useNavigate } from '@solidjs/router';

import { CounterState } from './includes/Counter.interface';

import Counter from './Counter';
import CounterDecrease from './CounterDecrease';
import { Button } from '@suid/material';

import { GameStoreType } from './includes/Process.interface';
import { Component } from 'solid-js';

import CipherBreak from './components/widgets/cipherBreak';

const useStore = create<CounterState>(set => ({
  count: 1,
  increase: () => set(state => ({ count: state.count + 1 })),
  decrease: () => set(state => ({ count: Math.max(1, state.count - 1) }))
}));

const App: Component<{ gcStore?: GameStoreType }> = props => {
  
  const navigate = useNavigate();
  const state = useStore();

  const { gcStore } = props;

  console.log('gcStore: ', gcStore);

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
          <code>{gcStore.frame}</code>
        </p>
      </div>
      <div class="card">
        <CipherBreak gameController={gcStore.game} />
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

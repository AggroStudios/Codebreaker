import { Component } from 'solid-js';
import { Button } from '@suid/material';

import { CounterState } from './includes/Counter.interface';
  
const Counter: Component<{ store: CounterState }> = props => {
    const state = props.store;
    return (
        <Button variant="contained" onClick={state.decrease}>
            Hello, world! {state.count}
        </Button>
    );
};

export default Counter;
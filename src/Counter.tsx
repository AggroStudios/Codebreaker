import { Component } from 'solid-js';
import { Button } from '@suid/material';

import { CounterState } from './includes/Counter.interface';

type MyGeneric = {
    store: CounterState,
    banana?: string,
};

const Counter: Component<MyGeneric> = props => {
    const state = props.store;
    const test = props.banana || 'banana';
    return (
        <Button variant="contained" onClick={state.increase}>
            Hello, {test}! {state.count}
        </Button>
    );
};

export default Counter;
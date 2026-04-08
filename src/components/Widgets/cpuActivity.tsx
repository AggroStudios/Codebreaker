import { Component, onMount } from 'solid-js';
import LineChart from '../LineChart';
import { CounterState } from '../../includes/Counter.interface';
import CpuActivity from '../../lib/CpuActivity';

export const CpuActivityWidget: Component<{ state: CounterState, title?: string }> = (props) => {

    const { state, title } = props;
    const { station } = state;
    onMount(() => {
        const cpuActivity = new CpuActivity(100, 50, state);
        station?.os?.addProcess(cpuActivity);
    });

    return (
        <LineChart
            title={title}
            data={state.cpuActivity}
            maxDataPoints={50}
            height={300}
            margin={{ top: 20, right: 80, bottom: 40, left: 60 }}
            xLabel="Time"
            yLabel="% Usage"
            strokeColor="#2563eb"
            strokeWidth={2}
        />
    )
}
import LineChart from '../LineChart';
import { useStationState } from '../../stores/stationContext';

export function CpuActivityWidget({ title }: { title?: string }) {
    const cpuActivity = useStationState((s) => s.cpuActivity);

    return (
        <LineChart
            title={title}
            data={cpuActivity}
            maxDataPoints={50}
            height={300}
            margin={{ top: 20, right: 80, bottom: 40, left: 60 }}
            xLabel="Time"
            yLabel="% Usage"
            strokeColor="rgba(10, 245, 176, 0.5)"
            strokeWidth={2}
            markerColor="var(--accent)"
            minValue={0}
            maxValue={100}
        />
    );
}

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
            strokeColor="#2563eb"
            strokeWidth={2}
            minValue={0}
            maxValue={100}
        />
    );
}

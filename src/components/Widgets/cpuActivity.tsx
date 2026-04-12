import { Component } from "solid-js";
import LineChart from "../LineChart";
import { StationStoreType } from "../../includes/Process.interface";

export const CpuActivityWidget: Component<{
    stationStore: StationStoreType;
    title?: string;
}> = (props) => {
    const { stationStore, title } = props;

    return (
        <LineChart
            title={title}
            data={stationStore.cpuActivity}
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
};

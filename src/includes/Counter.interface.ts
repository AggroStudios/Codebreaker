import { StationStoreType } from "./Process.interface";

export interface CounterState {
    runningProcesses: string[];
    addProcess: (id: string) => void;
    removeProcess: (id: string) => void;
    station: StationStoreType;
    setStation: (station: StationStoreType) => void;
}

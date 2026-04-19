import { ICipherType } from "./Cipher.interface";
import { StationStoreType } from "./Process.interface";

export interface CounterState {
    runningProcesses: {id: string, type: ICipherType}[];
    addProcess: (id: string, type: ICipherType) => void;
    removeProcess: (id: string) => void;
    station: StationStoreType;
    setStation: (station: StationStoreType) => void;
}

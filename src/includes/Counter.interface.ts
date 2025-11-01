import Cipher from '../lib/Cipher';
import { StationStoreType } from './Process.interface';

export interface CounterState {
    count: number,
    increase: () => void,
    decrease: () => void,
    cipher?: Cipher,
    setCipher: (cipher: Cipher) => void,
    station: StationStoreType,
    setStation: (station: StationStoreType) => void,
    cpuActivity: { x: number, y: number }[],
    setCpuActivity: (cpuActivity: { x: number, y: number }[]) => void,
};
import Cipher from '../lib/Cipher';

export interface CounterState {
    count: number,
    increase: () => void,
    decrease: () => void,
    cipher?: Cipher,
    setCipher: (cipher: Cipher) => void,
};
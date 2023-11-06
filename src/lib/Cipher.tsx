import Process from "../includes/Process.interface";
import { CipherProps } from '../includes/Cipher.interface';

export default class Cipher implements Process {

    public get id() {
        return 'cipher';
    }

    public callback(frame: number, count: number, exponent: number) {

    }
};
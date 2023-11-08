import Process from "../includes/Process.interface";

export default class Cipher implements Process {

    public get id() {
        return 'cipher';
    }

    public callback(frame: number) {
        console.log(`Frame: ${frame}`);
    }
};
import { PlayerState } from '../includes/Player.interface';
import Process from '../includes/Process.interface';

export default class Statistics implements Process {
    private _playerStore: PlayerState;

    constructor(playerStore: PlayerState) {
        this._playerStore = playerStore;
    }

    public get id() {
        return 'statistics';
    }

    public callback(frames: number) {
        if (Number(parseFloat(frames.toFixed(3)) * 1000) % 120 === 0) {
            this._playerStore.updateTotalPlayedTime(Date.now());
        }
    }
}
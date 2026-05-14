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
        // The OS worker advances `frames` by 0.001 every 1/60s tick and rolls
        // over at 0.6, so this guard fires once every ~2 seconds (every 120
        // hundredths of a frame) — the cadence we want for income sampling.
        if (Number(parseFloat(frames.toFixed(3)) * 1000) % 120 !== 0) return;

        this._playerStore.updateTotalPlayedTime(Date.now());

        // After updating totalPlayedTime, derive the instantaneous income
        // rate ($/s) from lifetime totals and append it to the rolling
        // history. The store enforces the window length and persistence.
        const stats = this._playerStore.player.statistics;
        const seconds = stats.totalPlayedTime / 1000;
        const rate = seconds > 0 ? stats.totalMoneyEarned / seconds : 0;
        this._playerStore.pushIncomeRate(rate);
    }
}
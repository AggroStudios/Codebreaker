import Process from '../includes/Process.interface';
import OperatingSystem from './OperatingSystem';
import { ScreenGlowType } from '../components/ScreenGlow';
import { pickRandomMiniGame, useThreatsStore } from '../stores/threats';

const FPS = 60;
const CHECK_INTERVAL_S = 600;
const THREAT_CHANCE = 0.05;
// const THREAT_CHANCE = 1;

export default class ThreatWatcher implements Process {
    private _accum = 0;
    private _os: OperatingSystem;

    constructor(os: OperatingSystem) {
        this._os = os;
    }

    public get id() {
        return 'threat-watcher';
    }

    public callback(_frame: number, _count: number, exponent: number) {
        if (useThreatsStore.getState().active) return;

        this._accum += (1 / FPS) * Math.max(1, exponent);
        if (this._accum < CHECK_INTERVAL_S) return;
        this._accum = 0;

        if (Math.random() >= THREAT_CHANCE) return;

        useThreatsStore.getState().triggerThreat(pickRandomMiniGame());
        this._os.stopGameLoop();
        const station = this._os.station;
        if (station) {
            station.setGlowType(ScreenGlowType.ALERT);
            station.setGlowActive(true);
        }
    }
}

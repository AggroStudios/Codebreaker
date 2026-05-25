import Process from '../includes/Process.interface';
import OperatingSystem from './OperatingSystem';
import { ScreenGlowType } from '../components/ScreenGlow';
import { pickRandomMiniGame, useThreatsStore } from '../stores/threats';
import { usePlayerStore } from '../stores/player';
import { sentinelTierCount } from '../includes/sentinel';

const FPS = 60;
const CHECK_INTERVAL_S = 600;
const THREAT_CHANCE = 0.05;
// const THREAT_CHANCE = 1;

/**
 * Real-time grace after the watcher is constructed during which no threat
 * can fire. Independent of game-speed exponent so an overclocked save can't
 * be ambushed within seconds of launch.
 */
const STARTUP_GRACE_MS = 5 * 60 * 1000;

/**
 * Real-time cooldown after a threat is resolved before another can fire.
 * The accum check runs on game time (scaled by exponent), so without this
 * a high-exponent save would queue up another threat within seconds.
 */
const POST_RESOLVE_COOLDOWN_MS = 5 * 60 * 1000;

export default class ThreatWatcher implements Process {
    private _accum: number = 0;
    private _startTime = Date.now();
    private _cooldownUntil = 0;
    private _wasActive = false;
    private _os: OperatingSystem;

    constructor(os: OperatingSystem) {
        this._os = os;
    }

    public get id() {
        return 'threat-watcher';
    }

    public callback(_frame: number, _count: number, exponent: number) {
        
        if (!this._os.isRunning) return;

        const isActive = useThreatsStore.getState().active;

        // Detect the active → !active transition (player resolved the threat)
        // and start the real-time cooldown. Done before the early-return so
        // we never miss the edge.
        const now = Date.now();

        if (this._wasActive && !isActive) {
            this._cooldownUntil = now + POST_RESOLVE_COOLDOWN_MS;
            this._accum = 0;
        }
        this._wasActive = isActive;

        if (isActive) return;
        if (now - this._startTime < STARTUP_GRACE_MS) return;
        if (now < this._cooldownUntil) return;

        this._accum += (1 / FPS) * Math.max(1, exponent);

        if (this._accum === 0 || this._accum < CHECK_INTERVAL_S) return;
        this._accum = 0;

        const tiers = sentinelTierCount(usePlayerStore.getState().purchasedUpgrades);
        const effectiveChance = Math.max(0, THREAT_CHANCE - tiers * 0.01);
        
        if (effectiveChance <= 0) return;
        const randomNum = Math.random();
        if (randomNum >= effectiveChance) return;

        useThreatsStore.getState().triggerThreat(pickRandomMiniGame());
        this._os.stopGameLoop();
        const station = this._os.station;
        if (station) {
            station.setGlowType(ScreenGlowType.ALERT);
            station.setGlowActive(true);
        }
    }
}

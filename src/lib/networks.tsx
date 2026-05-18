import Process from '../includes/Process.interface';
import { useNetworksStore } from '../stores/networks';

/** OS game loop runs at 60 FPS. */
const FPS = 60;

/** Cadences from the design — utilization drift / firewall stats / traffic samples. */
const UTIL_INTERVAL_S = 0.8;
const FW_INTERVAL_S = 1.2;
const TRAFFIC_INTERVAL_S = 0.7;

export default class Networks implements Process {
    private _utilAccum = 0;
    private _fwAccum = 0;
    private _trafficAccum = 0;

    public get id() {
        return 'networks-sim';
    }

    public callback(_frame: number, _count: number, exponent: number) {
        const dt = (1 / FPS);
        const speed = exponent;
        this._utilAccum += dt;
        this._fwAccum += dt;
        this._trafficAccum += dt;

        const store = useNetworksStore.getState();

        if (this._utilAccum >= UTIL_INTERVAL_S) {
            this._utilAccum = 0;
            store.tickLinkUtilization(speed);
        }
        if (this._fwAccum >= FW_INTERVAL_S) {
            this._fwAccum = 0;
            store.tickFirewallStats(speed);
        }
        if (this._trafficAccum >= TRAFFIC_INTERVAL_S) {
            this._trafficAccum = 0;
            store.tickTraffic(speed);
        }
    }
}

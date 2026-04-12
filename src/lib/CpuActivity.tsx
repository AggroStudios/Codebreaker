import Process, { StationStoreType } from "../includes/Process.interface";

export default class CpuActivity implements Process {
    private maxDataPoints: number;
    private maxValue: number;
    private currentX: number;
    private _state: StationStoreType | null;

    constructor(
        maxValue: number,
        maxDataPoints: number,
        state: StationStoreType | null = null,
    ) {
        this.maxDataPoints = maxDataPoints;
        this.maxValue = maxValue;
        this._state = state;
        this.initializeData();
    }

    private initializeData() {
        if (!this._state) return;
        const initialData = [];
        for (let x = 0; x < this.maxDataPoints; x++) {
            const jitter = Math.max(0, Math.round(Math.random() * 4 - 2));
            initialData.push({ x, y: jitter });
        }
        this.currentX = this.maxDataPoints - 1;
        this._state.setCpuActivity(initialData);
    }

    public usage(value: number) {
        if (!this._state) return;
        const jitter = Math.max(0, Math.round(Math.random() * 4 - 2));
        const x = ++this.currentX;
        const y = Math.min(this.maxValue, Math.min(100, value + jitter));
        const newData = [];
        for (let i = 1; i < this._state.cpuActivity.length; i++) {
            // Get rid of the proxy, it messes everything up
            newData.push(
                JSON.parse(JSON.stringify(this._state.cpuActivity[i])),
            );
        }
        newData.push({ x, y });
        this._state.setCpuActivity(newData);
    }

    public get id() {
        return "cpuActivity";
    }

    public set state(state: StationStoreType) {
        this._state = state;
        this.initializeData();
    }

    public callback() {
        // No callback needed
    }
}

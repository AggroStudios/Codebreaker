import { CounterState } from "../includes/Counter.interface";
import Process from "../includes/Process.interface";

export default class CpuActivity implements Process {

    private maxDataPoints: number;
    private maxValue: number;
    private currentX: number;
    private state: CounterState;

    constructor(maxValue: number, maxDataPoints: number, state: CounterState) {
        this.maxDataPoints = maxDataPoints;
        this.maxValue = maxValue;
        this.state = state;
        const initialData = []
        for (let x = 0; x < this.maxDataPoints; x++) {
            initialData.push({ x, y: Math.random() * this.maxValue });
        }
        this.currentX = this.maxDataPoints - 1;
        this.state.setCpuActivity(initialData);
    }

    private randomizeData() {
        const x = ++this.currentX;
        const y = Math.random() * this.maxValue;
        const newData = [...this.state.cpuActivity];
        newData.splice(0, 1);
        newData.push({ x, y });
        this.state.setCpuActivity(newData);
    }

    public get id() {
        return 'cpuActivity';
    }

    public callback(frame: number) {
        if (parseFloat((frame / 0.01).toFixed(2)) % 1 === 0) {
            this.randomizeData();
        }
    }
}

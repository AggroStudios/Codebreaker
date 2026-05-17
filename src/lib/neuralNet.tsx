import Process from '../includes/Process.interface';
import { useNeuralNetStore } from '../stores/neuralNet';

/** OS game-loop runs at 60 FPS; each callback advances 1/60 of a "real" second. */
const FPS = 60;

/** Bank training time into the store at this cadence (seconds). */
const TICK_INTERVAL_S = 0.2;

export default class NeuralNet implements Process {
    private _accum = 0;

    public get id() {
        return 'neural-net-training';
    }

    public callback(_frame: number, _count: number, exponent: number) {
        const store = useNeuralNetStore.getState();
        if (!store.active || !store.currentCipher) return;

        this._accum += (1 / FPS) * exponent;
        if (this._accum >= TICK_INTERVAL_S) {
            store.tick(this._accum);
            this._accum = 0;
        }
    }
}

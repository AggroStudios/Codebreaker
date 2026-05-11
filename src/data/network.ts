import Process, {
    INetworkType,
    NetworkConnectionType,
} from '../includes/Process.interface';

export class NetworkDSL implements INetworkType {
    connectionType: NetworkConnectionType = NetworkConnectionType.dsl;
    speedInBps = 10000;

    toString() {
        return `${this.connectionType} - ${this.speedInBps / 1000} Mbps`;
    }
}

export class NetworkCable implements INetworkType {
    connectionType: NetworkConnectionType = NetworkConnectionType.cable;
    speedInBps = 100000;

    toString() {
        return `${this.connectionType} - ${this.speedInBps / 1000} Mbps`;
    }
}

export class NetworkFiber implements INetworkType {
    connectionType: NetworkConnectionType = NetworkConnectionType.fiber;
    speedInBps = 1000000;

    toString() {
        return `${this.connectionType} - ${this.speedInBps / 1000 / 1000} Gbps`;
    }
}

export class NetworkFiber10Gbps implements INetworkType {
    connectionType: NetworkConnectionType = NetworkConnectionType.fiber;
    speedInBps = 10000000;

    toString() {
        return `${this.connectionType} - ${this.speedInBps / 1000 / 1000} Tbps`;
    }
}

export class Networking {
    private _network: INetworkType;
    private _stack: Array<Process> = [];

    constructor(network: INetworkType) {
        this._network = network;
    }

    public addProcess(process: Process) {
        this._stack.push(process);
    }

    public removeProcess(process: Process) {
        this._stack = this._stack.filter((p) => p !== process);
    }

    public get stack() {
        return this._stack;
    }

    public get network() {
        return this._network;
    }
}

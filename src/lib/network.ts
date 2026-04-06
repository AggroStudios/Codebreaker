import { INetworkType, NetworkConnectionType } from "../includes/Process.interface";

export class NetworkDSL implements INetworkType {
    connectionType: NetworkConnectionType = NetworkConnectionType.dsl;
    speedInBps = 10000000;

    toString() {
        return `${this.connectionType} - ${this.speedInBps / 1000 / 1000} Mbps`;
    }
}

export class NetworkCable implements INetworkType {
    connectionType: NetworkConnectionType = NetworkConnectionType.cable;
    speedInBps = 100000000;

    toString() {
        return `${this.connectionType} - ${this.speedInBps / 1000 / 1000} Mbps`;
    }
}

export class NetworkFiber implements INetworkType {
    connectionType: NetworkConnectionType = NetworkConnectionType.fiber;
    speedInBps = 1000000000;

    toString() {
        return `${this.connectionType} - ${this.speedInBps / 1000 / 1000 / 1000} Gbps`;
    }
}
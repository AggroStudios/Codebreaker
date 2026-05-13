import Process from '../includes/Process.interface';
import { DataCentersStore, useDataCentersStore } from '../stores/dataCenters';

export default class DataCenter implements Process {
    private _currentCount: number = 0;
    private _dataCenterStore: DataCentersStore;

    constructor() {
        this._dataCenterStore = useDataCentersStore.getState();
    }

    public get id() {
        return 'dataCenter-provisioning';
    }

    public callback(_: number, count: number) {
        // No callback needed
        const dayValue = Math.floor(count / 24);
        if (dayValue === this._currentCount) {
            return;
        }
        this._currentCount = dayValue;
        Object.keys(this._dataCenterStore.contracts).forEach(this._dataCenterStore.increaseSignedDays);
        
        const provisioningContractsIds = Object.keys(this._dataCenterStore.contracts).filter((contractId) => this._dataCenterStore.contracts[contractId].status === 'PROVISIONING');
        if (provisioningContractsIds.length === 0) {
            return;
        }
        for (const contractId of provisioningContractsIds) {
            if (this._dataCenterStore.contracts[contractId].signedDays > 3) {
                this._dataCenterStore.activateContract(contractId);
            }
        }
    }
}
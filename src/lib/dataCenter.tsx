import { DATA_CENTERS } from '../data/dataCenter';
import { PlayerState } from '../includes/Player.interface';
import Process from '../includes/Process.interface';
import { DataCentersStore, useDataCentersStore } from '../stores/dataCenters';
import { playerStoreProxy } from '../stores/player';

export default class DataCenter implements Process {
    private _currentCount: number = 0;
    private _playerStore: PlayerState;

    constructor() {
        this._playerStore = playerStoreProxy;
        this.activateContracts();
    }

    public get id() {
        return 'dataCenter-provisioning';
    }

    /** Always read the live store state. Caching the snapshot from
     *  getState() in the constructor freezes `contracts` to whatever existed
     *  at construction, so contracts signed later are never seen and
     *  signedDays increments are never observed. */
    private get _dataCenterStore(): DataCentersStore {
        return useDataCentersStore.getState();
    }

    private activateContracts() {
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

    private chargeDailyLeaseCosts() {
        let totalCost = 0;
        Object.keys(this._dataCenterStore.contracts).forEach((contractId) => {
            const contract = this._dataCenterStore.contracts[contractId];
            if (contract.status === 'ACTIVE') {
                totalCost += DATA_CENTERS.find((dc) => dc.id === contractId)?.baseLeaseDay || 0;
            }
        });
        if (totalCost > 0) {
            if (this._playerStore.player.money < totalCost) {
                return;
            }
            this._playerStore.removeMoney(totalCost);
        }
    }

    public callback(_: number, count: number) {
        // No callback needed
        const dayValue = Math.floor(count / 24);
        if (dayValue === this._currentCount) {
            return;
        }
        this._currentCount = dayValue;
        Object.keys(this._dataCenterStore.contracts).forEach(this._dataCenterStore.increaseSignedDays);

        this.activateContracts();
        this.chargeDailyLeaseCosts();
    }
}
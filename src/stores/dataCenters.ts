import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IDataCenterContractsByRegion } from '../includes/DataCenter.interface';
import { omit } from 'lodash';

export interface IDataCenterContractUpgrade {
    racks?: number;
    powerKw?: number;
    uplinkGbps?: number;
}

export type DataCentersStore = {
    contracts: IDataCenterContractsByRegion;
    setContracts: (contracts: IDataCenterContractsByRegion) => void;
    upgradeContract: (contractId: string, upgrade: IDataCenterContractUpgrade) => void;
    activateContract: (contractId: string) => void;
    increaseSignedDays: (contractId: string) => void;
    deleteContract: (contractId: string) => void;
    resetContract: (contractId: string) => void;
};

export const useDataCentersStore = create<DataCentersStore>()(
    persist(
        (set) => ({
            contracts: {},
            setContracts: (contracts) => set({ contracts }),
            upgradeContract: (contractId, upgrade) => set((state) => ({
                contracts: {
                    ...state.contracts,
                    [contractId]: {
                        ...state.contracts[contractId],
                        ...upgrade,
                    },
                },
            })),
            activateContract: (contractId) => set((state) => ({
                contracts: {
                    ...state.contracts,
                    [contractId]: {
                        ...state.contracts[contractId],
                        status: 'ACTIVE',
                    },
                },
            })),
            increaseSignedDays: (contractId) => set((state) => ({
                contracts: {
                    ...state.contracts,
                    [contractId]: {
                        ...state.contracts[contractId],
                        signedDays: state.contracts[contractId].signedDays + 1,
                    },
                },
            })),
            deleteContract: (contractId) => set((state) => ({
                contracts: omit(state.contracts, [contractId]),
            })),
            resetContract: (contractId) => set((state) => ({
                contracts: {
                    ...state.contracts,
                    [contractId]: {
                        ...state.contracts[contractId],
                        signedDays: 0,
                        racks: 1,
                        powerKw: 4,
                        uplinkGbps: 1,
                        status: 'PROVISIONING',
                    },
                },
            })),
        }),
        {
            name: 'dataCenters-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ contracts: state.contracts }),
        },
    ),
);
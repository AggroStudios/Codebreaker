export interface IDataCenter {
    id: string;
    code: string;
    name: string;
    city: string;
    lng: number;
    lat: number;
    provider: string;
    tier: string;
    baseLeaseDay: number;
    ratePerKw: number;
    latency: number;
}
  
export interface IDataCenterContractProps {
    dataCenter: IDataCenter;
    signed: boolean;
    selected: boolean;
    onClick: (id: string) => void;
    scale?: number;
}

export type IDataCenterContractStatus = 'ACTIVE' | 'PROVISIONING';

export interface IDataCenterContract {
    racks: number;
    rackCap: number;
    powerKw: number;
    uplinkGbps: number;
    signedDays: number;
    status: IDataCenterContractStatus;
}

export type IDataCenterContractsByRegion = Record<string, IDataCenterContract>;
import { Networking } from '../lib/network';
import { ICipherType } from './Cipher.interface';
import { IMemoryType, IProcessorType, IStorageType } from './Process.interface';

export enum ServerStatus {
    ONLINE = 'Online',
    OFFLINE = 'Offline',
    MAINTENANCE = 'Maintenance',
    PROVISIONING = 'Provisioning',
    DEPROVISIONING = 'Deprovisioning',
    REBOOTING = 'Rebooting',
    SHUTDOWN = 'Shutdown',
    STARTUP = 'Startup',
    RESTARTING = 'Restarting',
    CRASHED = 'Crashed',
    DEGRADED = 'Degraded',
}

export enum ServerTier {
    ENTRY = 'Entry',
    STANDARD = 'Standard',
    PRO = 'Pro',
    ENTERPRISE = 'Enterprise',
    QUANTUM = 'Quantum',
}

export const ServerTiers: Record<ServerTier, string> = {
    [ServerTier.ENTRY]: 'T1',
    [ServerTier.STANDARD]: 'T2',
    [ServerTier.PRO]: 'T3',
    [ServerTier.ENTERPRISE]: 'T4',
    [ServerTier.QUANTUM]: 'T5',
}

export enum ServerFormFactor {
    ONE_U = '1U',
    TWO_U = '2U',
    THREE_U = '3U',
    FOUR_U = '4U',
    FIVE_U = '5U',
}

export interface Server {
    id: string;
    manufacturer: string;
    model: string;
    tier: ServerTier;
    formFactor: ServerFormFactor;
    cpu: IProcessorType;
    memory: IMemoryType;
    storage: IStorageType[];
    network: Networking;
    powerConsumption: number;
    status: ServerStatus;
    price: number;
    load: number;
    processes: ICipherType[];
}
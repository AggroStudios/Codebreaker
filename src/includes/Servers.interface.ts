import { Networking } from '../data/network';
import { ICipherType } from './Cipher.interface';
import { IDataCenter } from './DataCenter.interface';
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

export const ServerTierColor: Record<ServerTier, string> = {
    [ServerTier.ENTRY]: '#ffffff',
    [ServerTier.STANDARD]: '#26c6da',
    [ServerTier.PRO]: '#0af5b0',
    [ServerTier.ENTERPRISE]: '#ff9800',
    [ServerTier.QUANTUM]: '#9c7fe0',
}

export const ServerTiers: Record<ServerTier, string> = {
    [ServerTier.ENTRY]: 'T1',
    [ServerTier.STANDARD]: 'T2',
    [ServerTier.PRO]: 'T3',
    [ServerTier.ENTERPRISE]: 'T4',
    [ServerTier.QUANTUM]: 'T5',
}

export interface ServerTierRecord {
    id: ServerTier;
    label: string;
    count: number;
    swatch: string;
}

export const ServerTiersArray: ServerTierRecord[] = Object.values(ServerTier).map((tier) => ({
    id: tier as ServerTier,
    label: tier,
    count: 0,
    swatch: ServerTierColor[tier],
}));

export enum ServerFormFactor {
    ONE_U = '1U',
    TWO_U = '2U',
    THREE_U = '3U',
    FOUR_U = '4U',
    FIVE_U = '5U',
}

export interface ServerFormFactorRecord {
    id: ServerFormFactor;
    label: string;
}

export const ServerFormFactorsArray: ServerFormFactorRecord[] = Object.values(ServerFormFactor).map((formFactor) => ({
    id: formFactor as ServerFormFactor,
    label: formFactor,
}));

export interface IRack {
    id: string;
    dataCenter: IDataCenter;
    size: number;
}

export interface IRackedServer {
    rack: IRack;
    server: Server;
    position: number;
}

export interface Server {
    id?: string;
    name?: string;
    manufacturer: string;
    manufacturerLogoSrc?: string;
    model: string;
    tier: ServerTier;
    imageSrc?: string;
    formFactor: ServerFormFactor;
    cpu: IProcessorType;
    threadingFactor: number;
    cpuAmount: number;
    memory: IMemoryType;
    storage: IStorageType[];
    network: Networking;
    networkPorts: number;
    powerConsumption: number;
    status?: ServerStatus;
    price: number;
    load?: number;
    processes?: ICipherType[];
    discount?: number;
}
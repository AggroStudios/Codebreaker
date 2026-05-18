import { DATA_CENTERS } from '../../data/dataCenter';
import { useDataCentersStore } from '../../stores/dataCenters';
import { NetNode } from '../../includes/networks.interface';

const STATION_NODE: NetNode = {
    id: 'station',
    code: 'STN',
    name: 'Operator Station',
    city: 'Home',
    provider: 'Local',
    tier: '—',
    isStation: true,
    uplinkGbps: 1,
};

const asTier = (t: string): NetNode['tier'] => {
    if (t === 'I' || t === 'II' || t === 'III' || t === 'IV') return t;
    return '—';
};

/**
 * Network nodes the operator can wire up: the Station + every data center the
 * player has a contract at. The list updates as contracts come and go.
 */
export const useNetworkNodes = (): NetNode[] => {
    const contracts = useDataCentersStore((s) => s.contracts);
    const contractIds = Object.keys(contracts);

    const contractedNodes: NetNode[] = contractIds
        .map((id) => {
            const dc = DATA_CENTERS.find((d) => d.id === id);
            if (!dc) return null;
            return {
                id: dc.id,
                code: dc.code,
                name: dc.name,
                city: dc.city,
                provider: dc.provider,
                tier: asTier(dc.tier),
                uplinkGbps: contracts[dc.id].uplinkGbps,
            } satisfies NetNode;
        })
        .filter((n): n is NetNode => n != null);

    return [STATION_NODE, ...contractedNodes];
};

/** Same data, plus the prototype seed nodes when the player has no contracts yet, so the seed links/firewalls still render. */
const SEED_NODES: NetNode[] = [
    { id: 'us-west',      code: 'USW-1', name: 'US West',         city: 'San Francisco, CA', provider: 'OmniNet',   tier: 'III', uplinkGbps:  40 },
    { id: 'us-east',      code: 'USE-1', name: 'US East',         city: 'Ashburn, VA',       provider: 'OmniNet',   tier: 'IV',  uplinkGbps: 100 },
    { id: 'eu-central',   code: 'EUC-1', name: 'EU Central',      city: 'Frankfurt, DE',     provider: 'EuroFiber', tier: 'IV',  uplinkGbps:  25 },
    { id: 'ap-northeast', code: 'APN-1', name: 'Asia Northeast',  city: 'Tokyo, JP',         provider: 'KoyoNet',   tier: 'IV',  uplinkGbps:  10 },
    { id: 'eu-north',     code: 'EUN-1', name: 'EU North',        city: 'Stockholm, SE',     provider: 'NordCool',  tier: 'III', uplinkGbps:  10 },
];

/**
 * Like `useNetworkNodes` but falls back to the prototype seed list when the
 * player has no datacenter contracts yet — so the seeded links/firewalls
 * still resolve to real nodes on a fresh save.
 */
export const useNetworkNodesWithSeed = (): NetNode[] => {
    const live = useNetworkNodes();
    if (live.length > 1) return live;
    return [live[0], ...SEED_NODES];
};

export const findNode = (nodes: NetNode[], id: string): NetNode | undefined =>
    nodes.find((n) => n.id === id);

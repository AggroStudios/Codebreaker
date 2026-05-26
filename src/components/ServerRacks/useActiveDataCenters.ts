import { useMemo } from 'react';
import { useParams } from 'react-router';

import { DATA_CENTERS } from '../../data/dataCenter';
import { useDataCentersStore } from '../../stores/dataCenters';
import { IDataCenter, IDataCenterContract } from '../../includes/DataCenter.interface';

export interface ActiveDcContract {
    dataCenter: IDataCenter;
    contract: IDataCenterContract;
}

/** Data centers the player has signed AND active contracts at, joined with full catalog info. */
export const useActiveDataCenters = (): ActiveDcContract[] => {
    const contracts = useDataCentersStore((s) => s.contracts);
    return useMemo(() => {
        const out: ActiveDcContract[] = [];
        for (const [id, contract] of Object.entries(contracts)) {
            if (!['ACTIVE', 'SUSPENDED'].includes(contract.status)) continue;
            const dc = DATA_CENTERS.find((d) => d.id === id);
            if (!dc) continue;
            out.push({ dataCenter: dc, contract });
        }
        return out;
    }, [contracts]);
};

/** `dcId` from the `/racks/:dcId?` route parameter — undefined when unset. */
export const useDcIdParam = (): string | undefined => {
    const params = useParams<{ dcId?: string }>();
    return params.dcId;
};

import { createContext, useContext, type ReactNode } from 'react';
import type { StationStoreType } from '../includes/Process.interface';
import type { UseStationStore } from './station';

type StationContextValue = {
    useStationStore: UseStationStore;
    stationProxy: StationStoreType;
};

const StationContext = createContext<StationContextValue | null>(null);

export function StationStoreProvider({
    useStationStore,
    stationProxy,
    children,
}: {
    useStationStore: UseStationStore;
    stationProxy: StationStoreType;
    children: ReactNode;
}) {
    return (
        <StationContext.Provider value={{ useStationStore, stationProxy }}>
            {children}
        </StationContext.Provider>
    );
}

export function useStationContext() {
    const ctx = useContext(StationContext);
    if (!ctx) {
        throw new Error(
            'useStationContext must be used within StationStoreProvider',
        );
    }
    return ctx;
}

export function useStationState<T>(selector: (state: StationStoreType) => T): T {
    const { useStationStore } = useStationContext();
    return useStationStore(selector);
}

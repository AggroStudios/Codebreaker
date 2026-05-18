import { useDataCentersStore } from '../stores/dataCenters';
import { useNetworksStore } from '../stores/networks';
import { useNeuralNetStore } from '../stores/neuralNet';
import { usePlayerStore } from '../stores/player';
import { useRacksStore } from '../stores/racks';
import { useServersStore } from '../stores/servers';

/**
 * Initiate a prestige: hard-resets the run state across every game store,
 * while preserving permanent progression (allocated skills, lifetime XP,
 * neural-net library, statistics).
 *
 * Caller must ensure the player meets the level requirement before calling.
 */
export const initiatePrestige = (): void => {
    usePlayerStore.getState().prestige();

    useServersStore.setState((state) => ({ ...state, purchasedServers: [] }));
    useDataCentersStore.setState((state) => ({ ...state, contracts: {} }));
    useRacksStore.setState((state) => ({ ...state, racks: [] }));
    useNetworksStore.setState((state) => ({ ...state, links: [] }));

    useNeuralNetStore.setState((state) => ({
        ...state,
        sessionSeconds: 0,
        currentCipher: null,
        active: false,
    }));
};

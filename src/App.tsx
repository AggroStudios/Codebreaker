import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './Layout';
import LoadingScreen from './components/LoadingScreen';

import { darkTheme } from './theme';

import { playerStoreProxy } from './stores/player';
import { createStationStore, makeStationProxy } from './stores/station';
import { StationStoreProvider } from './stores/stationContext';
import { useMusicPlayerStore } from './stores/musicPlayer';

import OperatingSystem from './lib/OperatingSystem';
import { CodiumProcessor } from './lib/processors';
import { preloadImages } from './lib/preloader';
import { Station } from './lib/station';
import { CodiumMemory } from './lib/memory';
import { CodiumStorageHdd } from './lib/storage';
import { NetworkDSL, Networking } from './lib/network';
import type { IStorageType } from './includes/Process.interface';

import TerminalController from './lib/terminal';
import { NotifierProvider } from './components/Notifier';
import { AnchorsProvider } from './components/AnchorsContext';

import './index.css';

const StationRoute = lazy(() => import('./Station'));
const LoginRoute = lazy(() => import('./components/Login'));
const ServersRoute = lazy(() => import('./Servers'));
const TerminalRoute = lazy(() => import('./components/Terminal'));
const UpgradesRoute = lazy(() => import('./pages/Upgrades'));

export default function App() {
    const [loadingProgress, setLoadingProgress] = useState(0);

    const bootstrap = useMemo(() => {
        const processor = new CodiumProcessor();
        const operatingSystem = new OperatingSystem(playerStoreProxy);
        const memory = new CodiumMemory();
        const storage: IStorageType[] = [new CodiumStorageHdd()];
        const network = new Networking(new NetworkDSL());

        const station = new Station(
            processor,
            operatingSystem,
            memory,
            storage,
            network,
        );

        const useStationStore = createStationStore(station);
        const stationProxy = makeStationProxy(useStationStore);
        operatingSystem.station = stationProxy;

        operatingSystem.addProcess({
            id: 'main',
            callback: stationProxy.callback,
        });

        const terminalController = new TerminalController();

        return { station, useStationStore, stationProxy, terminalController };
    }, []);

    useEffect(() => {
        preloadImages(setLoadingProgress);
        // Preload all route chunks in the background so navigation is instant
        import('./Station');
        import('./components/Login');
        import('./Servers');
        import('./components/Terminal');
        import('./pages/Upgrades');
    }, []);

    const { station, useStationStore, stationProxy, terminalController } =
        bootstrap;

    const handleLoadingHidden = useCallback(() => {
        useMusicPlayerStore.getState().play();
    }, []);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <NotifierProvider>
                <AnchorsProvider>
                    <StationStoreProvider
                        useStationStore={useStationStore}
                        stationProxy={stationProxy}
                    >
                        <BrowserRouter>
                            <Routes>
                                <Route element={<Layout />}>
                                    <Route index element={
                                        <TerminalRoute
                                            terminalController={
                                                terminalController
                                            }
                                            operatingSystem={
                                                station.operatingSystem
                                            }
                                        />
                                    } />
                                    <Route path="station" element={<StationRoute />} />
                                    <Route path="login" element={<LoginRoute />} />
                                    <Route path="servers" element={<ServersRoute />} />
                                    <Route path="upgrades" element={<UpgradesRoute />} />
                                    <Route path="*" />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </StationStoreProvider>
                </AnchorsProvider>
            </NotifierProvider>
            <LoadingScreen
                loading={loadingProgress}
                onHidden={handleLoadingHidden}
            />
        </ThemeProvider>
    );
}

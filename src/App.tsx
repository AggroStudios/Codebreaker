import { lazy, useEffect, useState } from 'react';
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
import { useAppReadyStore } from './stores/appReady';

import OperatingSystem from './lib/OperatingSystem';
import { preloadImages } from './lib/preloader';

import TerminalController from './lib/terminal';
import { NotifierProvider } from './components/Notifier';
import { AnchorsProvider } from './components/AnchorsContext';

import './index.css';
import Statistics from './lib/statistics';

const TerminalRoute = lazy(() => import('./pages/Terminal'));
const StationRoute = lazy(() => import('./pages/Station'));
const LoginRoute = lazy(() => import('./components/Login'));
const ServersRoute = lazy(() => import('./pages/Servers'));
const ServerRacksRoute = lazy(() => import('./pages/ServerRacks'));
const DataCentersRoute = lazy(() => import('./pages/DataCenters'));
const NetworksRoute = lazy(() => import('./pages/Networks'));
const DarkWebRoute = lazy(() => import('./pages/DarkWeb'));
const NeuralNetRoute = lazy(() => import('./pages/NeuralNet'));
const UpgradesRoute = lazy(() => import('./pages/Upgrades'));
const PrestigeRoute = lazy(() => import('./pages/Prestige'));
const StatisticsRoute = lazy(() => import('./pages/Statistics'));

export default function App() {
    const [loadingProgress, setLoadingProgress] = useState(0);

    const [bootstrap] = useState(() => {
        const useStationStore = createStationStore();
        const stationProxy = makeStationProxy(useStationStore);

        const operatingSystem = new OperatingSystem(playerStoreProxy);
        operatingSystem.station = stationProxy;
        stationProxy.os = operatingSystem;

        const statisticsProcess = new Statistics(playerStoreProxy);
        operatingSystem.addProcess(statisticsProcess);

        if (stationProxy.exponent) {
            operatingSystem.setExponent(stationProxy.exponent);
        }

        operatingSystem.addProcess({
            id: 'main',
            callback: stationProxy.callback,
        });

        if (stationProxy.isRunning) {
            operatingSystem.startGameLoop();
        }

        const terminalController = new TerminalController();

        return { operatingSystem, useStationStore, stationProxy, terminalController };
    });

    useEffect(() => {
        preloadImages(setLoadingProgress);
        // Preload all route chunks in the background so navigation is instant
        import('./pages/Terminal');
        import('./pages/Station');
        import('./components/Login');
        import('./pages/Servers');
        import('./pages/ServerRacks');
        import('./pages/DataCenters');
        import('./pages/Networks');
        import('./pages/DarkWeb');
        import('./pages/NeuralNet');
        import('./pages/Upgrades');
        import('./pages/Prestige');
        import('./pages/Statistics');
    }, []);

    const { operatingSystem, useStationStore, stationProxy, terminalController } =
        bootstrap;

    const handleLoadingHidden = () => {
        useMusicPlayerStore.getState().play();
        useAppReadyStore.getState().setAppReady();
    };

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
                                                operatingSystem
                                            }
                                        />
                                    } />
                                    <Route path="station" element={<StationRoute />} />
                                    <Route path="login" element={<LoginRoute />} />
                                    <Route path="servers" element={<ServersRoute />} />
                                    <Route path="racks" element={<ServerRacksRoute />} />
                                    <Route path="dataCenters" element={<DataCentersRoute />} />
                                    <Route path="networks" element={<NetworksRoute />} />
                                    <Route path="darkWeb" element={<DarkWebRoute />} />
                                    <Route path="neuralNet" element={<NeuralNetRoute />} />
                                    <Route path="upgrades" element={<UpgradesRoute />} />
                                    <Route path="prestige" element={<PrestigeRoute />} />
                                    <Route path="stats" element={<StatisticsRoute />} />
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

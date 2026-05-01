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

import OperatingSystem from './lib/OperatingSystem';
import { preloadImages } from './lib/preloader';

import TerminalController from './lib/terminal';
import { NotifierProvider } from './components/Notifier';
import { AnchorsProvider } from './components/AnchorsContext';

import './index.css';

const StationRoute = lazy(() => import('./pages/Station'));
const LoginRoute = lazy(() => import('./components/Login'));
const ServersRoute = lazy(() => import('./pages/Servers'));
const TerminalRoute = lazy(() => import('./pages/Terminal'));
const UpgradesRoute = lazy(() => import('./pages/Upgrades'));

export default function App() {
    const [loadingProgress, setLoadingProgress] = useState(0);

    const [bootstrap] = useState(() => {
        const useStationStore = createStationStore();
        const stationProxy = makeStationProxy(useStationStore);

        const operatingSystem = new OperatingSystem(playerStoreProxy);
        operatingSystem.station = stationProxy;
        stationProxy.os = operatingSystem;

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
        import('./pages/Station');
        import('./components/Login');
        import('./pages/Servers');
        import('./pages/Terminal');
        import('./pages/Upgrades');
    }, []);

    const { operatingSystem, useStationStore, stationProxy, terminalController } =
        bootstrap;

    const handleLoadingHidden = () => {
        useMusicPlayerStore.getState().play();
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

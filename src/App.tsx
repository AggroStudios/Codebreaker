import { lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { useSiteTheme } from './theme';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Layout from './Layout';
import LoadingScreen from './components/LoadingScreen';

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
import {
    GAME_PERSISTENCE_VERSION,
    PERSISTENCE_VERSION_KEY,
} from './lib/persistenceVersion';
import ServersData from './data/servers';
import { useServersStore } from './stores/servers';
import ServersDailyOffers from './lib/servers-dailyOffers';
import DataCenter from './lib/dataCenter';

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

const AppWithProviders = () => {
    const { mode } = useColorScheme();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [persistMismatchOpen, setPersistMismatchOpen] = useState(false);

    const [bootstrap] = useState(() => {
        const useStationStore = createStationStore();
        const stationProxy = makeStationProxy(useStationStore);

        const serversStore = useServersStore.getState();
        serversStore.setServers(ServersData);

        const operatingSystem = new OperatingSystem(playerStoreProxy);
        operatingSystem.station = stationProxy;
        stationProxy.os = operatingSystem;

        const statisticsProcess = new Statistics(playerStoreProxy);
        operatingSystem.addProcess(statisticsProcess);

        const serversDailyOffers = new ServersDailyOffers();
        operatingSystem.addProcess(serversDailyOffers);

        const dataCenterProcess = new DataCenter();
        operatingSystem.addProcess(dataCenterProcess);

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
        const persistedVersion = localStorage.getItem(PERSISTENCE_VERSION_KEY);
        const mismatch =
            persistedVersion !== null &&
            persistedVersion !== GAME_PERSISTENCE_VERSION;
        if (mismatch) {
            setPersistMismatchOpen(true);
            return;
        }
        localStorage.setItem(PERSISTENCE_VERSION_KEY, GAME_PERSISTENCE_VERSION);

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

    const handlePersistMismatchDismiss = () => {
        setPersistMismatchOpen(false);
        sessionStorage.setItem('reset-pending', 'true');
        window.location.reload();
    };

    const { operatingSystem, useStationStore, stationProxy, terminalController } =
        bootstrap;

    const handleLoadingHidden = () => {
        useMusicPlayerStore.getState().play();
        useAppReadyStore.getState().setAppReady();
    };

    if(!mode){
        return null;
    }

    return (
        <>
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
            <Dialog
                open={persistMismatchOpen}
                onClose={handlePersistMismatchDismiss}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Save Version Mismatch</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Your saved game was created with an older incompatible
                        version. The game needs to reset your save data to
                        migrate to the current version.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handlePersistMismatchDismiss}
                        variant="contained"
                    >
                        Reset Game
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default function App() {
    const theme = useSiteTheme();

    return (
        <ThemeProvider theme={theme} defaultMode="dark">
            <CssBaseline enableColorScheme />
            <AppWithProviders/>
        </ThemeProvider>
    );
}

import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { styled } from '@mui/material/styles';

import AppBar from './components/AppBar';
import NavMenu from './components/NavMenu';
import ScreenGlow from './components/ScreenGlow';
import Coachmarks from './components/Coachmarks';
import { NotifierProvider } from './components/Notifier';
import { AnchorsProvider } from './components/AnchorsContext';

import { usePlayerStore, playerStoreProxy } from './stores/player';
import { useAppReadyStore } from './stores/appReady';
import { useServersStore } from './stores/servers';
import { createStationStore, makeStationProxy } from './stores/station';
import { StationStoreProvider } from './stores/stationContext';

import OperatingSystem from './lib/OperatingSystem';
import TerminalController from './lib/terminal';
import Statistics from './lib/statistics';
import ServersDailyOffers from './lib/servers-dailyOffers';
import DataCenter from './lib/dataCenter';
import NeuralNet from './lib/neuralNet';
import Networks from './lib/networks';
import ThreatWatcher from './lib/threats';
import ServersData from './data/servers';
import ThreatPuzzleModal from './components/ThreatPuzzleModal';

// Route components are imported eagerly. Every route is needed shortly after the
// shell mounts (they were all preloaded immediately anyway), so lazy-loading only
// added a blank Suspense gap on the first navigation to each one.
import StationRoute from './pages/Station';
import TerminalRoute from './pages/Terminal';
import LoginRoute from './components/Login';
import ServersRoute from './pages/Servers';
import ServerRacksRoute from './pages/ServerRacks';
import DataCentersRoute from './pages/DataCenters';
import NetworksRoute from './pages/Networks';
import DarkWebRoute from './pages/DarkWeb';
import NeuralNetRoute from './pages/NeuralNet';
import UpgradesRoute from './pages/Upgrades';
import PrestigeRoute from './pages/Prestige';
import StatisticsRoute from './pages/Statistics';

const backgroundModules = import.meta.glob<string>(
    './assets/backgrounds/*_bg.png',
    { eager: true, import: 'default' },
);

function getBackground(pathname: string): string | null {
    const route = pathname.split('/')[1] || '';
    const key = `./assets/backgrounds/${route}_bg.png`;
    return (
        backgroundModules[key] ??
        backgroundModules['./assets/backgrounds/terminal_bg.png'] ??
        null
    );
}

// Title Console shell — full-viewport grid: [320px sidebar | 1fr main].
const ShellRoot = styled('div', {
    shouldForwardProp: (prop) => prop !== 'background',
})<{ background: string | null }>(({ background }) => ({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    overflow: 'hidden',
    color: 'rgba(255,255,255,0.87)',
    backgroundColor: '#07090b',
    // Per-route scene art sits behind the entire shell so the semi-transparent
    // sidebar and header read as glass panels over the scene.
    backgroundImage: background
        ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${background}')`
        : 'none',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    // Corner radial glows behind everything.
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background:
            'radial-gradient(ellipse at 0% 0%, rgba(10,245,176,0.08), transparent 50%),' +
            'radial-gradient(ellipse at 100% 100%, rgba(38,198,218,0.04), transparent 55%)',
        pointerEvents: 'none',
        zIndex: 0,
    },
    // Subtle scanline overlay across the whole shell.
    '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
        zIndex: 50,
    },
}));

const MainColumn = styled('div')({
    position: 'relative',
    zIndex: 2,
    gridColumn: 2,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
});

const GameContainer = styled('div')({
    flexGrow: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    transitionDuration: '225ms',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
    overflowY: 'auto',
    // Transparent: the scene art is painted behind the whole shell (ShellRoot).
    background: 'transparent',
});

type Bootstrap = {
    operatingSystem: OperatingSystem;
    useStationStore: ReturnType<typeof createStationStore>;
    stationProxy: ReturnType<typeof makeStationProxy>;
    terminalController: TerminalController;
};

function createBootstrap(): Bootstrap {
    const useStationStore = createStationStore();
    const stationProxy = makeStationProxy(useStationStore);

    const serversStore = useServersStore.getState();
    serversStore.setServers(ServersData);

    const operatingSystem = new OperatingSystem(playerStoreProxy);
    operatingSystem.station = stationProxy;
    stationProxy.os = operatingSystem;

    operatingSystem.addProcess(new Statistics(playerStoreProxy));
    operatingSystem.addProcess(new ServersDailyOffers());
    operatingSystem.addProcess(new DataCenter());
    operatingSystem.addProcess(new NeuralNet());
    operatingSystem.addProcess(new Networks());
    operatingSystem.addProcess(new ThreatWatcher(operatingSystem));

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
}

export default function Layout() {
    const location = useLocation();

    const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);

    useEffect(() => {
        const next = createBootstrap();
        setBootstrap(next);

        return () => {
            next.operatingSystem.shutdown();
        };
    }, []);

    const isAppReady = useAppReadyStore((s) => s.isAppReady);
    const hasSeenTutorial = usePlayerStore((s) => s.hasSeenTutorial);
    const resetTutorial = usePlayerStore((s) => s.resetTutorial);
    const tutorialDisabled = usePlayerStore((s) => s.tutorialDisabled);
    const tutorialStage = usePlayerStore((s) => s.tutorialStage);

    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const isStringArray =
            Array.isArray(hasSeenTutorial) &&
            hasSeenTutorial.every((s) => typeof s === 'string');

        if (!isStringArray) {
            resetTutorial();
            setShowTutorial(false);
            return;
        }

        setShowTutorial(
            isAppReady &&
                !hasSeenTutorial.includes(tutorialStage) &&
                !tutorialDisabled,
        );
    }, [hasSeenTutorial, tutorialStage, isAppReady, tutorialDisabled, resetTutorial]);

    if (!bootstrap) return null;

    return (
        <NotifierProvider>
            <AnchorsProvider>
                <StationStoreProvider
                    useStationStore={bootstrap.useStationStore}
                    stationProxy={bootstrap.stationProxy}
                >
                    <Coachmarks open={showTutorial} />
                    <ScreenGlow />
                    <ThreatPuzzleModal />
                    <ShellRoot background={getBackground(location.pathname)}>
                        <NavMenu />
                        <MainColumn>
                            <AppBar />
                            <GameContainer>
                                <Routes>
                                    <Route path="terminal" element={
                                        <TerminalRoute
                                            terminalController={bootstrap.terminalController}
                                            operatingSystem={bootstrap.operatingSystem}
                                        />
                                    } />
                                    <Route path="station" element={<StationRoute />} />
                                    <Route path="login" element={<LoginRoute />} />
                                    <Route path="servers" element={<ServersRoute />} />
                                    <Route path="racks/:dcId?" element={<ServerRacksRoute />} />
                                    <Route path="dataCenters" element={<DataCentersRoute />} />
                                    <Route path="networks" element={<NetworksRoute />} />
                                    <Route path="darkWeb" element={<DarkWebRoute />} />
                                    <Route path="neuralNet" element={<NeuralNetRoute />} />
                                    <Route path="upgrades" element={<UpgradesRoute />} />
                                    <Route path="prestige" element={<PrestigeRoute />} />
                                    <Route path="stats" element={<StatisticsRoute />} />
                                    <Route path="*" />
                                </Routes>
                            </GameContainer>
                        </MainColumn>
                    </ShellRoot>
                </StationStoreProvider>
            </AnchorsProvider>
        </NotifierProvider>
    );
}

import { Component, lazy } from 'solid-js';
import { AuthenticationState } from './includes/Authentication.interface';
import { Routes, Route } from '@solidjs/router';
import create from 'solid-zustand';

import AppBar from './components/AppBar';

import App from './App';
import { styled } from '@suid/material';

import TerminalController from './lib/terminal';

import Process, { StationStoreType, MenuStateType } from './includes/Process.interface';
import { PlayerState } from './includes/Player.interface';

import NavMenu from './components/NavMenu';
import { Station } from './lib/station';

const SecondApp = lazy(() => import('./SecondApp'));
const Login = lazy(() => import('./components/Login'));
const Background = lazy(async () => await import('./components/Background'));
const Servers = lazy(async () => import('./Servers'));
const Terminal = lazy(async () => import('./components/Terminal'));

type LayoutProps = {
    auth: AuthenticationState,
    station?: Station
    player: PlayerState
};

const MainContainer = styled('div')(() => ({
    paddingTop: '64px',
    boxSizing: 'border-box',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
}));

const GameContainer = styled('div')(() => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    transitionDuration: '225ms',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
}));

const useStationStore = (station: Station) => create<StationStoreType>(set => ({
    os: station.operatingSystem,
    cpu: station.processor,
    memory: null,
    storage: [],
    frame: 0,
    count: 0,
    exponent: 0,
    isRunning: false,
    callback: (frame: number, count: number, exponent: number) => set(() => ({ frame, count, exponent })),
    toggleGameLoop: () => set(state => {
        state.os.toggleGameLoop();
        console.log(`Game loop is running: ${state.os.isRunning}`);
        return { isRunning: state.os.isRunning };
    })
}));

const useMenuStateStore = create<MenuStateType> (set => ({
    open: true,
    toggle: () => set(state => ({ open: !state.open }))
}));

const Layout: Component<LayoutProps> = props => {
    const { auth, station, player } = props;
    console.log(`Username: ${auth.user?.username}`);

    const stationStore = useStationStore(station)();
    const menuStateStore = useMenuStateStore();

    const terminalController = new TerminalController();

    const mainProcess: Process = {
        id: 'main',
        callback: stationStore.callback
    }

    if (props.station.operatingSystem) {
        props.station.operatingSystem.addProcess(mainProcess);
    }

    return (
        <>
            <AppBar stationStore={stationStore} menuStateStore={menuStateStore} playerStateStore={player} />
            <MainContainer>
                <Background />
                <NavMenu menuStateStore={menuStateStore} playerStateStore={player} />
                <GameContainer>
                    <Routes>
                        <Route path="/" element={<Terminal terminalController={terminalController} operatingSystem={station.operatingSystem} />} />
                        <Route path="/station" element={<App stationStore={stationStore} />} />
                        <Route path="/login" element={<Login auth={props.auth} />} />
                        <Route path="/second" element={<SecondApp />} />
                        <Route path="/servers" element={<Servers />} />
                    </Routes>
                </GameContainer>
            </MainContainer>
        </>
    );
};

export default Layout;
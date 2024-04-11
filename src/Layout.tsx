import { Component, lazy } from 'solid-js';
import { AuthenticationState } from './includes/Authentication.interface';
import { Routes, Route } from '@solidjs/router';
import create from 'solid-zustand';

import AppBar from './components/AppBar';
import App from './App';
import { styled } from '@suid/material';

import GameController from './lib/GameController';
import TerminalController from './lib/terminal';

import Process, { GameStoreType, MenuStateType } from './includes/Process.interface';

import NavMenu from './components/NavMenu';

const SecondApp = lazy(() => import('./SecondApp'));
const Login = lazy(() => import('./components/Login'));
const Background = lazy(async () => await import('./components/Background'));
const Servers = lazy(async () => import('./Servers'));
const Terminal = lazy(async () => import('./components/Terminal'));

type LayoutProps = {
    auth: AuthenticationState,
    gameController?: GameController
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

const useGameStore = (gameController: GameController) => create<GameStoreType>(set => ({
    game: gameController,
    frame: 0,
    count: 0,
    exponent: 0,
    isRunning: false,
    callback: (frame: number, count: number, exponent: number) => set(() => ({ frame, count, exponent })),
    toggleGameLoop: () => {
        gameController.toggleGameLoop();
        set(() => ({ isRunning: gameController.isRunning }));
        console.log(`Game loop is running: ${gameController.isRunning}`);
    }
}));

const useMenuStateStore = create<MenuStateType> (set => ({
    open: true,
    toggle: () => set(state => ({ open: !state.open }))
}));

const Layout: Component<LayoutProps> = props => {
    const { auth, gameController } = props;
    console.log(`Username: ${auth.user?.username}`);

    const gameStore = useGameStore(gameController)();
    const menuStateStore = useMenuStateStore();

    const terminalController = new TerminalController();

    const mainProcess: Process = {
        id: 'main',
        callback: gameStore.callback
    }

    if (props.gameController) {
        props.gameController.addProcess(mainProcess);
    }

    return (
        <>
            <AppBar gcStore={gameStore} menuStateStore={menuStateStore} />
            <MainContainer>
                <Background />
                <GameContainer style={{ "margin-left": menuStateStore.open ? '240px' : '0' }} >
                    <Routes>
                        <Route path="/" element={<App gcStore={gameStore} />} />
                        <Route path="/login" element={<Login auth={props.auth} />} />
                        <Route path="/second" element={<SecondApp />} />
                        <Route path="/servers" element={<Servers />} />
                        <Route path="/terminal" element={<Terminal terminalController={terminalController} />} />
                    </Routes>
                </GameContainer>
                <NavMenu menuStateStore={menuStateStore} />
            </MainContainer>
        </>
    );
};

export default Layout;
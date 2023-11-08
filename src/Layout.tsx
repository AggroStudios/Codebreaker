import { Component } from 'solid-js';
import { AuthenticationState } from './includes/Authentication.interface';
import { Routes, Route } from '@solidjs/router';
import { lazy } from 'solid-js';
import create from 'solid-zustand';

import AppBar from './components/AppBar';
import App from './App';
import { styled } from '@suid/material';

import GameController from './lib/GameController';
import Process, { GameStoreType } from './includes/Process.interface';

const SecondApp = lazy(() => import('./SecondApp'));
const Login = lazy(() => import('./components/Login'));
const NavMenu = lazy(() => import('./components/NavMenu'));
const Background = lazy(async () => await import('./components/Background'));

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
}));

const GameContainer = styled('div')(() => ({
    marginLeft: '240px',
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

const Layout: Component<LayoutProps> = props => {
    const { auth, gameController } = props;
    console.log(`Username: ${auth.user?.username}`);

    const gameStore = useGameStore(gameController)();

    const mainProcess: Process = {
        id: 'main',
        callback: gameStore.callback
    }

    if (props.gameController) {
        props.gameController.addProcess(mainProcess);
    }

    return (
        <>
            <AppBar gcStore={gameStore} />
            <MainContainer>
                <Background />
                <GameContainer>
                    <Routes>
                        <Route path="/" element={<App gcStore={gameStore} />} />
                        <Route path="/login" element={<Login auth={props.auth} />} />
                        <Route path="/second" element={<SecondApp />} />
                    </Routes>
                </GameContainer>
                <NavMenu />
            </MainContainer>
        </>
    );
};

export default Layout;
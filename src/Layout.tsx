import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { styled } from '@mui/material/styles';

import AppBar from './components/AppBar';
import NavMenu from './components/NavMenu';
import MusicPlayer from './components/MusicPlayer';
import ScreenGlow from './components/ScreenGlow';
import { usePlayerStore } from './stores/player';
import { useAppReadyStore } from './stores/appReady';
import Coachmarks from './components/Coachmarks';

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

const MainContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'background',
})<{ background: string | null }>(({ background }) => ({
    paddingTop: '64px',
    boxSizing: 'border-box',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    backgroundImage: background
        ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${background}')`
        : 'none',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center',
}));

const GameContainer = styled('div')({
    flexGrow: 1,
    minHeight: 0,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    transitionDuration: '225ms',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
    overflowY: 'auto',
});

export default function Layout() {
    const location = useLocation();

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

    return (
        <>
            <Coachmarks open={showTutorial} />
            <ScreenGlow />
            <MusicPlayer />
            <AppBar />
            <MainContainer background={getBackground(location.pathname)}>
                <NavMenu />
                <GameContainer>
                    <Suspense fallback={null}>
                        <Outlet />
                    </Suspense>
                </GameContainer>
            </MainContainer>
        </>
    );
}

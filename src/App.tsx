import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useSiteTheme } from './theme';

import Layout from './Layout';
import LoadingScreen from './components/LoadingScreen';
import Settings from './components/Settings';
import About from './components/About';
import MusicPlayer from './components/MusicPlayer';

import { useUIStore } from './stores/ui';
import { useMusicPlayerStore } from './stores/musicPlayer';
import { useAppReadyStore } from './stores/appReady';
import { useSessionStore } from './stores/session';

import { preloadImages } from './lib/preloader';

import './index.css';
import {
    GAME_PERSISTENCE_VERSION,
    PERSISTENCE_VERSION_KEY,
} from './lib/persistenceVersion';
import BreakpointReporter from './theme/BreakpointReporter.tsx';

const TitleScreenRoute = lazy(() => import('./pages/TitleScreen'));
const CharacterCreationRoute = lazy(() => import('./pages/CharacterCreation'));

function InitializedLayoutRoute() {
    const isInitialized = useSessionStore((s) => s.isInitialized);
    if (!isInitialized) return <Navigate to="/" replace />;
    return <Layout />;
}

const AppWithProviders = () => {
    const { mode } = useColorScheme();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [persistMismatchOpen, setPersistMismatchOpen] = useState(false);

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
        import('./pages/TitleScreen');
        import('./pages/CharacterCreation');
    }, []);

    const handlePersistMismatchDismiss = () => {
        setPersistMismatchOpen(false);
        sessionStorage.setItem('reset-pending', 'true');
        window.location.reload();
    };

    const handleLoadingHidden = () => {
        useMusicPlayerStore.getState().play();
        useAppReadyStore.getState().setAppReady();
    };

    const settingsOpen = useUIStore((s) => s.settingsOpen);
    const aboutOpen = useUIStore((s) => s.aboutOpen);
    const closeSettings = useUIStore((s) => s.closeSettings);
    const closeAbout = useUIStore((s) => s.closeAbout);

    if(!mode){
        return null;
    }

    return (
        <>
            <MusicPlayer />
            <BrowserRouter>
                <Routes>
                    <Route index element={
                        <Suspense fallback={null}>
                            <TitleScreenRoute />
                        </Suspense>
                    } />
                    <Route path="character-creation" element={
                        <Suspense fallback={null}>
                            <CharacterCreationRoute />
                        </Suspense>
                    } />
                    <Route path="*" element={<InitializedLayoutRoute />} />
                </Routes>
            </BrowserRouter>
            <LoadingScreen
                loading={loadingProgress}
                onHidden={handleLoadingHidden}
            />
            <Settings open={settingsOpen} onClose={closeSettings} />
            <About open={aboutOpen} onClose={closeAbout} />
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
            <BreakpointReporter/>
        </>
    )
}

export default function App() {
    const theme = useSiteTheme();
    console.log('==> theme: ', theme);

    return (
        <ThemeProvider theme={theme} defaultMode="dark">
            <CssBaseline enableColorScheme />
            <AppWithProviders/>
        </ThemeProvider>
    );
}

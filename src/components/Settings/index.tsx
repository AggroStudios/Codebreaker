import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Slider,
    Typography,
    Box,
    Divider,
    Tooltip,
    ToggleButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';

import { useMusicPlayerStore } from '../../stores/musicPlayer';
import { getTrack } from '../../lib/musicTracks';

export interface SettingsProps {
    open: boolean;
    onClose: () => void;
}

export default function Settings({ open, onClose }: SettingsProps) {
    const playing = useMusicPlayerStore((s) => s.playing);
    const volume = useMusicPlayerStore((s) => s.volume);
    const muted = useMusicPlayerStore((s) => s.muted);
    const shuffle = useMusicPlayerStore((s) => s.shuffle);
    const currentTrackIndex = useMusicPlayerStore((s) => s.currentTrackIndex);
    const toggle = useMusicPlayerStore((s) => s.toggle);
    const setVolume = useMusicPlayerStore((s) => s.setVolume);
    const toggleMuted = useMusicPlayerStore((s) => s.toggleMuted);
    const toggleShuffle = useMusicPlayerStore((s) => s.toggleShuffle);

    const currentTrack = getTrack(currentTrackIndex);

    const handleVolumeChange = (_: Event, value: number | number[]) => {
        const next = Array.isArray(value) ? value[0] : value;
        setVolume(next / 100);
    };

    const volumeIcon = muted || volume === 0
        ? <VolumeOffIcon />
        : volume < 0.5
            ? <VolumeDownIcon />
            : <VolumeUpIcon />;

    const volumePercent = Math.round(volume * 100);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="settings-dialog-title"
        >
            <DialogTitle
                id="settings-dialog-title"
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                Settings
                <IconButton
                    aria-label="Close settings"
                    onClick={onClose}
                    size="small"
                    sx={{ outline: 0 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Typography
                    component="div"
                    variant="overline"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'block' }}
                >
                    Music
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Tooltip title={playing ? 'Pause' : 'Play'}>
                        <IconButton
                            aria-label={
                                playing ? 'Pause music' : 'Play music'
                            }
                            onClick={toggle}
                            color="primary"
                            sx={{ outline: 0 }}
                        >
                            {playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                            component="div"
                            variant="subtitle2"
                            noWrap
                            title={currentTrack?.title}
                            sx={{ fontWeight: 600 }}
                        >
                            {currentTrack?.title ?? 'No track loaded'}
                        </Typography>
                        <Typography
                            component="div"
                            variant="body2"
                            color="text.secondary"
                        >
                            {playing ? 'Now playing' : 'Paused'}
                        </Typography>
                    </Box>
                    <Tooltip title={shuffle ? 'Shuffle on' : 'Shuffle off'}>
                        <ToggleButton
                            value="shuffle"
                            selected={shuffle}
                            onChange={toggleShuffle}
                            aria-label="Toggle shuffle"
                            aria-pressed={shuffle}
                            size="small"
                            color="primary"
                            sx={{ outline: 0, border: 0 }}
                        >
                            <ShuffleIcon />
                        </ToggleButton>
                    </Tooltip>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography
                    id="volume-slider-label"
                    component="div"
                    variant="body2"
                    gutterBottom
                >
                    Volume
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Tooltip title={muted ? 'Unmute' : 'Mute'}>
                        <IconButton
                            aria-label={muted ? 'Unmute' : 'Mute'}
                            onClick={toggleMuted}
                            size="small"
                            sx={{ outline: 0 }}
                        >
                            {volumeIcon}
                        </IconButton>
                    </Tooltip>
                    <Slider
                        aria-labelledby="volume-slider-label"
                        value={volumePercent}
                        onChange={handleVolumeChange}
                        min={0}
                        max={100}
                        step={1}
                        disabled={muted}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `${v}%`}
                    />
                    <Typography
                        component="div"
                        variant="body2"
                        color="text.secondary"
                        sx={{ minWidth: 40, textAlign: 'right' }}
                    >
                        {volumePercent}%
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} sx={{ outline: 0 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

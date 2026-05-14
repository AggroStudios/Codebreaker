import { useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    IconButton,
    Slider,
    Tooltip,
    Typography,
} from '@mui/material';
import clsx from 'clsx';
import CloseIcon from '@mui/icons-material/Close';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import { useMusicPlayerStore } from '../../stores/musicPlayer';
import { usePlayerStore } from '../../stores/player';
import { getTrack, musicTracks } from '../../data/musicTracks';

import './settings.scss';

/** Tick marks every 10% along the volume sliders (ruler-style notches). */
const VOLUME_SLIDER_MARKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => ({
    value,
}));

export interface SettingsProps {
    open: boolean;
    onClose: () => void;
}

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return '00:00';
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function estimateLocalStorageBytes(): number {
    let n = 0;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            const v = localStorage.getItem(k) ?? '';
            n += k.length + v.length;
        }
    } catch {
        return 0;
    }
    return n * 2;
}

function formatSaveSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    const kb = bytes / 1024;
    return kb < 100 ? `${kb.toFixed(1)} kb` : `${Math.round(kb)} kb`;
}

function Equalizer({ playing, size = 28, color = '#0af5b0' }) {
    const bars = [0.55, 0.95, 0.40, 0.75, 0.35];
    return (
        <div
            style={{
                width: size, height: size, display: 'flex', alignItems: 'flex-end',
                gap: 2, padding: 4, justifyContent: 'center',
            }}
        >
            {bars.map((h, i) => (
                <span
                    key={i}
                    style={{
                    width: 2, flex: '0 0 2px',
                    background: playing ? color : 'rgba(255,255,255,0.3)',
                    boxShadow: playing ? `0 0 4px ${color}` : 'none',
                    height: `${h * 100}%`,
                    animation: playing
                        ? `eqBar 0.${5 + i}s ease-in-out ${i * 0.07}s infinite alternate`
                        : 'none',
                    transformOrigin: 'bottom',
                    }}
                />
            ))}
        </div>
    );
}

export default function Settings({ open, onClose }: SettingsProps) {
    const [confirmReset, setConfirmReset] = useState(false);

    const hasSeenTutorial = usePlayerStore((s) => s.hasSeenTutorial);
    const tutorialDisabled = usePlayerStore((s) => s.tutorialDisabled);
    const resetTutorial = usePlayerStore((s) => s.resetTutorial);

    const playing = useMusicPlayerStore((s) => s.playing);
    const volume = useMusicPlayerStore((s) => s.volume);
    const sfxVolume = useMusicPlayerStore((s) => s.sfxVolume);
    const muted = useMusicPlayerStore((s) => s.muted);
    const mutedSfx = useMusicPlayerStore((s) => s.mutedSfx);
    const shuffle = useMusicPlayerStore((s) => s.shuffle);
    const currentTrackIndex = useMusicPlayerStore((s) => s.currentTrackIndex);
    const currentTime = useMusicPlayerStore((s) => s.currentTime);
    const duration = useMusicPlayerStore((s) => s.duration);
    const toggle = useMusicPlayerStore((s) => s.toggle);
    const setVolume = useMusicPlayerStore((s) => s.setVolume);
    const setSfxVolume = useMusicPlayerStore((s) => s.setSfxVolume);
    const toggleMuted = useMusicPlayerStore((s) => s.toggleMuted);
    const toggleSfxMuted = useMusicPlayerStore((s) => s.toggleSfxMuted);
    const toggleShuffle = useMusicPlayerStore((s) => s.toggleShuffle);
    const nextTrack = useMusicPlayerStore((s) => s.nextTrack);
    const prevTrack = useMusicPlayerStore((s) => s.prevTrack);

    const trackCount = musicTracks.length;
    const currentTrack = getTrack(currentTrackIndex);

    const saveBytes = useMemo(() => (open ? estimateLocalStorageBytes() : 0), [open]);

    const handleClose = () => {
        setConfirmReset(false);
        onClose();
    };

    const handleVolumeChange = (_: Event, value: number | number[]) => {
        const next = Array.isArray(value) ? value[0] : value;
        setVolume(next / 100);
    };

    const handleSfxVolumeChange = (_: Event, value: number | number[]) => {
        const next = Array.isArray(value) ? value[0] : value;
        setSfxVolume(next / 100);
    };

    const handleResetGame = () => {
        sessionStorage.setItem('reset-pending', 'true');
        window.location.reload();
    };

    const handleResetTutorial = () => {
        handleClose();
        resetTutorial();
    };

    const musicVolumeIcon =
        muted || volume === 0 ? (
            <VolumeOffIcon sx={{ fontSize: 20 }} />
        ) : volume < 0.5 ? (
            <VolumeDownIcon sx={{ fontSize: 20 }} />
        ) : (
            <VolumeUpIcon sx={{ fontSize: 20 }} />
        );

    const sfxVolumeIcon =
        mutedSfx || sfxVolume === 0 ? (
            <VolumeOffIcon sx={{ fontSize: 20 }} />
        ) : sfxVolume < 0.5 ? (
            <VolumeDownIcon sx={{ fontSize: 20 }} />
        ) : (
            <VolumeUpIcon sx={{ fontSize: 20 }} />
        );

    const volumePercent = Math.round(volume * 100);
    const sfxVolumePercent = Math.round(sfxVolume * 100);

    const progressPct =
        duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

    const trackLabel =
        trackCount > 0
            ? `TRACK ${String(currentTrackIndex + 1).padStart(2, '0')} / ${String(trackCount).padStart(2, '0')}`
            : 'NO TRACKS';

    const tutorialStatusLabel = tutorialDisabled
        ? 'Disabled'
        : hasSeenTutorial.length > 0
          ? 'Completed'
          : 'Active';

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="settings-dialog-heading"
            slotProps={{
                paper: {
                    className: 'settings-modal-paper',
                    elevation: 0,
                },
            }}
        >
            <Box className="settings-modal">
                <Box className="settings-modal__header" component="header">
                    <Box className="settings-modal__header-main">
                        <Avatar
                            className="settings-modal__header-avatar"
                            variant="rounded"
                            aria-hidden
                        >
                            <SettingsOutlinedIcon className="settings-modal__header-gear" />
                        </Avatar>
                        <h2 id="settings-dialog-heading" className="settings-modal__heading">
                            System Preferences
                        </h2>
                    </Box>
                    <IconButton
                        className="settings-modal__close"
                        aria-label="Close settings"
                        onClick={handleClose}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box className="settings-modal__body">
                    <Box component="section" className="settings-modal__section" aria-label="Audio">
                        <Box className="settings-modal__section-head">
                            <span className="settings-modal__section-label">01 // <span className="settings-modal__section-label-accent">AUDIO</span></span>
                            <span className="settings-modal__section-meta">3 controls</span>
                        </Box>

                        <Box className="settings-modal__card settings-modal__card--now-playing">
                            <Box className="settings-modal__now-playing-shell">
                            <div
                                style={{
                                width: 56, height: 56, borderRadius: 8,
                                background:
                                    'linear-gradient(135deg, rgba(10,245,176,0.18) 0%, rgba(38,198,218,0.12) 100%)',
                                border: '1px solid rgba(10,245,176,0.30)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 0 16px rgba(10,245,176,0.18)',
                                }}
                            >
                                <Equalizer playing={playing} size={36} />
                            </div>

                                <Box className="settings-modal__now-center">
                                    <Box className="settings-modal__now-eyebrow-row">
                                        <PlayArrowIcon className="settings-modal__now-play-glyph" />
                                        <Typography className="settings-modal__now-eyebrow" component="span">
                                            NOW PLAYING • {trackLabel}
                                        </Typography>
                                    </Box>
                                    <Typography className="settings-modal__now-title" component="div">
                                        {currentTrack?.title ?? 'No track loaded'}
                                    </Typography>
                                    <Typography className="settings-modal__now-artist" component="div">
                                        {currentTrack?.artist ?? '—'}
                                    </Typography>
                                    <Box className="settings-modal__progress-row">
                                        <span className="settings-modal__progress-time">
                                            {formatTime(currentTime)}
                                        </span>
                                        <Box className="settings-modal__progress-track">
                                            <Box
                                                className="settings-modal__progress-fill"
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </Box>
                                        <span className="settings-modal__progress-time">
                                            {formatTime(duration)}
                                        </span>
                                    </Box>
                                </Box>

                                <Box className="settings-modal__now-transport-col">
                                    <Box className="settings-modal__transport-btns">
                                        <Tooltip title="Previous track">
                                            <span>
                                                <IconButton
                                                    className="settings-modal__icon-btn"
                                                    aria-label="Previous track"
                                                    size="small"
                                                    disabled={trackCount === 0}
                                                    onClick={() => prevTrack(trackCount)}
                                                >
                                                    <SkipPreviousIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={playing ? 'Pause' : 'Play'}>
                                            <IconButton
                                                className="settings-modal__icon-btn settings-modal__icon-btn--play settings-modal__icon-btn--play-lg"
                                                aria-label={playing ? 'Pause music' : 'Play music'}
                                                size="medium"
                                                disabled={trackCount === 0}
                                                onClick={toggle}
                                            >
                                                {playing ? (
                                                    <PauseIcon sx={{ fontSize: 26 }} />
                                                ) : (
                                                    <PlayArrowIcon sx={{ fontSize: 26 }} />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Next track">
                                            <span>
                                                <IconButton
                                                    className="settings-modal__icon-btn"
                                                    aria-label="Next track"
                                                    size="small"
                                                    disabled={trackCount === 0}
                                                    onClick={() => nextTrack(trackCount)}
                                                >
                                                    <SkipNextIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Box>
                                    <button
                                        type="button"
                                        className={clsx(
                                            'settings-modal__shuffle-inline',
                                            shuffle && 'settings-modal__shuffle-inline--on',
                                        )}
                                        aria-label="Toggle shuffle"
                                        aria-pressed={shuffle}
                                        disabled={trackCount === 0}
                                        onClick={() => toggleShuffle()}
                                    >
                                        <ShuffleIcon className="settings-modal__shuffle-inline-icon" fontSize="small" />
                                        <span className="settings-modal__shuffle-inline-label">
                                            SHUFFLE {shuffle ? 'ON' : 'OFF'}
                                        </span>
                                    </button>
                                </Box>
                            </Box>
                        </Box>

                        <Box className="settings-modal__volume">
                            <Box className="settings-modal__volume-block">
                                <Box
                                    className="settings-modal__volume-label-row"
                                    id="settings-music-volume-label"
                                >
                                    <Box className="settings-modal__volume-label-text">
                                        <MusicNoteIcon className="settings-modal__volume-label-icon" />
                                        <Typography component="span" className="settings-modal__volume-title">
                                            Music Volume
                                        </Typography>
                                    </Box>
                                    <Typography component="span" className="settings-modal__volume-pct-top">
                                        {volumePercent}%
                                    </Typography>
                                </Box>
                                <Box className="settings-modal__volume-track-row">
                                    <Tooltip title={muted ? 'Unmute' : 'Mute'}>
                                        <IconButton
                                            aria-label={muted ? 'Unmute music' : 'Mute music'}
                                            onClick={toggleMuted}
                                            size="small"
                                            className="settings-modal__volume-speaker"
                                        >
                                            {musicVolumeIcon}
                                        </IconButton>
                                    </Tooltip>
                                    <Slider
                                        className="settings-modal__slider settings-modal__slider--notched"
                                        aria-labelledby="settings-music-volume-label"
                                        value={volumePercent}
                                        onChange={handleVolumeChange}
                                        min={0}
                                        max={100}
                                        step={1}
                                        disabled={muted}
                                        valueLabelDisplay="off"
                                        marks={VOLUME_SLIDER_MARKS}
                                    />
                                </Box>
                            </Box>

                            <Box className="settings-modal__volume-block">
                                <Box
                                    className="settings-modal__volume-label-row"
                                    id="settings-sfx-volume-label"
                                >
                                    <Box className="settings-modal__volume-label-text">
                                        <GraphicEqIcon className="settings-modal__volume-label-icon" />
                                        <Typography component="span" className="settings-modal__volume-title">
                                            Sound effects
                                        </Typography>
                                    </Box>
                                    <Typography component="span" className="settings-modal__volume-pct-top">
                                        {sfxVolumePercent}%
                                    </Typography>
                                </Box>
                                <Box className="settings-modal__volume-track-row">
                                    <Tooltip title={mutedSfx ? 'Unmute' : 'Mute'}>
                                        <IconButton
                                            aria-label={mutedSfx ? 'Unmute sound effects' : 'Mute sound effects'}
                                            onClick={toggleSfxMuted}
                                            size="small"
                                            className="settings-modal__volume-speaker"
                                        >
                                            {sfxVolumeIcon}
                                        </IconButton>
                                    </Tooltip>
                                    <Slider
                                        className="settings-modal__slider settings-modal__slider--notched"
                                        aria-labelledby="settings-sfx-volume-label"
                                        value={sfxVolumePercent}
                                        onChange={handleSfxVolumeChange}
                                        min={0}
                                        max={100}
                                        step={1}
                                        disabled={mutedSfx}
                                        valueLabelDisplay="off"
                                        marks={VOLUME_SLIDER_MARKS}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box component="section" className="settings-modal__section" aria-label="Game">
                        <Box className="settings-modal__section-head">
                            <span className="settings-modal__section-label">02 // <span className="settings-modal__section-label-accent">GAME</span></span>
                            <span className="settings-modal__section-meta">profile · save · run-state</span>
                        </Box>

                        <Box className="settings-modal__card" sx={{ mb: 1.5 }}>
                            <Box className="settings-modal__game-row">
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 0 }}>
                                    <SchoolOutlinedIcon className="settings-modal__game-icon" />
                                    <Box>
                                        <Typography className="settings-modal__game-title" component="div">
                                            Tutorial
                                        </Typography>
                                        <Box className="settings-modal__game-status">
                                            <span
                                                className={
                                                    tutorialStatusLabel === 'Completed'
                                                        ? 'settings-modal__status-dot settings-modal__status-dot--ok'
                                                        : 'settings-modal__status-dot'
                                                }
                                            />
                                            Status: {tutorialStatusLabel}
                                        </Box>
                                    </Box>
                                </Box>
                                <Button
                                    className="settings-modal__btn-outline"
                                    variant="outlined"
                                    size="small"
                                    onClick={handleResetTutorial}
                                    disabled={hasSeenTutorial.length === 0 && !tutorialDisabled}
                                >
                                    RE-ENABLE
                                </Button>
                            </Box>
                        </Box>

                        <Box className="settings-modal__card">
                            <Box className="settings-modal__game-row">
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 0 }}>
                                    <CloudQueueOutlinedIcon className="settings-modal__game-icon" />
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography className="settings-modal__game-title" component="div">
                                            Save file
                                        </Typography>
                                        <Typography className="settings-modal__save-path" component="div">
                                            ~/codebreaker.save · {formatSaveSize(saveBytes)} · browser storage
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="settings-modal__save-actions">
                                    <Tooltip title="Progress is saved automatically in this browser">
                                        <IconButton aria-label="Save info" size="small">
                                            <FileDownloadOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Synced locally only">
                                        <IconButton aria-label="Storage info" size="small">
                                            <UploadFileOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box component="section" className="settings-modal__section" aria-label="Danger zone">
                        <Box className="settings-modal__section-head">
                            <span className="settings-modal__section-label">03 // <span className="settings-modal__section-label-accent">DANGER ZONE</span></span>
                            <span className="settings-modal__section-meta settings-modal__section-meta--danger">
                                irreversible
                            </span>
                        </Box>

                        <Box className="settings-modal__card settings-modal__card--danger">
                            <Box className="settings-modal__game-row" sx={{ alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
                                    <WarningAmberOutlinedIcon
                                        sx={{ color: '#f44336', fontSize: 28, flexShrink: 0 }}
                                    />
                                    <Box>
                                        <Typography className="settings-modal__game-title" component="div">
                                            Reset Game
                                        </Typography>
                                        <Typography className="settings-modal__danger-copy" component="div">
                                            Erases all progress, prestige, upgrades, and unlocks.
                                        </Typography>
                                        {confirmReset && (
                                            <Box className="settings-modal__confirm-row">
                                                <Button
                                                    className="settings-modal__btn-danger"
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={handleResetGame}
                                                >
                                                    CONFIRM RESET
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => setConfirmReset(false)}
                                                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                                                >
                                                    Cancel
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                {!confirmReset && (
                                    <Button
                                        className="settings-modal__btn-danger"
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setConfirmReset(true)}
                                    >
                                        RESET
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box className="settings-modal__footer">
                    <Typography className="settings-modal__footer-hint" component="span">
                        ESC to close · changes saved automatically
                    </Typography>
                    <Button className="settings-modal__btn-done" onClick={handleClose} variant="text">
                        DONE
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}

import { useEffect, useRef } from 'react';
import { useMusicPlayerStore } from '../../stores/musicPlayer';
import { getTrack, musicTracks } from '../../data/musicTracks';

export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playing = useMusicPlayerStore((s) => s.playing);
    const volume = useMusicPlayerStore((s) => s.volume);
    const muted = useMusicPlayerStore((s) => s.muted);
    const currentTrackIndex = useMusicPlayerStore((s) => s.currentTrackIndex);
    const loop = useMusicPlayerStore((s) => s.loop);
    const nextTrack = useMusicPlayerStore((s) => s.nextTrack);
    const pause = useMusicPlayerStore((s) => s.pause);
    const setPlaybackTimes = useMusicPlayerStore((s) => s.setPlaybackTimes);

    const trackCount = musicTracks.length;
    const currentSrc = getTrack(currentTrackIndex)?.src;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
        audio.muted = muted;
    }, [volume, muted]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSrc) return;

        if (playing) {
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    pause();
                });
            }
        } else {
            audio.pause();
        }
    }, [playing, currentSrc, pause]);

    const handleEnded = () => {
        if (trackCount === 0) return;
        if (loop || currentTrackIndex < trackCount - 1) {
            nextTrack(trackCount);
        } else {
            pause();
        }
    };

    if (!currentSrc) return null;

    const syncTimes = (el: HTMLAudioElement) => {
        setPlaybackTimes(el.currentTime, Number.isFinite(el.duration) ? el.duration : 0);
    };

    return (
        <audio
            ref={audioRef}
            src={currentSrc}
            preload="auto"
            onEnded={handleEnded}
            onTimeUpdate={(e) => syncTimes(e.currentTarget)}
            onLoadedMetadata={(e) => syncTimes(e.currentTarget)}
            onDurationChange={(e) => syncTimes(e.currentTarget)}
            style={{ display: 'none' }}
            aria-hidden="true"
        />
    );
}

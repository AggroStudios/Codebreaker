import { useEffect, useMemo, useRef } from 'react';
import { useMusicPlayerStore } from '../../stores/musicPlayer';
import { getTrack, musicTracks } from '../../lib/musicTracks';

export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playing = useMusicPlayerStore((s) => s.playing);
    const volume = useMusicPlayerStore((s) => s.volume);
    const muted = useMusicPlayerStore((s) => s.muted);
    const currentTrackIndex = useMusicPlayerStore((s) => s.currentTrackIndex);
    const loop = useMusicPlayerStore((s) => s.loop);
    const nextTrack = useMusicPlayerStore((s) => s.nextTrack);
    const pause = useMusicPlayerStore((s) => s.pause);

    const trackCount = musicTracks.length;
    const currentSrc = useMemo(
        () => getTrack(currentTrackIndex)?.src,
        [currentTrackIndex],
    );

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

    return (
        <audio
            ref={audioRef}
            src={currentSrc}
            preload="auto"
            onEnded={handleEnded}
            style={{ display: 'none' }}
            aria-hidden="true"
        />
    );
}

import { create } from 'zustand';

export interface MusicPlayerState {
    playing: boolean;
    volume: number;
    muted: boolean;
    currentTrackIndex: number;
    loop: boolean;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    toggleMuted: () => void;
    setTrackIndex: (index: number) => void;
    nextTrack: (trackCount: number) => void;
    prevTrack: (trackCount: number) => void;
    setLoop: (loop: boolean) => void;
}

const clampVolume = (value: number): number => {
    if (Number.isNaN(value)) return 0;
    return Math.min(1, Math.max(0, value));
};

export const useMusicPlayerStore = create<MusicPlayerState>((set) => ({
    playing: false,
    volume: 0.1,
    muted: false,
    currentTrackIndex: 0,
    loop: true,
    play: () => set(() => ({ playing: true })),
    pause: () => set(() => ({ playing: false })),
    toggle: () => set((state) => ({ playing: !state.playing })),
    setVolume: (volume: number) =>
        set(() => ({ volume: clampVolume(volume) })),
    setMuted: (muted: boolean) => set(() => ({ muted })),
    toggleMuted: () => set((state) => ({ muted: !state.muted })),
    setTrackIndex: (index: number) =>
        set(() => ({ currentTrackIndex: Math.max(0, index) })),
    nextTrack: (trackCount: number) =>
        set((state) => ({
            currentTrackIndex:
                trackCount > 0
                    ? (state.currentTrackIndex + 1) % trackCount
                    : 0,
        })),
    prevTrack: (trackCount: number) =>
        set((state) => ({
            currentTrackIndex:
                trackCount > 0
                    ? (state.currentTrackIndex - 1 + trackCount) % trackCount
                    : 0,
        })),
    setLoop: (loop: boolean) => set(() => ({ loop })),
}));

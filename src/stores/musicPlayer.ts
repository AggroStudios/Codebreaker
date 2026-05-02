import { create } from 'zustand';

export interface MusicPlayerState {
    playing: boolean;
    volume: number;
    sfxVolume: number;
    muted: boolean;
    mutedSfx: boolean;
    currentTrackIndex: number;
    shuffle: boolean;
    loop: boolean;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    setVolume: (volume: number) => void;
    setSfxVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    setSfxMuted: (muted: boolean) => void;
    toggleMuted: () => void;
    toggleSfxMuted: () => void;
    setTrackIndex: (index: number) => void;
    nextTrack: (trackCount: number) => void;
    prevTrack: (trackCount: number) => void;
    setShuffle: (shuffle: boolean) => void;
    toggleShuffle: () => void;
    setLoop: (loop: boolean) => void;
}

const clampVolume = (value: number): number => {
    if (Number.isNaN(value)) return 0;
    return Math.min(1, Math.max(0, value));
};

export const useMusicPlayerStore = create<MusicPlayerState>((set) => ({
    playing: false,
    volume: 0.1,
    sfxVolume: 0.5,
    muted: false,
    mutedSfx: false,
    currentTrackIndex: 0,
    shuffle: true,
    setShuffle: (shuffle: boolean) => set(() => ({ shuffle })),
    toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
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
                    ? state.shuffle
                        ? selectRandomTrack(trackCount, state.currentTrackIndex)
                        : (state.currentTrackIndex + 1) % trackCount
                    : 0,
        })),
    prevTrack: (trackCount: number) =>
        set((state) => ({
            currentTrackIndex:
                trackCount > 0
                    ? state.shuffle
                        ? selectRandomTrack(trackCount, state.currentTrackIndex)
                        : (state.currentTrackIndex - 1 + trackCount) % trackCount
                    : 0,
        })),
    setLoop: (loop: boolean) => set(() => ({ loop })),
    setSfxVolume: (volume: number) => set(() => ({ sfxVolume: clampVolume(volume) })),
    setSfxMuted: (muted: boolean) => set(() => ({ mutedSfx: muted })),
    toggleSfxMuted: () => set((state) => ({ mutedSfx: !state.mutedSfx })),
}));

const selectRandomTrack = (trackCount: number, currentTrackIndex: number) => {
    const randomIndex = Math.floor(Math.random() * trackCount);
    if (randomIndex === currentTrackIndex) {
        return selectRandomTrack(trackCount, currentTrackIndex);
    }
    return randomIndex;
};

export interface MusicTrack {
    title: string;
    src: string;
    /** Shown in System Preferences now-playing (e.g. `Artist — Album`). */
    artist?: string;
}

const trackModules = import.meta.glob<string>(
    '../assets/music/*.mp3',
    { eager: true, import: 'default' },
);

const deriveTitle = (path: string): string => {
    const filename = path.split('/').pop() ?? path;
    return filename.replace(/\.mp3$/i, '');
};

export const musicTracks: MusicTrack[] = Object.keys(trackModules)
    .sort()
    .map((key) => ({
        title: deriveTitle(key),
        src: trackModules[key],
    }));

export const getTrack = (index: number): MusicTrack | undefined => {
    if (musicTracks.length === 0) return undefined;
    const normalized =
        ((index % musicTracks.length) + musicTracks.length) %
        musicTracks.length;
    return musicTracks[normalized];
};

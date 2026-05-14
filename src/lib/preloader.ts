const imageModules = import.meta.glob<string>('../assets/**/*.{png,jpg,jpeg,mp3}', {
    eager: true,
    import: 'default',
});

const soundModules = import.meta.glob<string>('../components/**/*.mp3', {
    eager: true,
    import: 'default',
});

export function preloadImages(onProgress: (percent: number) => void): Promise<void> {
    const urls = [...Object.values(imageModules), ...Object.values(soundModules)];
    if (urls.length === 0) {
        onProgress(100);
        return Promise.resolve();
    }

    let loaded = 0;
    return new Promise<void>((resolve) => {
        for (const url of urls) {
            const img = new Image();
            const done = () => {
                loaded++;
                onProgress(Math.round((loaded / urls.length) * 100));
                if (loaded === urls.length) resolve();
            };
            img.onload = done;
            img.onerror = done;
            img.src = url;
        }
    });
}

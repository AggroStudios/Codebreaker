// Renderer-side typings for the `window.steam` bridge exposed by
// `electron/preload.ts`. Mirrors the shape of `SteamApi` so the renderer
// gets autocomplete and type-checking without importing from electron/.

export interface SteamPlayerSteamId {
    steamId64: string;
    steamId32: string;
    accountId: number;
}

export interface SteamCloudFile {
    name: string;
    size: string;
}

export interface SteamBridge {
    isReady(): Promise<boolean>;
    getAppId(): Promise<number>;

    localplayer: {
        getName(): Promise<string>;
        getSteamId(): Promise<SteamPlayerSteamId>;
        getLevel(): Promise<number>;
        setRichPresence(key: string, value?: string | null): Promise<void>;
    };

    achievement: {
        activate(name: string): Promise<boolean>;
        clear(name: string): Promise<boolean>;
        isActivated(name: string): Promise<boolean>;
    };

    overlay: {
        activateDialog(dialog: number): Promise<void>;
        activateToWebPage(url: string): Promise<void>;
        activateToStore(appId: number, flag: number): Promise<void>;
    };

    cloud: {
        isEnabledForApp(): Promise<boolean>;
        readFile(name: string): Promise<string>;
        writeFile(name: string, content: string): Promise<boolean>;
        deleteFile(name: string): Promise<boolean>;
        fileExists(name: string): Promise<boolean>;
        listFiles(): Promise<SteamCloudFile[]>;
    };
}

declare global {
    interface Window {
        // Present only when running inside the Electron build; the renderer
        // should check `'steam' in window` (or `window.steam?.isReady()`)
        // before relying on it for web builds.
        steam?: SteamBridge;
    }
}

export {};

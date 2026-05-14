import { contextBridge, ipcRenderer } from 'electron';

// Renderer-facing surface for the Steam IPC handlers registered in main.ts.
// Use `window.steam.isReady()` first and gracefully fall back to non-Steam
// behaviour when it returns false.
const steamApi = {
    isReady: (): Promise<boolean> => ipcRenderer.invoke('steam:isReady'),
    getAppId: (): Promise<number> => ipcRenderer.invoke('steam:getAppId'),

    localplayer: {
        getName: (): Promise<string> =>
            ipcRenderer.invoke('steam:localplayer:getName'),
        getSteamId: (): Promise<{
            steamId64: string;
            steamId32: string;
            accountId: number;
        }> => ipcRenderer.invoke('steam:localplayer:getSteamId'),
        getLevel: (): Promise<number> =>
            ipcRenderer.invoke('steam:localplayer:getLevel'),
        setRichPresence: (key: string, value?: string | null): Promise<void> =>
            ipcRenderer.invoke('steam:localplayer:setRichPresence', key, value),
    },

    achievement: {
        activate: (name: string): Promise<boolean> =>
            ipcRenderer.invoke('steam:achievement:activate', name),
        clear: (name: string): Promise<boolean> =>
            ipcRenderer.invoke('steam:achievement:clear', name),
        isActivated: (name: string): Promise<boolean> =>
            ipcRenderer.invoke('steam:achievement:isActivated', name),
    },

    overlay: {
        activateDialog: (dialog: number): Promise<void> =>
            ipcRenderer.invoke('steam:overlay:activateDialog', dialog),
        activateToWebPage: (url: string): Promise<void> =>
            ipcRenderer.invoke('steam:overlay:activateToWebPage', url),
        activateToStore: (appId: number, flag: number): Promise<void> =>
            ipcRenderer.invoke('steam:overlay:activateToStore', appId, flag),
    },

    cloud: {
        isEnabledForApp: (): Promise<boolean> =>
            ipcRenderer.invoke('steam:cloud:isEnabledForApp'),
        readFile: (name: string): Promise<string> =>
            ipcRenderer.invoke('steam:cloud:readFile', name),
        writeFile: (name: string, content: string): Promise<boolean> =>
            ipcRenderer.invoke('steam:cloud:writeFile', name, content),
        deleteFile: (name: string): Promise<boolean> =>
            ipcRenderer.invoke('steam:cloud:deleteFile', name),
        fileExists: (name: string): Promise<boolean> =>
            ipcRenderer.invoke('steam:cloud:fileExists', name),
        listFiles: (): Promise<Array<{ name: string; size: string }>> =>
            ipcRenderer.invoke('steam:cloud:listFiles'),
    },
};

export type SteamApi = typeof steamApi;

contextBridge.exposeInMainWorld('steam', steamApi);

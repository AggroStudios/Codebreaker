import { app, BrowserWindow, shell, Menu, ipcMain, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import steamworks from 'steamworks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Injected by vite-plugin-electron in dev mode
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

const STEAM_APP_ID = 4710200;

// Module-level handle to the initialised Steam client. Stays undefined when
// Steam isn't running so IPC handlers can fail fast with a helpful error.
let steamClient: ReturnType<typeof steamworks.init> | undefined;

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        icon: path.join(__dirname, '../public/favicon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: true,
            nodeIntegration: true,
        },
    });

    // Open external links in the system browser instead of a new Electron window
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

function requireSteam() {
    if (!steamClient) {
        throw new Error('Steam client is not initialised');
    }
    return steamClient;
}

function setupSteamApiCors() {
    // partner.steam-api.com is a backend Steam endpoint that does not emit
    // CORS headers, so Chromium blocks renderer requests to it by default.
    // Inject the necessary `Access-Control-*` headers on the response so the
    // renderer can fetch it directly via `fetch`/`axios`.
    //
    // SECURITY NOTE: Steam Partner API calls require a publisher Web API key.
    // Never embed that key in the renderer bundle — anyone with the packaged
    // app can extract it. For privileged endpoints, proxy through the main
    // process via `ipcMain.handle` and keep the key in a secure store.
    const filter = { urls: ['https://partner.steam-api.com/*'] };

    session.defaultSession.webRequest.onHeadersReceived(
        filter,
        (details, callback) => {
            const responseHeaders: Record<string, string[]> = {};
            for (const [key, value] of Object.entries(
                details.responseHeaders ?? {},
            )) {
                // Strip existing CORS headers so ours win and we don't end up
                // with duplicate / conflicting entries.
                if (key.toLowerCase().startsWith('access-control-')) continue;
                responseHeaders[key] = Array.isArray(value) ? value : [value];
            }

            responseHeaders['Access-Control-Allow-Origin'] = ['*'];
            responseHeaders['Access-Control-Allow-Methods'] = [
                'GET, POST, PUT, DELETE, OPTIONS',
            ];
            responseHeaders['Access-Control-Allow-Headers'] = ['*'];
            responseHeaders['Access-Control-Expose-Headers'] = ['*'];

            callback({ cancel: false, responseHeaders });
        },
    );
}

function registerSteamIpc() {
    ipcMain.handle('steam:isReady', () => steamClient !== undefined);

    ipcMain.handle('steam:getAppId', () => requireSteam().utils.getAppId());

    ipcMain.handle('steam:localplayer:getName', () => requireSteam().localplayer.getName());

    ipcMain.handle('steam:localplayer:getSteamId', () => {
        const id = requireSteam().localplayer.getSteamId();
        // BigInts don't serialise cleanly over every IPC path; coerce to string.
        return {
            steamId64: id.steamId64.toString(),
            steamId32: id.steamId32,
            accountId: id.accountId,
        };
    });

    ipcMain.handle('steam:localplayer:getLevel', () =>
        requireSteam().localplayer.getLevel(),
    );

    ipcMain.handle('steam:localplayer:setRichPresence', (_e, key: string, value?: string | null) =>
        requireSteam().localplayer.setRichPresence(key, value ?? null),
    );

    ipcMain.handle('steam:achievement:activate', (_e, name: string) =>
        requireSteam().achievement.activate(name),
    );
    ipcMain.handle('steam:achievement:clear', (_e, name: string) =>
        requireSteam().achievement.clear(name),
    );
    ipcMain.handle('steam:achievement:isActivated', (_e, name: string) =>
        requireSteam().achievement.isActivated(name),
    );

    ipcMain.handle('steam:overlay:activateDialog', (_e, dialog: number) =>
        requireSteam().overlay.activateDialog(dialog),
    );
    ipcMain.handle('steam:overlay:activateToWebPage', (_e, url: string) =>
        requireSteam().overlay.activateToWebPage(url),
    );
    ipcMain.handle('steam:overlay:activateToStore', (_e, appId: number, flag: number) =>
        requireSteam().overlay.activateToStore(appId, flag),
    );

    ipcMain.handle('steam:cloud:isEnabledForApp', () =>
        requireSteam().cloud.isEnabledForApp(),
    );
    ipcMain.handle('steam:cloud:readFile', (_e, name: string) =>
        requireSteam().cloud.readFile(name),
    );
    ipcMain.handle('steam:cloud:writeFile', (_e, name: string, content: string) =>
        requireSteam().cloud.writeFile(name, content),
    );
    ipcMain.handle('steam:cloud:deleteFile', (_e, name: string) =>
        requireSteam().cloud.deleteFile(name),
    );
    ipcMain.handle('steam:cloud:fileExists', (_e, name: string) =>
        requireSteam().cloud.fileExists(name),
    );
    ipcMain.handle('steam:cloud:listFiles', () =>
        requireSteam()
            .cloud.listFiles()
            .map((f) => ({ name: f.name, size: f.size.toString() })),
    );
}

app.whenReady().then(() => {
    setupSteamApiCors();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('ready', () => {
    Menu.setApplicationMenu(null);

    try {
        steamClient = steamworks.init(STEAM_APP_ID);
        console.log('Client name:', steamClient.localplayer.getName());
        steamworks.electronEnableSteamOverlay();
    } catch (err) {
        // Steam may not be running, or the app is launched outside of Steam.
        // Don't crash the Electron app just because the overlay isn't available.
        console.warn('Steam client failed to initialise:', err);
    }

    // Register handlers regardless of init success so the renderer can call
    // `steam.isReady()` and gracefully degrade when Steam isn't available.
    registerSteamIpc();
});

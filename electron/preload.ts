// Runs in a privileged context before the renderer page loads.
// Expose safe main-process APIs to the renderer here via contextBridge.
//
// Example:
// import { contextBridge, ipcRenderer } from 'electron';
// contextBridge.exposeInMainWorld('electronAPI', {
//     onUpdateCounter: (cb) => ipcRenderer.on('update-counter', cb),
// });

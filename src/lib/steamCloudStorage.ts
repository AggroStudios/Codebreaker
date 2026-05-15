import type { StateStorage } from 'zustand/middleware';

let storageTimeoutId: NodeJS.Timeout | null = null;

const saveToCloud = async (name: string, value: string) => {
    if (storageTimeoutId) {
        clearTimeout(storageTimeoutId);
    }
    storageTimeoutId = setTimeout(async () => {
        await window.steam.cloud.writeFile(name, value);
    }, 1000);
};

export const steamCloudStorage: StateStorage = {
    getItem: async (name) => {
        const item = await window.steam.cloud.readFile(name);
        return item ?? localStorage.getItem(name);
    },
    setItem: async (name, value) => {
        localStorage.setItem(name, value);
        await saveToCloud(name, value);
    },
    removeItem: async (name) => {
        localStorage.removeItem(name);
        await window.steam.cloud.deleteFile(name);
    },
};
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Server } from '../includes/Servers.interface';

export interface DailyDeal {
    server: Server;
    discountPercent: number;
}

export type ServersStoreState = {
    servers: Server[];
    dailyDeal: DailyDeal | null;
    setServers: (servers: Server[]) => void;
    setDailyDeal: (dailyDeal: DailyDeal) => void;
    setDailyOffers: (dailyOffers: DailyDeal[]) => void;
};

export const useServersStore = create<ServersStoreState>()(
    persist(
        (set) => ({
            servers: [],
            dailyDeal: null,
            setServers: (servers: Server[]) => set({ servers }),
            setDailyDeal: (dailyDeal: DailyDeal) => set({ dailyDeal }),
            setDailyOffers: (dailyOffers: DailyDeal[]) => set((state) => { 
                const newServers = state.servers.map((server) => {
                    const dailyOffer = dailyOffers.find((dailyOffer) => dailyOffer.server.id === server.id);
                    return { ...server, discount: dailyOffer?.discountPercent };
                });
                return { servers: newServers };
             }),
        }),
        {
            name: 'servers-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                servers: state.servers,
                dailyDeal: state.dailyDeal,
            }),
        },
    ),
);
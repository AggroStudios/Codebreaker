import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    experienceForLevel,
    Player,
    PlayerState,
} from '../includes/Player.interface';
import { storeProxy } from '../utils/storeProxy';

let hideMoneyLabelTimer: ReturnType<typeof setTimeout> | null = null;
let hideXpLabelTimer: ReturnType<typeof setTimeout> | null = null;

const animationWrapper = (
    timer: ReturnType<typeof setTimeout> | null,
    startCallback: () => void,
    endCallback: () => void,
): ReturnType<typeof setTimeout> => {
    if (timer !== null) {
        clearTimeout(timer);
    }
    startCallback();
    return setTimeout(() => {
        endCallback();
    }, 990);
};

export interface Upgrade {
    name: string;
    description: string;
    cost: number;
    tags: string[];
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
    player: {
        name: 'Player',
        money: 1000,
        experience: 0,
        nextLevel: experienceForLevel(1),
        level: 1,
        notifications: [],
        messages: [],
    } as Player,
    moneyLabel: null,
    xpLabel: null,
    hasSeenTutorial: false,
    markTutorialAsSeen: () => set({ hasSeenTutorial: true }),
    resetTutorial: () => set({ hasSeenTutorial: false }),
    purchasedUpgrades: [] as string[],
    purchaseUpgrade: (upgrade: string, cost: number) =>
        set((state) => {
            state.removeMoney(cost);
            return { purchasedUpgrades: [...state.purchasedUpgrades, upgrade] };
        }),
    setXpLabel: (amount: number | null, levelUp?: boolean) =>
        set(() => ({ xpLabel: { data: { amount, levelUp }, id: Date.now() } })),
    earnExperience: (amount: number) =>
        set((state) => {
            let nextLevel = experienceForLevel(state.player.level);
            let experience = state.player.experience + amount;
            let level = state.player.level;

            let levelUp = false;

            while (experience >= nextLevel) {
                experience -= nextLevel;
                level++;
                nextLevel = experienceForLevel(level);
                levelUp = true;
            }

            hideXpLabelTimer = animationWrapper(
                hideXpLabelTimer,
                () => state.setXpLabel(amount, levelUp),
                () => state.setXpLabel(null),
            );

            return {
                player: {
                    ...state.player,
                    experience,
                    level,
                    nextLevel,
                },
            };
        }),
    setMoneyLabel: (amount: number | null) =>
        set(() => ({ moneyLabel: { amount, id: Date.now() } })),
    addMoney: (amount: number) =>
        set((state) => {
            hideMoneyLabelTimer = animationWrapper(
                hideMoneyLabelTimer,
                () => state.setMoneyLabel(amount),
                () => state.setMoneyLabel(null),
            );
            return {
                player: { ...state.player, money: state.player.money + amount },
            };
        }),
    removeMoney: (amount: number) =>
        set((state) => {
            hideMoneyLabelTimer = animationWrapper(
                hideMoneyLabelTimer,
                () => state.setMoneyLabel(-amount),
                () => state.setMoneyLabel(null),
            );
            return {
                player: { ...state.player, money: state.player.money - amount },
            };
        }),
    addNotification: (notification) =>
        set((state) => ({
            player: {
                ...state.player,
                notifications: [
                    ...state.player.notifications,
                    { ...notification, unread: true },
                ],
            },
        })),
    addMessage: (message) =>
        set((state) => ({
            player: {
                ...state.player,
                messages: [
                    ...state.player.messages,
                    { ...message, unread: true },
                ],
            },
        })),
    markMessageAsRead: (index: number) =>
        set((state) => {
            const messages = [...state.player.messages];
            if (messages[index]) {
                messages[index].unread = false;
            }
            return { player: { ...state.player, messages } };
        }),
    markNotificationAsRead: (index: number) =>
        set((state) => {
            const notifications = [...state.player.notifications];
            if (notifications[index]) {
                notifications[index].unread = false;
            }
            return { player: { ...state.player, notifications } };
        }),
    markAllNotificationsAsRead: () =>
        set((state) => ({
            player: {
                ...state.player,
                notifications: state.player.notifications.map((n) => ({
                    ...n,
                    unread: false,
                })),
            },
        })),
    deleteNotification: (index: number) =>
        set((state) => ({
            player: {
                ...state.player,
                notifications: state.player.notifications.filter(
                    (_, i) => i !== index,
                ),
            },
        })),
    deleteAllNotifications: () =>
        set((state) => ({
            player: { ...state.player, notifications: [] },
        })),
  }),
  {
    name: 'player-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      player: state.player,
      purchasedUpgrades: state.purchasedUpgrades,
      hasSeenTutorial: state.hasSeenTutorial,
    }),
  },
  ),
);

/**
 * Live proxy for non-React callers (game engine classes). Reads always
 * reflect the current store state.
 */
export const playerStoreProxy: PlayerState = storeProxy(usePlayerStore);

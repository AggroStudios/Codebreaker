import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    experienceForLevel,
    Player,
    PlayerState,
} from '../includes/Player.interface';
import { IStatistics, IStatisticsCipher } from '../includes/Statistics.interface';
import { storeProxy } from '../utils/storeProxy';
import { ICipherType } from '../includes/Cipher.interface';

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

const makeDefaults = (): IStatistics => ({
    startTime: 0,
    totalPlayedTime: 0,
    totalCiphers: {},
    totalMoneyEarned: 0,
    totalMoneySpent: 0,
});

const normalizeStartTime = (raw: unknown): number => {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (typeof raw === 'string' && raw.length > 0) {
        const parsed = Date.parse(raw);
        if (!Number.isNaN(parsed)) return parsed;
    }
    return 0;
};

const isStatisticsCipher = (value: unknown): value is IStatisticsCipher =>
    !!value &&
    typeof value === 'object' &&
    'cipher' in value &&
    !!(value as { cipher?: unknown }).cipher &&
    typeof (value as { cipher: { name?: unknown } }).cipher.name === 'string';

const normalizeTotalCiphers = (raw: unknown): Record<string, IStatisticsCipher> => {
    const result: Record<string, IStatisticsCipher> = {};
    if (!raw || typeof raw !== 'object') return result;

    // Legacy: array of either IStatisticsCipher or Record<string, IStatisticsCipher>.
    if (Array.isArray(raw)) {
        for (const entry of raw) {
            if (isStatisticsCipher(entry)) {
                result[entry.cipher.name] = entry;
            } else if (entry && typeof entry === 'object') {
                for (const inner of Object.values(entry)) {
                    if (isStatisticsCipher(inner)) {
                        result[inner.cipher.name] = inner;
                    }
                }
            }
        }
        return result;
    }

    // Current: plain Record<string, IStatisticsCipher>.
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
        if (isStatisticsCipher(value)) {
            result[value.cipher.name ?? key] = value;
        }
    }
    return result;
};

const reviveStatistics = (raw: unknown): IStatistics => {
    const defaults = makeDefaults();
    if (!raw || typeof raw !== 'object') return defaults;

    const r = raw as Partial<Record<keyof IStatistics, unknown>>;

    return {
        startTime: normalizeStartTime(r.startTime),
        totalPlayedTime: typeof r.totalPlayedTime === 'number' ? r.totalPlayedTime : defaults.totalPlayedTime,
        totalCiphers: normalizeTotalCiphers(r.totalCiphers),
        totalMoneyEarned: typeof r.totalMoneyEarned === 'number' ? r.totalMoneyEarned : defaults.totalMoneyEarned,
        totalMoneySpent: typeof r.totalMoneySpent === 'number' ? r.totalMoneySpent : defaults.totalMoneySpent,
    };
};

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
                statistics: makeDefaults(),
            } as Player,
            moneyLabel: null,
            xpLabel: null,
            hasSeenTutorial: [] as string[],
            tutorialDisabled: false,
            tutorialStage: '',
            showTutorial: (stage: string) => set({ tutorialStage: stage }),
            setHasSeenTutorial: (stage: string) => set((state) => ({ hasSeenTutorial: [...state.hasSeenTutorial, stage] })),
            markTutorialAsSeen: (stage: string) => set((state) => ({ hasSeenTutorial: [...state.hasSeenTutorial, stage] })),
            resetTutorial: () => set({ hasSeenTutorial: [], tutorialDisabled: false, tutorialStage: '' }),
            setTutorialDisabled: (disabled: boolean) => set({ tutorialDisabled: disabled }),
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
                    player: {
                        ...state.player,
                        money: state.player.money + amount,
                        statistics: {
                            ...state.player.statistics,
                            totalMoneyEarned: state.player.statistics.totalMoneyEarned + amount,
                        },
                    },
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
                    player: {
                        ...state.player,
                        money: state.player.money - amount,
                        statistics: {
                            ...state.player.statistics,
                            totalMoneySpent: state.player.statistics.totalMoneySpent + amount,
                        },
                    },
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
            successCipher: (cipher: ICipherType) =>
                set((state) => ({
                    player: {
                        ...state.player,
                        statistics: { 
                            ...state.player.statistics,
                            totalCiphers: { 
                                ...state.player.statistics.totalCiphers, 
                                [cipher.name]: { 
                                    cipher, 
                                    success: (state.player.statistics.totalCiphers[cipher.name]?.success ?? 0) + 1, 
                                    failed: state.player.statistics.totalCiphers[cipher.name]?.failed ?? 0
                                 } 
                            }
                        },
                    },
                })
            ),
            failedCipher: (cipher: ICipherType) =>
                set((state) => ({
                    player: {
                        ...state.player,
                        statistics: {
                            ...state.player.statistics,
                            totalCiphers: {
                                ...state.player.statistics.totalCiphers,
                                [cipher.name]: {
                                    cipher,
                                    success: state.player.statistics.totalCiphers[cipher.name]?.success ?? 0,
                                    failed: (state.player.statistics.totalCiphers[cipher.name]?.failed ?? 0) + 1,
                                },
                            },
                        },
                    },
                })
            ),
            updateTotalPlayedTime: (time: number) =>
                set((state) => ({
                    player: {
                        ...state.player,
                        statistics: { ...state.player.statistics, totalPlayedTime: time - state.player.statistics.startTime },
                    },
                })),
        }),
        {
            name: 'player-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                player: state.player,
                purchasedUpgrades: state.purchasedUpgrades,
                hasSeenTutorial: state.hasSeenTutorial,
                tutorialDisabled: state.tutorialDisabled,
            }),
            merge: (persisted, current) => {
                const p = (persisted ?? {}) as Partial<PlayerState>;
                const persistedPlayer = (p.player ?? {}) as Partial<Player>;

                const statistics = reviveStatistics(persistedPlayer.statistics);
                if (!statistics.startTime) statistics.startTime = Date.now();

                return {
                    ...current,
                    ...p,
                    player: {
                        ...current.player,
                        ...persistedPlayer,
                        statistics,
                    },
                };
            },
            onRehydrateStorage: () => (state) => {
                // Zustand's hydrate uses the un-wrapped `set`, so the merged
                // state never reaches localStorage until an action fires.
                // Force a write so any initialised fields (e.g. startTime)
                // are committed immediately.
                if (!state) return;
                queueMicrotask(() => {
                    usePlayerStore.setState((s) => ({ player: s.player }));
                });
            },
        },
    ),
);

/**
* Live proxy for non-React callers (game engine classes). Reads always
* reflect the current store state.
*/
export const playerStoreProxy: PlayerState = storeProxy(usePlayerStore);

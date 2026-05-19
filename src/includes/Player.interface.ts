import { ICipherType } from './Cipher.interface';
import { StatKey } from './Character.interface';
import { Notification, Message } from './OperatingSystem.interface';
import { Server } from './Servers.interface';
import { IStatistics } from './Statistics.interface';

export const experienceForLevel = (level: number) =>
    Math.floor(100 * Math.pow(1.12, level - 1));

export interface IPurchasedUpgrade {
    upgradeId: string;
    tierId: string;
}

export type Player = {
    name: string;
    money: number;
    experience: number;
    level: number;
    nextLevel: number;
    /** Total XP earned across the player's entire career — never decreases on prestige. */
    careerXp: number;
    /** Count of completed prestige cycles. */
    lifetimePrestiges: number;
    /** Permanent stat bonuses applied by origin / character-creation choices. */
    statBonuses: Record<StatKey, number>;
    notifications: Notification[];
    messages: Message[];
    statistics: IStatistics;
};

export type MoneyLabelSpawn = { amount: number; id: number };
export type XpLabelSpawn = {
    data: { amount: number; levelUp?: boolean };
    id: number;
};

export interface PlayerState {
    player: Player;
    ownedServers: Server[];
    setOwnedServers: (servers: Server[]) => void;
    moneyLabel: MoneyLabelSpawn | null;
    xpLabel: XpLabelSpawn | null;
    hasSeenTutorial: string[];
    tutorialDisabled: boolean;
    tutorialStage: string;
    showTutorial: (stage: string) => void;
    setHasSeenTutorial: (stage: string) => void;
    markTutorialAsSeen: (stage: string) => void;
    resetTutorial: () => void;
    setTutorialDisabled: (disabled: boolean) => void;
    setMoneyLabel: (amount: number | null) => void;
    setXpLabel: (amount: number | null, levelUp?: boolean) => void;
    earnExperience: (amount: number) => void;
    /** Hard-reset of player state for prestige: money/level/experience back to fresh start, bumps lifetimePrestiges, careerXp preserved. */
    prestige: () => void;
    addMoney: (amount: number) => void;
    removeMoney: (amount: number) => void;
    addNotification: (notification: Notification) => void;
    addMessage: (message: Message) => void;
    markMessageAsRead: (index: number) => void;
    markNotificationAsRead: (index: number) => void;
    markAllNotificationsAsRead: () => void;
    deleteNotification: (index: number) => void;
    deleteAllNotifications: () => void;
    purchasedUpgrades: IPurchasedUpgrade[];
    purchaseUpgradeTier: (upgradeId: string, tierId: string, cost: number) => void;
    successCipher: (cipher: ICipherType) => void;
    failedCipher: (cipher: ICipherType) => void;
    updateTotalPlayedTime: (time: number) => void;
    pushIncomeRate: (rate: number) => void;
}

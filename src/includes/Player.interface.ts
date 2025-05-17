import { Notification, Message } from './OperatingSystem.interface';

export const experienceForLevel = (level: number) => Math.floor(100 * Math.pow(2.5, level - 1));

export type Player = {
    name: string,
    money: number,
    experience: number,
    level: number,
    nextLevel: number,
    notifications: Notification[],
    messages: Message[],
};

export interface PlayerState {
    player: Player,
    earnExperience: (amount: number) => void,
    addMoney: (amount: number) => void,
    removeMoney: (amount: number) => void,
    addNotification: (notification: Notification) => void,
    addMessage: (message: Message) => void,
    markMessageAsRead: (index: number) => void,
    markNotificationAsRead: (index: number) => void,
};
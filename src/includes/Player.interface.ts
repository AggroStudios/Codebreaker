import { Notification, Message } from './OperatingSystem.interface';

export type Player = {
    name: string,
    money: number,
    notifications: Notification[],
    messages: Message[],
};

export interface PlayerState {
    player: Player,
    addMoney: (amount: number) => void,
    removeMoney: (amount: number) => void,
    addNotification: (notification: Notification) => void,
    addMessage: (message: Message) => void,
    markMessageAsRead: (index: number) => void,
    markNotificationAsRead: (index: number) => void,
};
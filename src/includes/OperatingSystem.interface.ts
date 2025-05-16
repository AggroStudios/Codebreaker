export enum NotificationLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
};

export type Notification = {
    message: string,
    level: NotificationLevel,
    unread: boolean,
};

export type Message = {
    sender: string,
    body: string,
    date: Date,
    unread: boolean,
};
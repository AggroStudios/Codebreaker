export type User = {
    username: string,
    first?: string,
    last?: string,
    email?: string,
    lastLogin?: Date,
};

export interface AuthenticationState {
    user?: User,
    login: (username: string, password: string) => void,
    logout: () => void,
};
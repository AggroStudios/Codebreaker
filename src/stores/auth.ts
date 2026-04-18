import { create } from 'zustand';
import {
    AuthenticationState,
    User,
} from '../includes/Authentication.interface';

const users: User[] = [
    {
        username: 'sgermain',
        first: 'Simon',
        last: 'Germain',
        email: 'sgermain06@gmail.com',
    },
    {
        username: 'cgalante',
        first: 'Carmen',
        last: 'Galante',
        email: 'mystik2002@gmail.com',
    },
];

export const useAuthStore = create<AuthenticationState>((set) => ({
    user: undefined,
    login: (username: string, password: string): boolean => {
        const foundUser = users.find((i) => i.username === username);
        if (foundUser) {
            if (password === 'password') {
                set(() => ({
                    user: {
                        ...foundUser,
                        lastLogin: new Date(),
                    },
                }));
                return true;
            }
            console.log('Invalid password.');
        } else {
            console.log('User not found:', username);
        }
        return false;
    },
    logout: () => console.log('Logout'),
}));

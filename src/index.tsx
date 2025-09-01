/* @refresh reload */
import { render } from 'solid-js/web';
import create from 'solid-zustand';
import Layout from './Layout';
// import LoadingScreen from './components/LoadingScreen';

// import { createSignal } from 'solid-js';

import { ThemeProvider, createTheme } from '@suid/material/styles';

import { AuthenticationState, User } from './includes/Authentication.interface';
import { PlayerState, Player, experienceForLevel } from './includes/Player.interface';
import OperatingSystem from './lib/OperatingSystem';

import './index.css';
import { CodiumProcessor } from './lib/processors';
import { Station } from './lib/station';
import { CodiumMemory } from './lib/memory';
import { IStorageType } from './includes/Process.interface';
import { CodiumStorageHdd } from './lib/storage';

const darkTheme = createTheme({
    palette: {
        mode: 'dark'
    }
});

const users: Array<User> = [
    {
        username: 'sgermain',
        first: 'Simon',
        last: 'Germain',
        email: 'sgermain06@gmail.com'
    },
    {
        username: 'cgalante',
        first: 'Carmen',
        last: 'Galante',
        email: 'mystik2002@gmail.com'
    }
]

const useStore = create<AuthenticationState>(set => ({
    user: null,
    login: (username: string, password: string): boolean => {
        const foundUser = users.find(i => {
            console.log('Comparing to:', i);
            return i.username === username;
        });
        if (foundUser) {
            console.log('Found user!', username);
            if (password === 'password') {
                set(() => ({
                    user: {
                        ...foundUser,
                        lastLogin: new Date()
                    }
                }));
                return true;
            }
            else {
                console.log('Invalid password.');
            }
        }
        else {
            console.log('User not found:', username);
        }
        return false;
    },
    logout: () => console.log('Logout'),
}));

const playerStore = create<PlayerState>(set => ({
    player: {
        name: 'Player',
        money: 1000,
        experience: 0,
        nextLevel: experienceForLevel(1),
        level: 1,
        notifications: [],
        messages: []
    } as Player,
    earnExperience: (amount: number) => set(state => {

        let nextLevel = experienceForLevel(state.player.level);
        let experience = state.player.experience + amount;
        let level = state.player.level;

        while (experience >= nextLevel) {
            experience -= nextLevel;
            level++;
            nextLevel = experienceForLevel(level);
        }
        
        return {
            player: {
                ...state.player,
                experience,
                level,
                nextLevel,
            }
        };
    }),
    addMoney: (amount: number) => set(state => ({ player: { ...state.player, money: state.player.money + amount } })),
    removeMoney: (amount: number) => set(state => ({ player: { ...state.player, money: state.player.money - amount } })),
    addNotification: (notification) => set(state => ({
        player: {
            ...state.player,
            notifications: [...state.player.notifications, { ...notification, unread: true }]
        }
    })),
    addMessage: (message) => set(state => ({
        player: {
            ...state.player,
            messages: [...state.player.messages, { ...message, unread: true }]
        }
    })),
    markMessageAsRead: (index: number) => set(state => {
        const messages = [...state.player.messages];
        if (messages[index]) {
            messages[index].unread = false;
        }
        return { player: { ...state.player, messages } };
    }),
    markNotificationAsRead: (index: number) => set(state => {
        const notifications = [...state.player.notifications];
        if (notifications[index]) {
            notifications[index].unread = false;
        }
        return { player: { ...state.player, notifications } };
    }),
}))();

const root = document.getElementById('root')

const processor = new CodiumProcessor();
const operatingSystem = new OperatingSystem(playerStore);
const memory = new CodiumMemory();
const storage = new Array<IStorageType>(new CodiumStorageHdd());

const station = new Station(processor, operatingSystem, memory, storage);

// const [loadingProgress, setLoadingProgress] = createSignal<number>(0);

// const interval = setInterval(() => {
//     if (loadingProgress() < 100) {
//         setLoadingProgress(loadingProgress() + 10);
//     }
//     else {
//         clearInterval(interval);
//     }
// }, 1000);

render(() => (
    <ThemeProvider theme={darkTheme}>
        <Layout auth={useStore()} station={station} player={playerStore} />
        {/* <Router>
            <Route path="*" component={() => 
        </Router> */}
        {/* <LoadingScreen loading={loadingProgress()} /> */}
    </ThemeProvider>
), root!)

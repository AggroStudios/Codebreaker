/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import create from 'solid-zustand';
import Layout from './Layout';
import { ThemeProvider, createTheme } from '@suid/material/styles';

import { AuthenticationState, User } from './includes/Authentication.interface';

import GameController from './lib/GameController';

import './index.css';

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
        email: 'mystic2000@gmail.com'
    }
]

const useStore = create<AuthenticationState>(set => ({
    user: null,
    login: (username: string, password: string): Boolean => {
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

const state = useStore();

const root = document.getElementById('root')

const gameController = new GameController();

render(() => (
    <ThemeProvider theme={darkTheme}>
        <Router>
            <Layout auth={state} gameController={gameController} />
        </Router>
    </ThemeProvider>
), root!)

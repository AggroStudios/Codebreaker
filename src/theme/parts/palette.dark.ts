import {
    blue,
    grey,
} from '@mui/material/colors';

//Base palette for dark mode
const getPaletteDark = ({ augmentColor }) => {

    const colors = {
        blue: augmentColor({
            color: {
                main: '#61dafb',
            },
            name: 'blue',
        }),
        cyan: augmentColor({
            color: {
                main: '#26c6da',
            },
            name: 'cyan',
        }),
        grey: augmentColor({
            color: {
                lighter: grey[100],
                main: grey[500],
            },
            name: 'grey',
        }),
        green: augmentColor({
            color: {
                main: '#0af5b0',
            },
            name: 'green',
        }),
        orange: augmentColor({
            color: {
                main: '#ffb74d',
            },
            name: 'orange',
        }),
        purple: augmentColor({
            color: {
                main: '#9c7fe0',
            },
            name: 'purple',
        }),
        red: augmentColor({
            color: {
                main: '#ff2828',
            },
            name: 'red',
        }),
    };

    return {
        mode: 'dark',
        background: {
            bright: grey[800],
            default: grey[900],
            paper: '#333',
        },
        accent: colors.blue,
        ...colors,
        logo: {
            text: '#fff',
        },
        primary: augmentColor({
            color: {
                main: '#0af5b0',
            },
            name: 'primary',
        }),
        secondary: {
            main: grey[500],
        },
        link: {
            color: '#fff',
            hover: blue[300],
        },
    };
};

export default getPaletteDark;

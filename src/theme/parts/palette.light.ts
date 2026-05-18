import {
  blue,
  blueGrey,
  grey,
} from '@mui/material/colors';

//Base palette for light mode
const getPaletteLight = ({ augmentColor }) => {
  return {
    mode: 'light',
    background: {
      bright: grey[50],
      default: grey[100],
      paper: '#fff',
    },
    accent: augmentColor({
      color: {
        main: '#0af5b0'
      }
    }),
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
    logo: {
      text: '#000',
    },
    primary: augmentColor({
      color: {
        main: '#0af5b0',
      },
      name: 'primary',
    }),
    secondary: {
      main: blueGrey[500],
    },
    link: {
      color: '#000',
      hover: blue[800],
    },
  };
};

export default getPaletteLight;

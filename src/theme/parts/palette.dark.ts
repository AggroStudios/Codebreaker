import {
  blue,
  blueGrey,
  //cyan,
  //green,
  grey,
  //orange,
  purple,
  red
} from '@mui/material/colors';

//Base palette for dark mode
const getPaletteDark = ({ augmentColor }) => {
  return {
    mode: 'dark',
    background: {
      bright: grey[800],
      default: grey[900],
      paper: '#333',
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
        main: purple[500],
      },
      name: 'purple',
    }),
    red: augmentColor({
      color: {
        main: red[500],
      },
      name: 'red',
    }),
    logo: {
      text: '#fff',
    },
    primary: {
      main: red[500],
    },
    secondary: {
      main: blueGrey[500],
    },
    //theme additions...
    branding: augmentColor({
      color: {
        main: '#cc1b00',
      },
      name: 'branding',
    }),
    link: {
      color: '#fff',
      hover: blue[300],
    },
  };
};

export default getPaletteDark;

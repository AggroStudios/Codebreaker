import { blue, blueGrey, green, grey, red } from '@mui/material/colors';

//Base palette for light mode
const getPaletteLight = ({ augmentColor }) => {
  return {
    mode: 'light',
    background: {
      bright: grey[50],
      default: grey[100],
      paper: '#fff',
    },
    grey: augmentColor({
      color: {
        lighter: grey[200],
        main: grey[600],
      },
      name: 'grey',
    }),
    green: augmentColor({
      color: {
        main: green[500],
      },
      name: 'green',
    }),
    logo: {
      text: '#000',
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
      color: '#000',
      hover: blue[800],
    },
  };
};

export default getPaletteLight;

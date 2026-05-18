import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

//Custom palette additions for light mode
export const getPaletteLightComponents = (palette) => {
  return {
    //For elements that should look like Paper
    paperLike: {
      backgroundColor: palette.background.paper,
      borderColor: palette.grey.light,
      hover: {
        backgroundColor: palette.grey.light,
      },
      selected: {
        backgroundColor: alpha(palette.grey.light, 0.5),
        borderColor: palette.grey.main,
      },
    },
    //For react-datepicker, react-select and some overrides in ./components.js
    textField: {
      backgroundColor: '#fff',
      borderColor: grey[600],
      color: palette.text.primary,
      focused: {
        borderColor: grey[500],
      },
      hovered: {
        borderColor: palette.text.primary,
      },
      option: {
        backgroundColor: '#fff',
        hovered: {
          backgroundColor: grey[200],
        },
        focused: {
          backgroundColor: grey[300],
        },
        selected: {
          backgroundColor: grey[300],
        },
      },
      tags: {
        backgroundColor: grey[300],
        color: grey[900],
      },
    },
  };
};

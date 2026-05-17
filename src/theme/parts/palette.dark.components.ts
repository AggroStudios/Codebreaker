import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

//Custom palette additions for dark mode
export const getPaletteDarkComponents = (palette) => {
  return {
    //For elements that should look like Paper
    paperLike: {
      backgroundColor: palette.background.paper,
      borderColor: palette.grey.dark,
      hover: {
        backgroundColor: palette.grey.dark,
      },
      selected: {
        backgroundColor: alpha(palette.grey.light, 0.5),
        borderColor: palette.grey.light,
      },
    },
    //For react-datepicker, react-select and some overrides in ./components.js
    textField: {
      backgroundColor: grey[800],
      borderColor: grey[600],
      color: palette.text.primary,
      focused: {
        borderColor: grey[500],
      },
      hovered: {
        borderColor: palette.text.primary,
      },
      option: {
        backgroundColor: grey[800],
        hovered: {
          backgroundColor: grey[700],
        },
        focused: {
          backgroundColor: grey[600],
        },
        selected: {
          backgroundColor: grey[600],
        },
      },
      tags: {
        backgroundColor: grey[700],
        color: grey[300],
      },
    },
  };
};

//import { green, grey, red } from '@mui/material/colors';

const getComponents = () => {
  return {
    MuiCssBaseline: {
      //A few global styles are in public/css/index.css and print.css
      styleOverrides: ({ palette }) => ({
        html: {
          fontSize: '62.5%',
        },
        body: {
          backgroundColor: palette.background.default,
          color: palette.text.primary,
          margin: 0,
          padding: 0,
        },
        '#root': {
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        },
        '@keyframes statusPulse': {
          '0%': {
            opacity: 1
          },
          '50%': {
            opacity: 0.5
          },
          '100%': {
            opacity: 1
          }
        },
        '@keyframes shimmer': {
          '0%': {
            transform: 'translateX(-100%)'
          },
          '50%': {
            transform: 'translateX(100%)'
          },
          '100%': {
            transform: 'translateX(100%)'
          }
        },
        '*:focus': {
          outline: 'none !important',
        },

      }),
    },
    Glyph: {
      defaultProps: {},
      styleOverrides: {
        root: () => ({
          position: 'absolute',
          top: '-12%',
          fontFamily: "'Fira Code', monospace",
          fontWeight: 600,
          animationName: 'glyphDrift',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }),
      },
    },
    GlyphCardHeader: {
      defaultProps: {},
      styleOverrides: {
        root: {
          overflow: 'hidden', 
          position: 'relative'
        },
      },
    },
    FactionAvatar: {
      defaultProps: {},
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 52,
          width: 52,
          '& svg': {
            height: 28,
            width: 28
          }
        },
      },
    },
    LiveDot: {
      defaultProps: {},
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey.main,
          borderRadius: '50%',
          boxShadow: `0 0 6px ${theme.palette.grey.main}`,
          display: 'inline-block',
          flexShrink: 0,
          verticalAlign: 'middle',
          alignItems: 'center',
          height: theme.spacing(1),
          margin: `auto ${theme.spacing(1)} auto auto`,
          opacity: 1,
          width: theme.spacing(1),
        }),
        online: ({ theme }) => ({
          animation: 'statusPulse 1.6s ease-in-out infinite',
          backgroundColor: theme.palette.green.main,
          boxShadow: `0 0 6px ${theme.palette.green.main}`,
        }),
      },
    },
    DarkWebCardReputation: {
      defaultProps: {},
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.accent.main,
        }),
        label: ({ theme }) => ({
          letterSpacing: '0.18em',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.secondary.main,
        }),
        value: ({ theme }) => ({
          fontFamily: '"Fira Code", "Fira Code VF", monospace',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: 1.2,
          letterSpacing: '0.06em',
          color: theme.palette.accent.main,
        }),
      },
    },
    // MuiAccordion: {
    //   variants: [
    //     {
    //       props: { variant: "menu" },
    //       style: {
    //         border: "none",
    //         "&.MuiAccordion-root": {
    //           margin: 0,
    //           padding: "1.2rem 0 1.2rem 0",
    //           "&::before": {
    //             height: 0,
    //           },
    //           "&.Mui-expanded": {
    //             margin: 0,
    //             padding: "1.2rem 0 1.2rem 0",
    //           },
    //         },
    //         ".MuiAccordion-heading": {
    //           border: "none",
    //         },
    //         ".MuiAccordionSummary-root": {
    //           margin: 0,
    //           minHeight: "unset",
    //           "&.Mui-expanded": {
    //             margin: 0,
    //             minHeight: "unset",
    //           },
    //         },
    //         ".MuiAccordionSummary-content": {
    //           margin: 0,
    //           "&.Mui-expanded": {
    //             margin: 0,
    //           },
    //         },
    //         ".MuiAccordionDetails-root": {
    //           padding: 0,
    //         },
    //         ".MuiList-root": {
    //           "&.MuiList-padding": {
    //             padding: 0,
    //           },
    //         },
    //       },
    //     },
    //   ],
    // },
    // MuiButton: {
    //   defaultProps: {
    //     color: "tertiary", //The tertiary variant defined below
    //     size: "medium",
    //     variant: "text",
    //   },
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       padding: theme.spacing(1, 2),
    //       "&.Mui-disabled": {
    //         opacity: theme.palette.action.disabledOpacity,
    //       },
    //     }),
    //     colorDefault: ({ theme }) => ({
    //       backgroundColor: theme.palette.background.paper,
    //     }),
    //   },
    //   variants: [
    //     {
    //       props: { variant: "media" },
    //       style: ({ theme }) => ({
    //         backgroundColor: theme.palette.primary.main,
    //         borderRadius: 90,
    //         color: theme.palette.common.white,
    //         minWidth: "unset",
    //         padding: ".6rem",
    //         width: "auto",
    //         "&:hover": {
    //           backgroundColor: theme.palette.branding.main,
    //         },
    //         "&:disabled": {
    //           backgroundColor: theme.palette.grey.dark,
    //           color: theme.palette.grey.lighter,
    //           pointerEvents: "auto",
    //         },
    //       }),
    //     },
    //     {
    //       props: { fullWidth: true },
    //       style: ({ theme }) => ({
    //         paddingLeft: theme.spacing(3),
    //         paddingRight: theme.spacing(3),
    //         width: "100%",
    //         whiteSpace: "nowrap",
    //       }),
    //     },
    //     {
    //       props: { variant: "media", color: "inactive" },
    //       style: ({ theme }) => ({
    //         backgroundColor: theme.palette.grey.main,
    //         ".MuiSvgIcon-root": {
    //           color: theme.palette.primary.contrastText,
    //         },
    //         "&:hover": {
    //           backgroundColor: theme.palette.branding.main,
    //         },
    //       }),
    //     },
    //     {
    //       props: { variant: "text", color: "tertiary" },
    //       style: ({ theme }) => ({
    //         color: theme.palette.text.primary,
    //       }),
    //     },
    //     {
    //       props: { variant: "contained", color: "tertiary" },
    //       style: ({ theme }) => ({
    //         backgroundColor: theme.palette.background.bright,
    //         color: theme.palette.text.primary,
    //       }),
    //     },
    //   ],
    // },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(6px)`,
          WebkitBackdropFilter: `blur(6px)`,
        },
      },
    },
    // MuiCardActions: {
    //   styleOverrides: {
    //     root: {
    //       padding: "1.6rem",
    //     },
    //   },
    // },
    // MuiCardContent: {
    //   styleOverrides: {
    //     root: {
    //       padding: "1.6rem",
    //     },
    //   },
    // },
    // MuiCheckbox: {
    //   defaultProps: {
    //     color: "secondary",
    //   },
    //   styleOverrides: {
    //     root: {
    //       padding: ".4rem",
    //     },
    //   },
    // },
    // MuiCircularProgress: {
    //   defaultProps: {
    //     color: "primary",
    //   },
    // },
    // MuiDialog: {
    //   styleOverrides: {
    //     root: () => ({
    //       ".MuiDialog-paper": {
    //         backgroundImage: "none",
    //         position: "relative",
    //       },
    //     }),
    //   },
    //   variants: [
    //     {
    //       props: { className: "formDialog" }, // Example of custom props
    //       style: ({ theme }) => ({
    //         ".MuiDialog-paper": {
    //           backgroundColor: theme.palette.background.default,
    //           ".MuiButton-containedTertiary": {
    //             backgroundColor: theme.palette.background.paper,
    //           },
    //         },
    //       }),
    //     },
    //   ],
    // },
    // MuiDialogActions: {
    //   styleOverrides: {
    //     root: {
    //       padding: "2rem 2.4rem",
    //     },
    //   },
    // },
    // MuiDialogContent: {
    //   styleOverrides: {
    //     root: {
    //       padding: "2.4rem",
    //     },
    //     dividers: {
    //       borderBottom: " unset",
    //     },
    //   },
    // },
    // MuiDialogTitle: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       fontSize: theme.typography.h4.fontSize,
    //       lineHeight: theme.typography.h4.lineHeight,
    //       padding: theme.spacing(3, 6, 3, 3),
    //     }),
    //   },
    // },
    // MuiDialogContentText: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       color: "inherit",
    //       fontSize: theme.typography.body1.fontSize,
    //       lineHeight: theme.typography.body1.lineHeight,
    //     }),
    //   },
    // },
    // MuiFormControl: {
    //   defaultProps: {
    //     color: "primary",
    //   },
    // },
    // MuiFormControlLabel: {
    //   styleOverrides: {
    //     root: {
    //       margin: 0,
    //     },
    //   },
    // },
    // MuiFormHelperText: {
    //   styleOverrides: {
    //     root: {
    //       marginLeft: 3,
    //     },
    //   },
    // },
    // MuiIconButton: {
    //   defaultProps: {
    //     color: "grey",
    //     size: "medium",
    //   },
    // },
    // MuiInput: {
    //   styleOverrides: {
    //     root: {
    //       fontSize: "1.6rem",
    //       lineHeight: "1.9rem",
    //       padding: 0,
    //     },
    //     input: ({ theme }) => ({
    //       padding: theme.spacing(1, 1),
    //     }),
    //     inputMultiline: ({ theme }) => ({
    //       padding: theme.spacing(1, 2),
    //     }),
    //   },
    // },
    // MuiInputBase: {
    //   styleOverrides: {
    //     root: {
    //       "&.Mui-disabled": {
    //         cursor: "not-allowed",
    //         pointerEvents: "auto",
    //       },
    //     },
    //   },
    // },
    // MuiInputAdornment: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       ...theme.typography.input,
    //       color: theme.palette.textField.color,
    //       padding: "0 .8rem",
    //       justifyContent: "center",
    //       margin: 0,
    //       maxHeight: "unset",
    //       width: "auto",
    //       ".MuiTypography-root": {
    //         fontSize: "inherit",
    //         lineHeight: "inherit",
    //       },
    //     }),
    //     outlined: ({ theme }) => ({
    //       backgroundColor: theme.palette.textField.tags.backgroundColor,
    //       color: theme.palette.text.primary,
    //     }),
    //     positionEnd: ({ theme }) => ({
    //       borderLeft: `1px solid ${theme.palette.textField.borderColor}`,
    //       padding: "0 .8rem 0 .6rem",
    //     }),
    //     positionStart: ({ theme }) => ({
    //       borderRight: `1px solid ${theme.palette.textField.borderColor}`,
    //       padding: "0 .6rem 0 .8rem",
    //     }),
    //   },
    // },
    // MuiLinearProgress: {
    //   defaultProps: {
    //     color: "primary",
    //   },
    // },
    // MuiLink: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       color: theme.palette.link.color,
    //       textDecoration: "underline",
    //       "&:hover": {
    //         color: theme.palette.link.hover,
    //       },
    //     }),
    //   },
    // },
    // MuiList: {
    //   styleOverrides: {
    //     dense: {
    //       padding: "1.2rem 0 2.4rem 0",
    //     },
    //     root: {
    //       "&.noWrap": {
    //         ".MuiFormLabel-root": {
    //           overflow: "hidden",
    //           textOverflow: "ellipsis",
    //           textWrap: "nowrap",
    //         },
    //       },
    //     },
    //   },
    // },
    // MuiListItem: {
    //   styleOverrides: {
    //     dense: {
    //       padding: 0,
    //     },
    //   },
    // },
    // MuiPickersTextField: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       backgroundColor: theme.palette.textField.backgroundColor,
    //       ".clearButton": {
    //         opacity: 1,
    //       },
    //       ".MuiButtonBase-root": {
    //         padding: ".2rem",
    //       },
    //       ".MuiPickersInputBase-sectionsContainer": {
    //         padding: "1.1rem 0",
    //       },
    //       ".MuiPickersOutlinedInput-notchedOutline": {
    //         borderColor: theme.palette.textField.borderColor,
    //       },
    //       "&.Mui-focused": {
    //         ".MuiPickersOutlinedInput-notchedOutline": {
    //           borderColor: `${theme.palette.textField.focused.borderColor} !important`,
    //           outline: 0,
    //         },
    //       },
    //     }),
    //   },
    // },
    // MuiOutlinedInput: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       fontSize: "1.6rem",
    //       lineHeight: "1.9rem",
    //       padding: 0,
    //       "&.MuiInputBase-adornedStart": {
    //         ".MuiInputAdornment-root": {
    //           height: "4rem",
    //           justifyContent: "center",
    //           margin: 0,
    //           maxHeight: "unset",
    //           width: "auto",
    //         },
    //         ".MuiOutlinedInput-input, .MuiOutlinedInput-root.MuiInputBase-multiline":
    //           {
    //             padding: "1rem 1.6rem 1rem .8rem",
    //           },
    //       },
    //       "&.Mui-disabled": {
    //         ".MuiOutlinedInput-notchedOutline": {
    //           borderColor: theme.palette.textField.borderColor,
    //           opacity: theme.palette.action.disabledOpacity,
    //           pointerEvents: "auto",
    //         },
    //         ".MuiInputAdornment-root": {
    //           opacity: theme.palette.action.disabledOpacity,
    //         },
    //       },
    //       "&.Mui-focused": {
    //         ".MuiOutlinedInput-notchedOutline": {
    //           borderColor: theme.palette.textField.focused.borderColor,
    //           outline: 0,
    //         },
    //       },
    //     }),
    //     input: ({ theme }) => ({
    //       backgroundColor: theme.palette.textField.backgroundColor,
    //       padding: "1rem 1.6rem",
    //     }),
    //     inputMultiline: ({ theme }) => ({
    //       backgroundColor: theme.palette.textField.backgroundColor,
    //       padding: "1rem 1.6rem",
    //     }),
    //     notchedOutline: ({ theme }) => ({
    //       borderColor: theme.palette.textField.borderColor,
    //     }),
    //   },
    // },
    // MuiPaper: {
    //   variants: [
    //     {
    //       props: { variant: "darkweb" },
    //       style: ({ theme }) => ({
    //         position: "relative",
    //         padding: theme.spacing(1),
    //         "&:hover": {
    //           backgroundColor: theme.palette.paperLike.selected.backgroundColor,
    //           cursor: "pointer",
    //         },
    //         "&.isSelected": {
    //           backgroundColor: theme.palette.paperLike.selected.backgroundColor,
    //         },
    //       }),
    //     },
    //   ],
    // },
    // MuiRadio: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       padding: theme.spacing(0.5),
    //     }),
    //   },
    // },
    // MuiSvgIcon: {
    //   defaultProps: {
    //     fontSize: "medium",
    //   },
    //   styleOverrides: {
    //     colorAction: {
    //       color: grey[600],
    //     },
    //     //To inherit color from the parent component, ex: Button
    //     colorInherit: {
    //       color: "inherit",
    //     },
    //     colorMuted: {
    //       color: grey[600],
    //     },
    //     colorRed: {
    //       color: red[600],
    //     },
    //     colorGreen: {
    //       color: green[600],
    //     },
    //     fontSizeLarge: {
    //       fontSize: "3rem",
    //       height: "3rem",
    //       width: "3rem",
    //     },
    //     fontSizeMedium: {
    //       fontSize: "2.4rem",
    //       height: "2.4rem",
    //       width: "2.4rem",
    //     },
    //     fontSizeSmall: {
    //       fontSize: "2rem",
    //       height: "2rem",
    //       width: "2rem",
    //     },
    //     fontSizeXs: {
    //       fontSize: "1.4rem",
    //       height: "1.4rem",
    //       width: "1.4rem",
    //     },
    //   },
    // },
    // MuiSwitch: {
    //   styleOverrides: {
    //     root: {
    //       height: 30,
    //       padding: 8,
    //       width: 54,
    //     },
    //     colorPrimary: {
    //       color: red[600],
    //       "&.Mui-checked": {
    //         color: green[600], //Checked color for the thumb
    //       },
    //     },
    //     input: {
    //       margin: 0,
    //     },
    //     switchBase: {
    //       padding: 6,
    //       top: -2,
    //       "@media print": {
    //         display: "none",
    //       },
    //     },
    //     track: {
    //       opacity: 0.2,
    //       backgroundColor: red[600], //Default color for the track
    //       "@media print": {
    //         display: "none",
    //       },
    //       ".Mui-checked.Mui-checked + &": {
    //         backgroundColor: green[600] + " !important", //Checked color for the track
    //         opacity: 0.7,
    //       },
    //     },
    //   },
    // },
    // MuiTab: {
    //   styleOverrides: {
    //     root: {
    //       height: 38,
    //     },
    //   },
    // },
    // MuiTable: {
    //   styleOverrides: {
    //     root: {
    //       "& tbody tr:last-child td": {
    //         border: "unset",
    //       },
    //     },
    //   },
    // },
    // MuiTableCell: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       padding: theme.spacing(1, 2),
    //       textAlign: "left",
    //       verticalAlign: "top",
    //       "&.truncated": {
    //         overflow: "hidden",
    //         whiteSpace: "nowrap",
    //         textOverflow: "ellipsis",
    //       },
    //     }),
    //   },
    // },
    // MuiTableRow: {
    //   styleOverrides: {
    //     root: {
    //       height: "auto",
    //     },
    //   },
    // },
    // MuiTextField: {
    //   styleOverrides: {
    //     root: {
    //       ".MuiInputBase-inputMultiline": {
    //         resize: "vertical",
    //       },
    //     },
    //   },
    // },
    // MuiToolbar: {
    //   styleOverrides: {
    //     root: {
    //       padding: ".1rem 1.6rem",
    //       minHeight: "6.4rem",
    //       width: "100%",
    //     },
    //   },
    // },
    // MuiTypography: {
    //   defaultProps: {
    //     variant: "body1",
    //   },
    //   styleOverrides: {
    //     gutterBottom: {
    //       marginBottom: "1em", //Proportional to the font-size of the variant
    //     },
    //   },
    // },
    //Keeps useMediaQuery from refreshing twice
    //https://mui.com/material-ui/react-use-media-query/#api
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
  };
};

export default getComponents;

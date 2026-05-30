import { useMemo } from 'react';
import { createTheme, extendTheme, type PaletteOptions } from '@mui/material/styles';
import {
    breakpoints,
    getComponents,
    getPaletteDark,
    getPaletteLight,
    typography,
} from './parts/index.js';
import { getPaletteDarkComponents } from './parts/palette.dark.components.js';
import { getPaletteLightComponents } from './parts/palette.light.components.js';

declare module '@mui/material/styles' {
    interface BreakpointOverrides {
        xx: true;
    }
}

export const useSiteTheme = () => {
    const siteTheme = useMemo(() => {
        //Part 1 - Provides augmentColor, allows easy addition of colors to palette
        const baseTheme = createTheme();
        const {
            palette: { augmentColor },
        } = baseTheme;

        //Part 2 - Setup basic palette with light/dark schemes
        //A third color scheme could potentially be defined here
        const basePaletteDark = getPaletteDark({ augmentColor });
        const basePaletteLight = getPaletteLight({ augmentColor });
        let memoTheme = extendTheme({
            colorSchemes: {
                dark: {
                    palette: basePaletteDark as PaletteOptions,
                },
                light: {
                    palette: basePaletteLight as PaletteOptions,
                },
            },
        });
        //Part 3 - Augment basic palette with paperLike, textField defs
        //for items we want to resemble TextField/OutlinedInput and Paper
        const fullPaletteDark = {
            ...memoTheme.colorSchemes.dark.palette,
            ...getPaletteDarkComponents(memoTheme.colorSchemes.dark.palette),
        };
        const fullPaletteLight = {
            ...memoTheme.colorSchemes.light.palette,
            ...getPaletteLightComponents(memoTheme.colorSchemes.light.palette),
        };
        memoTheme = extendTheme({
            breakpoints: { values: breakpoints },
            colorSchemes: {
                dark: {
                    palette: fullPaletteDark as PaletteOptions,
                },
                light: {
                    palette: fullPaletteLight as PaletteOptions,
                },
            },
            typography,
        });
        //Part 4 - Extend theme components. Access palette, spacing via function:
        return extendTheme(memoTheme, {
            components: getComponents(),
            defaultColorScheme: 'dark'//Extend theme has changed... Enforce the mode here
        });
    }, []);

    return siteTheme;
};

























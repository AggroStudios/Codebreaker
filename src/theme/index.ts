import { useMemo, CSSProperties } from 'react';
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
        xxx: true;
        xxxx: true;
    }
    interface TypographyVariants {
        code1: CSSProperties;
        code2: CSSProperties;
        code3: CSSProperties;
        code4: CSSProperties;
        code5: CSSProperties;
        terminal1: CSSProperties;
        terminal2: CSSProperties;
        terminal3: CSSProperties;
        terminal4: CSSProperties;
    }
    interface TypographyVariantsOptions {
        code1: CSSProperties;
        code2: CSSProperties;
        code3: CSSProperties;
        code4: CSSProperties;
        code5: CSSProperties;
        terminal1: CSSProperties;
        terminal2: CSSProperties;
        terminal3: CSSProperties;
        terminal4: CSSProperties;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        code1: true;
        code2: true;
        code3: true;
        code4: true;
        code5: true;
        terminal1: true;
        terminal2: true;
        terminal3: true;
        terminal4: true;
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

























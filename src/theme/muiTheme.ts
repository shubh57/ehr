// src/theme/muiTheme.ts

// Dependencies
import { createTheme, PaletteOptions, Components, Shadows } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface TypeTertiary {
        main: string;
    }
    interface TypePrimary {
        darker: string;
    }
    interface TypeBackground {
        paperLight: string;
        paperDark: string;
    }
    interface TypeText {
        light: string;
        darkest: string;
    }
    interface TypeBorder {
        default: string;
        secondary: string;
    }
    interface Palette {
        tertiary: TypeTertiary;
        border: TypeBorder;
    }

    interface PaletteOptions {
        background?: Partial<TypeBackground>;
        tertiary?: TypeTertiary;
        text?: Partial<TypeText>;
        border?: Partial<TypeBorder>;
    }
}

// Define the color palette
const palette: PaletteOptions = {
    primary: {
        main: '#F97316', // Orange
        dark: '#C2410C', // dark Orange
    },
    secondary: {
        main: '#F1F5F9', // Light grey
        dark: '#E2E8F0', // Dark grey
        contrastText: '#CBD5E1', // Darkest grey
    },
    tertiary: {
        main: '#FCD34D', // Yellow
    },
    error: {
        main: '#B91C1C', // Red
    },
    background: {
        default: '#FFFFFF', // White background
        paper: '#F1F5F9', // Light grey background for paper-like components
        paperLight: '#F8FAFC', // Lighter grey background for paper-like components
        paperDark: '#DEE5ED', // Darker grey background for paper-like components
    },
    text: {
        primary: '#020617', // Dark text color (primary text)
        secondary: '#475569', // Grey text color (secondary text)
        light: '#1E293B', // Light grey text color
        darkest: '#000000', // Black text color
        disabled: '#A0AEC0',
    },
    border: {
        default: '#CBD5E1',
        secondary: '#EEF1F6',
    },
};

// Define typography
const typography = {
    fontFamily: '"Readex Pro", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
        fontSize: '28px',
        fontWeight: 400,
        lineHeight: '36px',
    },
    h3: {
        fontSize: '22px',
        fontWeight: 400,
        lineHeight: '28px',
        letterSpacing: '0.15px',
    },
    h4: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '24px',
        letterSpacing: '0.1px',
    },
    subtitle1: {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '16px',
        letterSpacing: '0.5px',
    },
    subtitle2: {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '16px',
        letterSpacing: '0.4px',
    },
    body1: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '24px',
        letterSpacing: '0.1px',
    },
    body2: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        letterSpacing: '0.25px',
    },
    button: {
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '20px',
        letterSpacing: '0.1px',
        textTransform: 'none' as 'none', // Disable auto-capitalization
    },
};

// Define component-specific styles
const components: Components = {
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                textTransform: 'none',
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                padding: '16px',
            },
        },
    },
};

// Create the theme
let theme = createTheme({
    palette,
    typography,
    components,
    spacing: 4, // The base spacing unit, which represents 4px by default
    shadows: Array(25).fill('none') as Shadows, // Flat shadows
});

theme = createTheme(theme, {
    // Custom colors created with augmentColor go here
    palette: {
        salmon: theme.palette.augmentColor({
            color: {
                main: '#A34914',
                dark: '78350F',
            },
            name: 'rustOrange',
        }),
    },
});

export default theme;

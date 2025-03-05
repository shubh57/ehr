// src/theme.ts

import { createTheme, PaletteOptions, Components, Shadows } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface TypeTertiary {
        main: string;
        lightOrange: string;
        lightYellow: string;
        lightGreen: string;
        red: string;
    }
    interface TypePrimary {
        darker: string;
    }
    interface PaperYellow {
        default: string;
        dark: string;
        darklight: string;
        light: string;
        textyellow: string;
    }
    interface PaperGreen {
        default: string;
    }
    interface PaperRed {
        default: string;
    }
    interface TypeBackground {
        paperLight: string;
        paperExtraLight: string;
        paperDark: string;
        brownishDark: string;
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
        paperYellow: PaperYellow;
        paperGreen: PaperGreen;
        paperRed: PaperRed;
    }

    interface PaletteOptions {
        background?: Partial<TypeBackground>;
        tertiary?: TypeTertiary;
        text?: Partial<TypeText>;
        border?: Partial<TypeBorder>;
        paperYellow?: Partial<PaperYellow>;
        paperGreen?: Partial<PaperGreen>;
        paperRed?: Partial<PaperRed>;
    }
}

// Updated color palette based on modern design research and trends common among Fortune 500 companies.
const palette: PaletteOptions = {
    primary: {
        main: '#1E3A8A', // A deep, corporate blue evokes trust and stability.
        dark: '#172554', // A darker variant for emphasis.
    },
    secondary: {
        main: '#F5F7FA', // A soft, neutral background with a hint of blue.
        dark: '#E4E7EB', // A slightly darker tone for subtle contrast.
        contrastText: '#6B7280', // Refined medium grey for accessible text.
    },
    tertiary: {
        main: '#0D9488', // A muted teal accent that adds a modern touch.
        lightOrange: '#FBBF24', // A refined amber for high-priority highlights.
        lightYellow: '#FACC15', // A soft, subdued yellow for medium emphasis.
        lightGreen: '#4ADE80', // A fresh, yet muted green for low priority.
        red: '#DC2626', // A sophisticated red for error states and alerts.
    },
    error: {
        main: '#B91C1C', // A refined error red.
    },
    background: {
        default: '#FFFFFF', // Clean white for a crisp look.
        paper: '#F5F7FA', // Consistent with secondary main for paper surfaces.
        paperLight: '#F8FAFC', // A very light background for alternate surfaces.
        paperExtraLight: '#FCFDFE', // Nearly white, for high contrast.
        paperDark: '#E4E7EB', // For contexts requiring a darker paper background.
        brownishDark: '#5D4037', // A muted brown used sparingly for contrast.
    },
    text: {
        primary: '#1F2937', // Modern dark slate for primary text.
        secondary: '#4B5563', // A refined medium grey for secondary text.
        light: '#374151', // Slightly lighter than primary for subheadings.
        darkest: '#111827', // Near-black for maximum contrast.
        disabled: '#A0AEC0', // Light grey for disabled states.
    },
    border: {
        default: '#E4E7EB', // Subtle borders that maintain a clean look.
        secondary: '#CBD5E0', // A slightly different tone for secondary borders.
    },
    paperYellow: {
        default: '#EAB308', // A mature amber tone.
        dark: '#A16207',
        darklight: '#FDE68A',
        light: '#FCD34D',
        textyellow: '#92400E',
    },
    paperGreen: {
        default: '#14B8A6', // A modern teal for paper accents.
    },
    paperRed: {
        default: '#EF4444', // A refined red tone for paper accents.
    },
};

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
    h5: {
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '24px',
        letterSpacing: '0.5px',
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
        textTransform: 'none' as 'none',
    },
};

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

let theme = createTheme({
    palette,
    typography,
    components,
    spacing: 4, // Base spacing unit
    shadows: Array(25).fill('none') as Shadows, // Flat shadow style for a clean modern look
});

theme = createTheme(theme, {
    // Augment the palette with a corporate blue tone for additional branding if needed.
    palette: {
        salmon: theme.palette.augmentColor({
            color: {
                main: '#1E3A8A',
                dark: '#172554',
            },
            name: 'corporateBlue',
        }),
    },
});

export default theme;

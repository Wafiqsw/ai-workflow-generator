export const theme = {
    colors: {
        // Dark mode - Gold & Black
        dark: {
            primary: {
                50: '#fffbeb',
                100: '#fef3c7',
                200: '#fde68a',
                300: '#fcd34d',
                400: '#fbbf24',
                500: '#f59e0b',  // Main gold
                600: '#d97706',
                700: '#b45309',
                800: '#92400e',
                900: '#78350f',
            },
            secondary: {
                50: '#fdf4ff',
                100: '#fae8ff',
                200: '#f5d0fe',
                300: '#f0abfc',
                400: '#e879f9',
                500: '#d946ef',  // Accent purple-pink
                600: '#c026d3',
                700: '#a21caf',
                800: '#86198f',
                900: '#701a75',
            },
            background: {
                primary: '#0a0a0a',    // Deep black
                secondary: '#1a1a1a',  // Slightly lighter black
                tertiary: '#2a2a2a',   // Card backgrounds
                overlay: 'rgba(10, 10, 10, 0.95)',
            },
            text: {
                primary: '#ffffff',
                secondary: '#d4d4d4',
                tertiary: '#a3a3a3',
                muted: '#737373',
            },
            border: {
                primary: 'rgba(251, 191, 36, 0.2)',  // Gold with opacity
                secondary: 'rgba(255, 255, 255, 0.1)',
            }
        },
        // Light mode - White & Gold
        light: {
            primary: {
                50: '#78350f',
                100: '#92400e',
                200: '#b45309',
                300: '#d97706',
                400: '#f59e0b',
                500: '#fbbf24',  // Main gold
                600: '#fcd34d',
                700: '#fde68a',
                800: '#fef3c7',
                900: '#fffbeb',
            },
            secondary: {
                50: '#701a75',
                100: '#86198f',
                200: '#a21caf',
                300: '#c026d3',
                400: '#d946ef',
                500: '#e879f9',  // Accent purple-pink
                600: '#f0abfc',
                700: '#f5d0fe',
                800: '#fae8ff',
                900: '#fdf4ff',
            },
            background: {
                primary: '#ffffff',    // Pure white
                secondary: '#fafafa',  // Off-white
                tertiary: '#f5f5f5',   // Card backgrounds
                overlay: 'rgba(255, 255, 255, 0.95)',
            },
            text: {
                primary: '#0a0a0a',
                secondary: '#404040',
                tertiary: '#737373',
                muted: '#a3a3a3',
            },
            border: {
                primary: 'rgba(251, 191, 36, 0.3)',  // Gold with opacity
                secondary: 'rgba(0, 0, 0, 0.1)',
            }
        }
    },
    gradients: {
        dark: {
            primary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            secondary: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d946ef 100%)',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            accent: 'linear-gradient(135deg, #fbbf24 0%, #d946ef 100%)',
        },
        light: {
            primary: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            secondary: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #e879f9 100%)',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #ffffff 100%)',
            accent: 'linear-gradient(135deg, #fcd34d 0%, #f0abfc 100%)',
        }
    },
    shadows: {
        dark: {
            sm: '0 1px 2px 0 rgba(251, 191, 36, 0.05)',
            md: '0 4px 6px -1px rgba(251, 191, 36, 0.1)',
            lg: '0 10px 15px -3px rgba(251, 191, 36, 0.2)',
            xl: '0 20px 25px -5px rgba(251, 191, 36, 0.3)',
            glow: '0 0 20px rgba(251, 191, 36, 0.5)',
        },
        light: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            glow: '0 0 20px rgba(251, 191, 36, 0.4)',
        }
    }
}

export type Theme = typeof theme
export type ThemeMode = 'dark' | 'light'

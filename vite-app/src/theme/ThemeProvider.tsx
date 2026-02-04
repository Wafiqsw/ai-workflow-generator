import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ThemeMode } from './colors'

interface ThemeContextType {
    mode: ThemeMode
    toggleTheme: () => void
    setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        // Check localStorage first
        const saved = localStorage.getItem('theme') as ThemeMode
        if (saved) return saved

        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light'
        }
        return 'dark'
    })

    useEffect(() => {
        localStorage.setItem('theme', mode)
        document.documentElement.setAttribute('data-theme', mode)
    }, [mode])

    const toggleTheme = () => {
        setMode(prev => prev === 'dark' ? 'light' : 'dark')
    }

    const setTheme = (newMode: ThemeMode) => {
        setMode(newMode)
    }

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

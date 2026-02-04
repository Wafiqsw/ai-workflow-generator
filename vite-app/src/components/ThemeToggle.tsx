import React from 'react'
import { useTheme } from '../theme'

const ThemeToggle: React.FC = () => {
    const { mode, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="p-3.5 rounded-2xl bg-gold-500/10 hover:bg-gold-500/20 border-2 border-gold-500/30 hover:border-gold-500/50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            aria-label="Toggle theme"
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
            {mode === 'dark' ? (
                <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    )
}

export { ThemeToggle }

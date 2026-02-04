import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}) => {
    const baseStyles = 'font-bold rounded-2xl transition-all duration-200 inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'

    const variants = {
        primary: 'bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:from-gold-600 hover:to-gold-700 shadow-xl hover:shadow-2xl hover:shadow-gold-500/50 hover:scale-105 active:scale-95',
        secondary: 'bg-gold-500/10 text-[var(--text-primary)] hover:bg-gold-500/20 backdrop-blur-sm border-2 border-gold-500/30 hover:border-gold-500/50 hover:scale-105 active:scale-95',
        outline: 'border-2 border-gold-500 text-gold-500 hover:bg-gold-500/10 hover:border-gold-600 hover:scale-105 active:scale-95',
        ghost: 'text-[var(--text-secondary)] hover:bg-gold-500/10 hover:text-[var(--text-primary)]'
    }

    const sizes = {
        sm: 'px-5 py-2.5 text-sm',
        md: 'px-7 py-3.5 text-base',
        lg: 'px-10 py-5 text-lg'
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export { Button }

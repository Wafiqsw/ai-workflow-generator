import React from 'react'

interface LoadingbarProps {
    progress: number // 0-100
    color?: 'gold' | 'green' | 'blue' | 'red' | 'purple'
    label?: string
    showPercentage?: boolean
}

const Loadingbar: React.FC<LoadingbarProps> = ({
    progress,
    color = 'gold',
    label,
    showPercentage = true
}) => {
    const colorClasses = {
        gold: 'bg-gold-500',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        red: 'bg-red-500',
        purple: 'bg-purple-500'
    }

    const glowClasses = {
        gold: 'shadow-gold-500/50',
        green: 'shadow-green-500/50',
        blue: 'shadow-blue-500/50',
        red: 'shadow-red-500/50',
        purple: 'shadow-purple-500/50'
    }

    return (
        <div className="w-full">
            {(label || showPercentage) && (
                <div className="flex items-center justify-between mb-2">
                    {label && (
                        <span className="text-sm font-semibold text-[var(--text-secondary)]">
                            {label}
                        </span>
                    )}
                    {showPercentage && (
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                            {Math.round(progress)}%
                        </span>
                    )}
                </div>
            )}

            <div className="relative w-full h-3.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border border-[var(--border-secondary)]">
                <div
                    className={`
            absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out
            ${colorClasses[color]} shadow-lg ${glowClasses[color]}
          `}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
            </div>
        </div>
    )
}

export { Loadingbar }
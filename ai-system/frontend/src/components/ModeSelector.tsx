import React from 'react'
import { motion } from 'framer-motion'
import { Search, Code, Bug, MessageSquare } from 'lucide-react'

export type ChatMode = 'chat' | 'research' | 'coding' | 'debug'

interface ModeSelectorProps {
    currentMode: ChatMode
    onModeChange: (mode: ChatMode) => void
    disabled?: boolean
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
    currentMode,
    onModeChange,
    disabled
}) => {
    const modes = [
        { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'research', label: 'Research', icon: Search, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { id: 'coding', label: 'Code', icon: Code, color: 'text-green-400', bg: 'bg-green-500/10' },
        { id: 'debug', label: 'Debug', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10' }
    ] as const

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-black/20 border border-white/5 backdrop-blur-sm">
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    disabled={disabled}
                    className={`
            relative flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
            ${currentMode === mode.id ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    {currentMode === mode.id && (
                        <motion.div
                            layoutId="activeMode"
                            className={`absolute inset-0 rounded-md ${mode.bg} border border-white/10`}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className={`relative z-10 ${currentMode === mode.id ? mode.color : ''}`}>
                        <mode.icon size={12} />
                    </span>
                    <span className="relative z-10">{mode.label}</span>
                </button>
            ))}
        </div>
    )
}

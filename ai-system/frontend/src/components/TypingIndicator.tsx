import React from 'react'
import { motion } from 'framer-motion'

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
          />
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">Assistant is thinking</span>
    </div>
  )
}
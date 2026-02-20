import React, { useRef, useEffect } from 'react'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Command } from 'lucide-react'

interface ChatInterfaceProps {
  messages: Array<{
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    status?: 'sending' | 'delivered' | 'error'
    steps?: any[]
    currentStepIndex?: number
  }>
  isLoading: boolean
  activeMode: string
  onSendMessage: (content: string, mode: string) => void
  onClearMessages: () => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  activeMode,
  onSendMessage,
  onClearMessages
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true)
  const [showScrollButton, setShowScrollButton] = React.useState(false)

  // Find the last assistant message that is currently "Thinking"
  const lastAssistantMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const currentStep = (lastAssistantMessage?.role === 'assistant' && lastAssistantMessage?.steps && lastAssistantMessage.steps.length > 0)
    ? lastAssistantMessage.steps[lastAssistantMessage.steps.length - 1]
    : null;

  // Smart auto-scroll: only scroll to bottom if user is already near bottom
  useEffect(() => {
    if (!shouldAutoScroll) return

    // If it's a new user message, smooth scroll to show it
    const lastMessage = messages[messages.length - 1]
    const isUserMessage = lastMessage?.role === 'user'

    if (isUserMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // For streaming/bot messages, instant scroll to avoid "fighting" the user
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [messages, shouldAutoScroll])

  // Detect when user manually scrolls
  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    // Increased threshold to 150px to be more forgiving
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150

    setShouldAutoScroll(isNearBottom)
    setShowScrollButton(!isNearBottom)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShouldAutoScroll(true)
    setShowScrollButton(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen bg-[#0A0A0B] relative overflow-hidden">
      {/* Precision Header */}
      <header className="flex-shrink-0 z-20 px-8 py-6 flex items-center justify-between border-b border-white/[0.03] bg-[#0A0A0B]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Command size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white/90">Sentinel Workspace</h1>
            <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em] mt-0.5">{activeMode}</p>
          </div>
        </div>

        <button
          onClick={onClearMessages}
          disabled={messages.length === 0}
          className="text-[11px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors disabled:opacity-0"
        >
          Clear Session
        </button>
      </header>

      {/* Primary Interaction Space */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-custom relative w-full"
      >
        <div className="max-w-3xl mx-auto pt-8 px-6 pb-32">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="mt-20 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] mb-6">
                <Sparkles size={12} className="text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">System Ready</span>
              </div>
              <h2 className="text-4xl font-bold text-white tracking-tight mb-4">How can I assist you today?</h2>
              <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed mb-12">
                Using <strong>{activeMode}</strong> engine. Ask a question, analyze data, or explore new concepts.
              </p>

              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {['Technical Analysis', 'Creative Synthesis', 'Code Generation', 'Strategic Advice'].map((tag) => (
                  <button key={tag} className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/40 hover:bg-white/[0.04] hover:text-white hover:border-white/10 transition-all font-medium">
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <MessageList messages={messages} />

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6 flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-300">Sentinel Core</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">Thinking</span>
                      </div>
                      <div className="h-6 flex items-center gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 }}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                      </div>
                      <motion.p
                        key={currentStep?.content || 'analyzing'}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-white/40 font-mono italic"
                      >
                        {currentStep?.content || 'Analyzing request vector...'}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Floating Scroll Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-28 right-8 p-3 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors z-40"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Input Controller */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-8 pt-4 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/95 to-transparent px-6">
        <div className="max-w-3xl mx-auto">
          <InputArea
            onSendMessage={(c) => onSendMessage(c, activeMode)}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark as theme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Sparkles, ChevronDown, ChevronUp, Globe, Brain, Terminal } from 'lucide-react'
import { SimulationStep } from '../data/mockChatData'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    status?: 'sending' | 'delivered' | 'error'
    steps?: SimulationStep[]
    currentStepIndex?: number
  }
}

export const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(({ message }, ref) => {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [isStepsExpanded, setIsStepsExpanded] = useState(true)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter steps to show only thoughts and actions
  const processSteps = message.steps?.filter(s => s.type !== 'message') || [];
  const hasSteps = processSteps.length > 0;

  // Find citations from the message step
  const messageStep = message.steps?.find(s => s.type === 'message');
  const citations = messageStep?.citation;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-8 max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
    >
      <div className={`flex items-center gap-2 mb-2 px-1`}>
        {!isUser && (
          <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={12} className="text-indigo-400" />
          </div>
        )}
        <span className="text-[11px] font-semibold text-white/40 tracking-wider">
          {isUser ? 'You' : 'Assistant'}
        </span>
      </div>

      <div className={`bubble-base ${isUser ? 'bubble-user' : 'bubble-assistant'} relative group w-full`}>

        {/* Process/Thinking Steps */}
        {!isUser && hasSteps && (
          <div className="mb-4 rounded-lg bg-black/20 border border-white/5 overflow-hidden">
            <button
              onClick={() => setIsStepsExpanded(!isStepsExpanded)}
              className="w-full px-4 py-2 flex items-center justify-between text-xs font-medium text-white/40 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Brain size={12} />
                <span>Thinking Process</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[10px]">{processSteps.length} steps</span>
              </div>
              {isStepsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <AnimatePresence>
              {isStepsExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 space-y-3 pt-1">
                    {processSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-xs">
                        <div className="mt-0.5 text-white/20">
                          {step.type === 'action' ? <Globe size={12} /> : <Brain size={12} />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-white/70">{step.content}</p>
                          {step.details && (
                            <p className="text-white/30 text-[10px] pl-2 border-l border-white/10">{step.details}</p>
                          )}
                        </div>
                        {/* Show spinner for current step if message is not fully delivered */}
                        {message.status !== 'delivered' && idx === (message.currentStepIndex || 0) && (
                          <div className="h-3 w-3 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
                        )}
                        {/* Show checkmark for completed steps */}
                        {(idx < (message.currentStepIndex || 0) || message.status === 'delivered') && (
                          <Check size={12} className="text-green-500/50" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          {/* If content is empty but we have steps, show a loader or placeholder if needed, 
               but usually the steps accordion handles the "waiting" state visually. */}
          {(!message.content && message.status !== 'delivered' && !hasSteps) && (
            <span className="animate-pulse">Thinking...</span>
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="relative my-4 rounded-xl overflow-hidden bg-black/40 border border-white/5">
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                      <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{match[1]}</span>
                      <button
                        onClick={() => {
                          const code = String(children).replace(/\n$/, '')
                          navigator.clipboard.writeText(code)
                        }}
                        className="text-white/30 hover:text-white transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, '')}
                      style={theme}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '1.25rem',
                        background: 'transparent',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                ) : (
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs" {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Citations Footer */}
        {citations && citations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {citations.map((cite, idx) => (
              <a
                key={idx}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors group/cite"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center bg-white/5 text-white/30 group-hover/cite:text-white/60">
                  <Globe size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate group-hover/cite:text-indigo-300 transition-colors">{cite.title}</p>
                  <p className="text-[10px] text-white/30 truncate">{new URL(cite.url).hostname}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Minimal Actions */}
        {!isUser && (
          <div className="absolute top-2 -right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="p-1.5 text-white/20 hover:text-white transition-colors"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 px-1">
        <span className="text-[10px] text-white/20 font-medium">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </motion.div>
  )
})

import React, { useState, useRef, KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'

interface InputAreaProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled = false }) => {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedInput = inputValue.trim()
    if (trimmedInput && !disabled) {
      onSendMessage(trimmedInput)
      setInputValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const isSendDisabled = !inputValue.trim() || disabled

  return (
    <div className="max-w-3xl mx-auto w-full px-4 mb-2">
      <form
        onSubmit={handleSubmit}
        className="input-pill flex items-end gap-3 group"
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message AI Assistant..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/20 py-1 resize-none scrollbar-hide text-[15px] leading-relaxed"
          rows={1}
          disabled={disabled}
          style={{
            minHeight: '24px',
            maxHeight: '200px',
          }}
        />

        <button
          type="submit"
          disabled={isSendDisabled}
          className={`h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300 ${isSendDisabled
              ? 'bg-white/5 text-white/10'
              : 'bg-white text-black hover:scale-105 active:scale-95'
            }`}
        >
          {disabled ? (
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          ) : (
            <ArrowUp size={20} strokeWidth={2.5} />
          )}
        </button>
      </form>
      <p className="text-center text-[10px] text-white/15 mt-3 uppercase tracking-[0.1em] font-medium">
        AI-Powered Insight Engine • Optimized for High-Fidelity Output
      </p>
    </div>
  )
}
import React from 'react'
import { MessageBubble } from './MessageBubble'
import { AnimatePresence } from 'framer-motion'

interface MessageListProps {
  messages: Array<{
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    status?: 'sending' | 'delivered' | 'error'
  }>
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-12 py-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
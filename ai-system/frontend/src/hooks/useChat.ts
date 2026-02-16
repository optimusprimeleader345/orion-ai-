import { useState, useCallback, useRef, useEffect } from 'react'
import { SimulationStep } from '../data/mockChatData'
import { apiService } from '../services/api'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  status?: 'sending' | 'delivered' | 'error'
  steps?: SimulationStep[]
  currentStepIndex?: number
  isThinking?: boolean
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<{ id: string, title: string, date: Date }[]>(() => {
    const saved = localStorage.getItem('chat_sessions')
    return saved ? JSON.parse(saved) : []
  })

  // Ensure an active session exists
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id)
    }
  }, [activeSessionId, sessions])

  const sendMessage = useCallback(async (content: string, mode: string = 'Standard Operations') => {
    if (!content.trim()) return

    let currentSessionId = activeSessionId

    // Create session if none exists
    if (!currentSessionId) {
      try {
        const session = await apiService.createSession(content.slice(0, 30))
        currentSessionId = session.session_id
        setActiveSessionId(currentSessionId)
        setSessions(prev => {
          const updated = [{ id: session.session_id, title: session.title, date: new Date() }, ...prev]
          localStorage.setItem('chat_sessions', JSON.stringify(updated))
          return updated
        })
      } catch (err) {
        console.error('Failed to create session on message send:', err)
        setError('Failed to initialize session.')
        return
      }
    }

    // 1. Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      status: 'delivered'
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // 2. Prepare Assistant Message Placeholder
    const assistantMessageId = `resp_${Date.now()}`
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      status: 'sending',
      steps: [],
      isThinking: true
    }
    setMessages(prev => [...prev, initialAssistantMessage])

    abortControllerRef.current = new AbortController()

    try {
      // 3. Initiate Stream Request via relative proxy path
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: content.trim(),
          request_id: assistantMessageId,
          metadata: {
            session_id: currentSessionId,
            active_mode: mode
          }
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error(`Server Error: ${response.status}`)
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentSteps: SimulationStep[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)
            if (event.type === 'thought' || event.type === 'action') {
              const newStep: SimulationStep = {
                type: event.type === 'thought' ? 'thought' : 'action',
                content: event.content,
                delay: 0
              }
              currentSteps = [...currentSteps, newStep]
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, steps: currentSteps, currentStepIndex: currentSteps.length - 1 }
                  : msg
              ))
            } else if (event.type === 'token') {
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + event.content, isThinking: false }
                  : msg
              ))
            } else if (event.type === 'error') {
              throw new Error(event.content)
            }
          } catch (e) {
            console.error("Error parsing stream chunk", e)
          }
        }
      }

      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, status: 'delivered', isThinking: false } : msg))

    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError('Connection interrupted. Please try again.')
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, status: 'error' } : msg))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [activeSessionId, sessions])

  const createNewSession = useCallback(async () => {
    try {
      const session = await apiService.createSession('New Chat')
      const newSession = { id: session.session_id, title: session.title, date: new Date() }
      setSessions(prev => {
        const updated = [newSession, ...prev]
        localStorage.setItem('chat_sessions', JSON.stringify(updated))
        return updated
      })
      setActiveSessionId(session.session_id)
      setMessages([])
      return session.session_id
    } catch (err) {
      console.error('Failed to create session:', err)
      setError('Failed to create new chat.')
      return null
    }
  }, [])

  const loadSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId)
    setIsLoading(true)
    try {
      const history = await apiService.getSessionHistory(sessionId)
      const mappedMessages: Message[] = history.map((msg, idx) => ({
        id: `msg_${idx}_${Date.now()}`,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.timestamp),
        status: 'delivered'
      }))
      setMessages(mappedMessages)
    } catch (err) {
      console.error('Failed to load session history:', err)
      setError('Failed to load conversation history.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    sessions,
    activeSessionId,
    createNewSession,
    loadSession
  }
}

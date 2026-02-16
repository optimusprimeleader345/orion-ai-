import { useState, useEffect } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { SettingsPanel } from './components/SettingsPanel'
import { useChat } from './hooks/useChat'
import { apiService } from './services/api'
import { Settings, Menu, X, Rocket, Search, Terminal, MessageSquare, History, Database, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Default open for better discovery
  const [systemStatus, setSystemStatus] = useState<any>(null)

  // New state for mode selection
  const [activeMode, setActiveMode] = useState('Standard Operations')

  const chat = useChat()

  useEffect(() => {
    const loadSystemStatus = async () => {
      try {
        const status = await apiService.getSystemStatus()
        setSystemStatus(status)
      } catch (error) {
        console.error('Failed to load system status:', error)
      }
    }
    loadSystemStatus()
  }, [])

  const navItems = [
    { name: 'Standard Operations', icon: MessageSquare, description: 'General Purpose AI' },
    { name: 'Deep Research', icon: Search, description: 'Web Analysis & Synthesis' },
    { name: 'Coding Logic', icon: Terminal, description: 'Development & Debugging' },
    { name: 'System Core', icon: Shield, description: 'Security & Infrastructure' },
  ]

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Refined Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-[#0A0A0B]/95 border-r border-white/5 z-50 flex flex-col backdrop-blur-xl"
          >
            {/* Sidebar Header */}
            <div className="p-6 pt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Rocket size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-white/90 leading-tight">Sentinel<br /><span className="text-white/40 font-normal">Workspace</span></h1>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors lg:hidden"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Selection */}
            <div className="flex-1 px-4 overflow-y-auto scrollbar-hide">
              <div className="space-y-6">

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-2 block mb-3">Modes</span>
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setActiveMode(item.name)}
                      className={`w-full text-left px-3 py-3 rounded-xl flex items-start gap-3 transition-all duration-200 group ${activeMode === item.name
                        ? 'bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                        : 'hover:bg-white/[0.03] border border-transparent'
                        }`}
                    >
                      <div className={`mt-0.5 ${activeMode === item.name ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/60'}`}>
                        <item.icon size={16} />
                      </div>
                      <div>
                        <span className={`text-sm font-medium block ${activeMode === item.name ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                          {item.name}
                        </span>
                        <span className="text-[11px] text-white/20 leading-tight">
                          {item.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-2 block mb-2">History</span>
                  <button
                    onClick={() => chat.createNewSession()}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors flex items-center gap-2 mb-2"
                  >
                    <Rocket size={12} />
                    <span>New Chat</span>
                  </button>
                  <div className="space-y-1">
                    {chat.sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => chat.loadSession(session.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 group ${chat.activeSessionId === session.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
                          }`}
                      >
                        <History size={12} className={`transition-opacity ${chat.activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                        <span className="truncate">{session.title}</span>
                      </button>
                    ))}
                    {chat.sessions.length === 0 && (
                      <div className="px-3 py-2 text-xs text-white/20 italic">No history yet</div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* User / Status Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold ring-2 ring-black">
                  OP
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">Operator</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${systemStatus ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500'}`} />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Online</span>
                  </div>
                </div>
                <Settings size={14} className="text-white/20 hover:text-white cursor-pointer transition-colors" onClick={() => setIsSettingsOpen(true)} />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${isSidebarOpen ? 'pl-72' : 'pl-0'}`}>
        {/* Minimal Control Bar */}
        <div className="absolute top-6 left-6 z-40 flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#0A0A0B]/80 backdrop-blur border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Core Workspace */}
        <main className="flex-1 flex flex-col">
          <ChatInterface
            messages={chat.messages}
            isLoading={chat.isLoading}
            activeMode={activeMode}
            onSendMessage={chat.sendMessage}
            onClearMessages={chat.clearMessages}
          />
        </main>

        {/* Global Overlays */}
        <AnimatePresence>
          {isSettingsOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSettingsOpen(false)}
                className="fixed inset-0 bg-[#0A0A0B]/60 backdrop-blur-sm z-[60]"
              />
              <div className="fixed inset-y-0 right-0 z-[70] w-96 flex">
                <SettingsPanel
                  onClose={() => setIsSettingsOpen(false)}
                  systemStatus={systemStatus}
                />
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
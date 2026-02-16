import React, { useState, useEffect } from 'react'
import { X, Activity, Cpu, Save, Zap, Brain, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiService } from '../services/api'

interface SettingsPanelProps {
  onClose: () => void
  systemStatus: any
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  systemStatus
}) => {
  const [currentModel, setCurrentModel] = useState('gemini-pro')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await apiService.getConfig()
        if (config.gemini_model) {
          setCurrentModel(config.gemini_model)
        }
      } catch (error) {
        console.error('Failed to fetch config:', error)
      }
    }
    fetchConfig()
  }, [])

  const handleSaveConfig = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    try {
      await apiService.updateConfig({ gemini_model: currentModel })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to update config:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="w-full h-full bg-[#121214] border-l border-white/5 p-8 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white/90">System Configuration</h2>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Refine Logic Parameters</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/20 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-10 overflow-y-auto scrollbar-hide">
        {/* Telemetry */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Activity size={14} className="text-indigo-400" />
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Live Telemetry</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Core Integrity', value: systemStatus?.system_health === 'initialized' ? 'Stable' : 'Unknown', status: systemStatus?.system_health === 'initialized' },
              { label: 'Logic Provider', value: systemStatus?.llm_provider || 'Pending', status: true },
              { label: 'Config State', value: systemStatus?.configuration_valid ? 'Verified' : 'Unverified', status: systemStatus?.configuration_valid }
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between transition-hover hover:bg-white/[0.03]">
                <span className="text-xs font-medium text-white/30">{item.label}</span>
                <span className={`text-xs font-bold ${item.status ? 'text-indigo-400' : 'text-red-400'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Model Selection */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Cpu size={14} className="text-indigo-400" />
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Model Selection</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', icon: Zap, desc: 'Fast & Lightweight (Free Tier)' },
              { id: 'gemini-pro', name: 'Gemini 1.0 Pro', icon: Brain, desc: 'Highest Intelligence' }
            ].map((model) => (
              <button
                key={model.id}
                onClick={() => setCurrentModel(model.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${currentModel === model.id
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:border-white/10'
                  }`}
              >
                <div className={`p-2 rounded-lg ${currentModel === model.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40'}`}>
                  <model.icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold">{model.name}</h4>
                    {currentModel === model.id && <Check size={14} className="text-indigo-400" />}
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-60">{model.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Parameters */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Activity size={14} className="text-indigo-400" />
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Logic Parameters</span>
          </div>

          <div className="space-y-6 opacity-40 grayscale select-none">
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Response Entropy</label>
                <span className="text-xs font-bold text-indigo-400">0.7</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.7"
                disabled
                className="w-full h-1 bg-white/5 rounded-full appearance-none accent-indigo-500 cursor-not-allowed"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="pt-8 border-t border-white/5 space-y-3">
        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${saveStatus === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
            } disabled:opacity-50`}
        >
          {isSaving ? (
            <Activity size={18} className="animate-spin" />
          ) : saveStatus === 'success' ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? 'Applying...' : saveStatus === 'success' ? 'Applied Successfully' : 'Apply Configuration'}</span>
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-[11px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.aside>
  )
}
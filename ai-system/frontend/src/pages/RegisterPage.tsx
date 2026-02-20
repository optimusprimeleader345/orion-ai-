import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, AlertCircle, Loader2, Check, Command, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
)

export const RegisterPage = () => {
    const navigate = useNavigate()
    const { register, loginWithGoogle } = useAuth()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !email || !password || !confirm) { setError('All fields are required.'); return }
        if (password !== confirm) { setError('Passwords do not match.'); return }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

        setError('')
        setIsLoading(true)
        const result = await register(name, email, password)
        setIsLoading(false)
        if (result.success) navigate('/app')
        else setError(result.error || 'Registration failed.')
    }

    return (
        <div className="min-h-screen bg-[#030303] flex font-sans selection:bg-indigo-500/30">
            {/* ── Left Panel ────────────────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-[#050505]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:30px_30px]" />
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
                    <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-[100px]" />
                </div>

                <div className="relative z-10 text-center px-16 max-w-xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                    >
                        <Command size={36} className="text-white" />
                    </motion.div>

                    <h2 className="text-4xl font-black text-white mb-6 tracking-tighter leading-tight">
                        Start your <br />
                        <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Creative Journey</span>
                    </h2>
                    <p className="text-white/40 text-lg leading-relaxed mb-12 font-medium">
                        Join thousands of builders orchestrating professional AI logic in a high-density workspace.
                    </p>

                    <div className="space-y-6 text-left w-full bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] backdrop-blur-sm">
                        {[
                            { title: 'Free Tier Forever', desc: 'Enterprise-grade models at zero cost for starters.' },
                            { title: 'Full API Access', desc: 'Deploy your logic anywhere with our robust REST API.' },
                            { title: 'Advanced Analytics', desc: 'Monitor every token and thought in real-time.' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex gap-4 group"
                            >
                                <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/40 transition-colors">
                                    <Check size={12} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">{item.title}</h4>
                                    <p className="text-xs text-white/30 leading-relaxed font-bold">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Panel (Form) ─────────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-8 py-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 lg:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Command size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-black text-white italic">ORION<span className="text-indigo-400">AI</span></span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Initialize Protocol</h1>
                        <p className="text-sm font-bold text-white/30">
                            Already configured? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-black text-white transition-all mb-8 shadow-xl"
                    >
                        <GoogleIcon />
                        Secure Signup with Google
                    </motion.button>

                    <div className="flex items-center gap-6 mb-8">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">Credentials</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 font-bold"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Entity Name</label>
                            <div className="relative group">
                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Digital Mail</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Passkey</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Confirm</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end p-1">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors tracking-widest"
                            >
                                {showPassword ? 'Obfuscate' : 'Reveal'}
                            </button>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/20 text-sm mt-4 uppercase tracking-[0.2em]"
                        >
                            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Initializing...</> : <>Create Account <ArrowRight size={18} /></>}
                        </motion.button>

                        <p className="mt-8 text-[10px] text-center text-white/20 font-black uppercase tracking-[0.2em] leading-relaxed">
                            By initializing, you accept our <a href="#" className="underline">Framework Terms</a> & <a href="#" className="underline">Privacy Nodes</a>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

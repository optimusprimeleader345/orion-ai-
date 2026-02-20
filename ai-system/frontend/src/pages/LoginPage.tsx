import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Command, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ─── Google Icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
)

export const LoginPage = () => {
    const navigate = useNavigate()
    const { login, loginWithGoogle, loginAsDemo } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isDemoLoading, setIsDemoLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) { setError('Please fill in all fields.'); return }
        setError('')
        setIsLoading(true)
        const result = await login(email, password)
        setIsLoading(false)
        if (result.success) navigate('/dash')
        else setError(result.error || 'Login failed.')
    }

    const handleDemo = async () => {
        setIsDemoLoading(true)
        const res = await loginAsDemo()
        setIsDemoLoading(false)
        if (res.success) navigate('/dash')
        else setError('Demo login failed. Please try again.')
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/8 blur-[160px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/6 blur-[100px] rounded-full" />
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* ── Top Navigation Bar ──────────────────────────────────────────── */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.04]">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2.5 group"
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Command size={17} className="text-white" />
                    </div>
                    <span className="text-base font-black tracking-tight text-white">Orion<span className="text-indigo-400">AI</span></span>
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                    Back to home
                </button>
            </nav>

            {/* ── Main Content ────────────────────────────────────────────────── */}
            <div className="relative z-10 flex min-h-[calc(100vh-73px)]">

                {/* Left Panel */}
                <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-16 py-20 border-r border-white/[0.04]">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-sm"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15 mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">System Online</span>
                        </div>

                        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 leading-tight" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                            Welcome back to<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Orion AI</span>
                        </h2>
                        <p className="text-white/30 text-sm leading-relaxed mb-10">
                            Your intelligent workspace is ready. Pick up right where you left off with full context and memory.
                        </p>

                        <div className="space-y-4">
                            {[
                                'Multi-model AI orchestration',
                                'Real-time streaming responses',
                                'Persistent conversation memory',
                                'Enterprise-grade security',
                            ].map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    className="flex items-center gap-3 text-sm text-white/40"
                                >
                                    <CheckCircle2 size={14} className="text-indigo-400 shrink-0" />
                                    {f}
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-4">
                            {[
                                { v: '340+', l: 'Teams' },
                                { v: '2.4M', l: 'Tasks' },
                                { v: '99.97%', l: 'Uptime' },
                            ].map(({ v, l }) => (
                                <div key={l} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                                    <p className="text-xl font-black text-white">{v}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{l}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Panel — Form */}
                <div className="flex-1 flex items-center justify-center px-6 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        {/* Mobile logo */}
                        <div className="lg:hidden flex items-center gap-2 mb-10">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Command size={15} className="text-white" />
                            </div>
                            <span className="text-sm font-black text-white">Orion<span className="text-indigo-400">AI</span></span>
                        </div>

                        <h1 className="text-2xl font-black text-white mb-1.5">Sign in</h1>
                        <p className="text-sm text-white/30 mb-8">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                                Create one free
                            </Link>
                        </p>

                        {/* Google */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={loginWithGoogle}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-semibold text-white transition-all mb-6"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </motion.button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-white/[0.05]" />
                            <span className="text-xs text-white/20 uppercase tracking-widest">or</span>
                            <div className="flex-1 h-px bg-white/[0.05]" />
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm mb-5"
                            >
                                <AlertCircle size={15} />
                                {error}
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Password</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-11 pr-12 py-3.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-indigo-500" />
                                    <span className="text-xs text-white/25">Remember me</span>
                                </label>
                                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 text-sm mt-2"
                            >
                                {isLoading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : 'Sign In'}
                            </motion.button>

                            <div className="flex items-center gap-4 py-1">
                                <div className="flex-1 h-px bg-white/[0.05]" />
                                <span className="text-[10px] text-white/15 uppercase font-bold tracking-widest">or</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>

                            <motion.button
                                type="button"
                                disabled={isDemoLoading}
                                onClick={handleDemo}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-3.5 border border-white/[0.08] rounded-xl text-xs font-bold text-white/35 hover:text-white/70 hover:border-white/15 hover:bg-white/[0.03] transition-all disabled:opacity-50"
                            >
                                {isDemoLoading ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Loading demo...</span> : '⚡ Explore as Guest (Demo)'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

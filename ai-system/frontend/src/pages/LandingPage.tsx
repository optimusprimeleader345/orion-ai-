import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
    Brain, ArrowRight, Command,
    Globe2, Cpu, Twitter, Github, Play, CheckCircle2,
    Lock, Eye, BarChart3, Server, Users, ChevronDown,
    Sparkles, Database
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Comet { id: number; x: number; y: number; angle: number; speed: number; length: number; opacity: number }

// ─── Comet Canvas ────────────────────────────────────────────────────────────
const CometCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cometsRef = useRef<Comet[]>([])
    const animRef = useRef<number>(0)

    const createComet = useCallback((id: number): Comet => ({
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.5,
        angle: 30 + Math.random() * 20,
        speed: 4 + Math.random() * 8,
        length: 80 + Math.random() * 120,
        opacity: 0.3 + Math.random() * 0.5,
    }), [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        cometsRef.current = Array.from({ length: 12 }, (_, i) => createComet(i))

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            cometsRef.current.forEach((c, idx) => {
                const rad = (c.angle * Math.PI) / 180
                const tx = c.x + Math.cos(rad) * c.length
                const ty = c.y + Math.sin(rad) * c.length

                const grad = ctx.createLinearGradient(c.x, c.y, tx, ty)
                grad.addColorStop(0, `rgba(99, 102, 241, 0)`)
                grad.addColorStop(0.5, `rgba(139, 92, 246, ${c.opacity * 0.6})`)
                grad.addColorStop(1, `rgba(255, 255, 255, ${c.opacity})`)

                ctx.beginPath()
                ctx.moveTo(c.x, c.y)
                ctx.lineTo(tx, ty)
                ctx.strokeStyle = grad
                ctx.lineWidth = 1.5
                ctx.stroke()

                // Move comet
                cometsRef.current[idx] = {
                    ...c,
                    x: c.x + Math.cos(rad) * c.speed,
                    y: c.y + Math.sin(rad) * c.speed,
                }

                // Reset if out of bounds
                if (c.x > canvas.width + 200 || c.y > canvas.height + 200) {
                    cometsRef.current[idx] = createComet(c.id)
                    cometsRef.current[idx].x = Math.random() * canvas.width * 0.7
                    cometsRef.current[idx].y = -50
                }
            })
            animRef.current = requestAnimationFrame(draw)
        }

        draw()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', handleResize)
        return () => {
            cancelAnimationFrame(animRef.current)
            window.removeEventListener('resize', handleResize)
        }
    }, [createComet])

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data)
    return (
        <div className="flex items-end gap-1 h-12">
            {data.map((v, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(v / max) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    className="flex-1 rounded-sm"
                    style={{ background: color }}
                />
            ))}
        </div>
    )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, delta, chart, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all"
    >
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-3xl font-black text-white tracking-tight">{value}</p>
                <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mt-1">{label}</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{delta}</span>
        </div>
        <MiniBarChart data={chart} color={color} />
    </motion.div>
)

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
    const navigate = useNavigate()
    const { scrollY } = useScroll()
    const [active, setActive] = useState('')
    const navBg = useTransform(scrollY, [0, 60], ['rgba(3,3,3,0)', 'rgba(3,3,3,0.85)'])
    const navBorder = useTransform(scrollY, [0, 60], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)'])

    const navItems = [
        { label: 'Platform', id: 'platform' },
        { label: 'Solutions', id: 'solutions' },
        { label: 'Developers', id: 'developers' },
        { label: 'Pricing', id: 'pricing' },
    ]

    const scrollTo = (id: string) => {
        setActive(id)
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <motion.nav
            style={{ backgroundColor: navBg, borderColor: navBorder }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-xl border-b"
        >
            <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <Command size={17} className="text-white" />
                </div>
                <span className="text-base font-black tracking-tight text-white">Orion<span className="text-indigo-400">AI</span></span>
            </div>

            <div className="hidden lg:flex items-center gap-1">
                {navItems.map(({ label, id }) => (
                    <button
                        key={id}
                        onClick={() => scrollTo(id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${active === id
                                ? 'text-white bg-white/[0.08]'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        {label}
                        {active === id && (
                            <motion.div
                                layoutId="nav-active"
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-semibold text-white/50 hover:text-white transition-colors px-3 py-2"
                >
                    Log in
                </button>
                <button
                    onClick={() => navigate('/register')}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
                >
                    Start Free →
                </button>
            </div>
        </motion.nav>
    )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, badge, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="group relative p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/25 transition-all duration-400 overflow-hidden cursor-default"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className="text-indigo-400" />
                </div>
                {badge && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                        {badge}
                    </span>
                )}
            </div>
            <h3 className="text-base font-bold text-white mb-2.5 tracking-tight">{title}</h3>
            <p className="text-sm text-white/35 leading-relaxed">{desc}</p>
        </div>
    </motion.div>
)

// ─── Testimonial Card ─────────────────────────────────────────────────────────
const TestimonialCard = ({ name, role, company, avatar, text, stars, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ y: -4 }}
        className="group p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all duration-300 flex flex-col gap-5"
    >
        <div className="flex gap-1">
            {Array.from({ length: stars }).map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
        <p className="text-sm text-white/60 leading-relaxed flex-1">"{text}"</p>
        <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/20 border border-white/10 flex items-center justify-center text-xs font-black text-indigo-300">
                {avatar}
            </div>
            <div>
                <p className="text-sm font-bold text-white">{name}</p>
                <p className="text-xs text-white/35">{role} · <span className="text-indigo-400">{company}</span></p>
            </div>
        </div>
    </motion.div>
)

// ─── Pricing Card ─────────────────────────────────────────────────────────────
const PricingCard = ({ plan, price, desc, features, cta, highlight, delay, onCta }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col gap-6 ${highlight
                ? 'bg-indigo-600/10 border-indigo-500/30 shadow-xl shadow-indigo-500/10'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10'
            }`}
    >
        {highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">
                Most Popular
            </div>
        )}
        <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">{plan}</p>
            <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white">{price}</span>
                {price !== 'Free' && price !== 'Custom' && <span className="text-white/30 text-sm mb-1">/mo</span>}
            </div>
            <p className="text-sm text-white/35 mt-2">{desc}</p>
        </div>
        <ul className="flex flex-col gap-3 flex-1">
            {features.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                    <CheckCircle2 size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                    {f}
                </li>
            ))}
        </ul>
        <button
            onClick={onCta}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/[0.05] hover:bg-white/10 text-white border border-white/10'
                }`}
        >
            {cta}
        </button>
    </motion.div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export const LandingPage = () => {
    const navigate = useNavigate()
    const { loginAsDemo } = useAuth()
    const { scrollY } = useScroll()
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
    const heroY = useTransform(scrollY, [0, 500], [0, -60])

    const handleDemo = async () => {
        const res = await loginAsDemo()
        if (res.success) navigate('/dash')
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
                <CometCanvas />

                {/* Atmospheric glows */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-indigo-600/8 blur-[180px] rounded-full" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-700/6 blur-[120px] rounded-full" />
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

                <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 text-center max-w-5xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/8 border border-indigo-500/15 mb-10"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                            Universal Workspace AI v2.0 is Live
                        </span>
                        <Sparkles size={12} className="text-indigo-400" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.7 }}
                        className="text-5xl md:text-7xl lg:text-[88px] font-black tracking-tighter leading-[0.92] text-white mb-8"
                        style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                    >
                        The Operating System<br />
                        for{' '}
                        <span className="relative">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500">
                                Autonomous AI Work
                            </span>
                            <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10" />
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
                    >
                        Plan, execute, observe, and control AI agents in real time with
                        enterprise-grade visibility and safety.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={handleDemo}
                            className="group px-8 py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-wider hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/15 transition-all duration-300 flex items-center gap-2.5 active:scale-95"
                        >
                            Request Demo
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group px-8 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/[0.08] transition-all duration-300 flex items-center gap-2.5"
                        >
                            <Play size={14} className="text-indigo-400" />
                            View Live Dashboard
                        </button>
                    </motion.div>

                    {/* Trust bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/20"
                    >
                        {['SOC 2 Type II', 'ISO 27001', 'GDPR Compliant', 'HIPAA Ready'].map(t => (
                            <div key={t} className="flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-emerald-500/60" />
                                <span className="text-xs font-semibold uppercase tracking-widest">{t}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 cursor-pointer"
                    onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
                    <ChevronDown size={16} />
                </motion.div>
            </section>

            {/* ── STATS ────────────────────────────────────────────────────────── */}
            <section className="py-20 border-y border-white/[0.04] bg-white/[0.01]">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard value="99.97%" label="Uptime SLA" delta="+0.02%" chart={[60, 75, 65, 80, 70, 90, 85, 95, 88, 97]} color="rgba(99,102,241,0.6)" />
                    <StatCard value="<50ms" label="Avg Latency" delta="-12ms" chart={[90, 80, 85, 70, 75, 60, 65, 55, 50, 48]} color="rgba(139,92,246,0.6)" />
                    <StatCard value="2.4M+" label="Tasks Executed" delta="+18%" chart={[30, 40, 35, 55, 50, 65, 70, 80, 90, 100]} color="rgba(16,185,129,0.6)" />
                    <StatCard value="340+" label="Enterprise Clients" delta="+24" chart={[20, 25, 30, 35, 40, 50, 60, 70, 80, 95]} color="rgba(245,158,11,0.6)" />
                </div>
            </section>

            {/* ── PLATFORM ─────────────────────────────────────────────────────── */}
            <section id="platform" className="py-32 max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-4"
                    >
                        Platform
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-5"
                        style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                    >
                        Built for the{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                            Agentic Era
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-white/35 max-w-xl mx-auto text-base leading-relaxed"
                    >
                        Every primitive you need to build, deploy, and observe intelligent agents at scale.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <FeatureCard icon={Brain} title="Agentic Reasoning Engine" desc="Multi-turn planning with dynamic tool selection. Agents break complex tasks into executable subtasks autonomously." badge="Core" delay={0.05} />
                    <FeatureCard icon={Eye} title="Real-Time Observability" desc="Trace every thought, decision, and API call with granular step-level visualization and replay." badge="Live" delay={0.1} />
                    <FeatureCard icon={Lock} title="Zero-Knowledge Silos" desc="Your data never touches shared training sets. Air-gapped execution environments for maximum compliance." badge="Security" delay={0.15} />
                    <FeatureCard icon={Globe2} title="Global Edge Network" desc="Sub-50ms response times via 47 edge nodes across 6 continents. Automatic failover and load balancing." delay={0.2} />
                    <FeatureCard icon={Database} title="Persistent Memory" desc="Long-term semantic memory with vector search. Agents remember context across sessions and users." delay={0.25} />
                    <FeatureCard icon={Cpu} title="Parallel Execution" desc="Run thousands of concurrent agent threads with automatic resource allocation and priority queuing." delay={0.3} />
                </div>
            </section>

            {/* ── SOLUTIONS ────────────────────────────────────────────────────── */}
            <section id="solutions" className="py-32 border-t border-white/[0.04] bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Solutions</motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                            One Platform,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Every Use Case</span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Server, title: 'DevOps Automation', desc: 'Automate CI/CD pipelines, incident response, and infrastructure provisioning with intelligent agents that understand your stack.', color: 'from-blue-500/10 to-indigo-500/5' },
                            { icon: BarChart3, title: 'Data Intelligence', desc: 'Agents that query, analyze, and visualize data across warehouses. Generate executive reports and surface anomalies automatically.', color: 'from-purple-500/10 to-violet-500/5' },
                            { icon: Users, title: 'Customer Success', desc: 'Deploy AI agents that handle support tickets, onboarding flows, and proactive outreach with full CRM integration.', color: 'from-emerald-500/10 to-teal-500/5' },
                        ].map(({ icon: Icon, title, desc, color }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -6 }}
                                className={`p-8 rounded-2xl bg-gradient-to-br ${color} border border-white/[0.06] hover:border-white/10 transition-all duration-300`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-6">
                                    <Icon size={22} className="text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DEVELOPERS ───────────────────────────────────────────────────── */}
            <section id="developers" className="py-32 border-t border-white/[0.04]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Developers</motion.p>
                            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                                Ship agents in{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">minutes</span>
                            </motion.h2>
                            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white/40 leading-relaxed mb-8">
                                A developer-first SDK with TypeScript and Python support. Declarative agent definitions, built-in tool registry, and one-command deployment.
                            </motion.p>
                            <div className="flex flex-col gap-3">
                                {['Type-safe agent definitions', 'Built-in tool registry with 200+ integrations', 'One-command deploy to global edge', 'Full OpenTelemetry support'].map((f, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                                        <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />
                                        <span className="text-sm text-white/60">{f}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Code block */}
                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                            <div className="rounded-2xl bg-[#0a0a0f] border border-white/[0.06] overflow-hidden shadow-2xl shadow-indigo-500/5">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                                    <span className="ml-3 text-xs text-white/20 font-mono">agent.ts</span>
                                </div>
                                <pre className="p-6 text-xs font-mono leading-relaxed overflow-x-auto">
                                    <code>
                                        <span className="text-purple-400">import</span>
                                        <span className="text-white/60"> {'{ OrionAgent }'} </span>
                                        <span className="text-purple-400">from</span>
                                        <span className="text-emerald-400"> '@orion/sdk'</span>
                                        {'\n\n'}
                                        <span className="text-blue-400">const</span>
                                        <span className="text-white"> agent </span>
                                        <span className="text-white/40">= </span>
                                        <span className="text-blue-400">new</span>
                                        <span className="text-yellow-300"> OrionAgent</span>
                                        <span className="text-white/60">{'({'}</span>
                                        {'\n  '}
                                        <span className="text-indigo-300">name</span>
                                        <span className="text-white/40">: </span>
                                        <span className="text-emerald-400">'data-analyst'</span>
                                        <span className="text-white/40">,</span>
                                        {'\n  '}
                                        <span className="text-indigo-300">tools</span>
                                        <span className="text-white/40">: </span>
                                        <span className="text-white/60">['sql', 'python', 'charts'],</span>
                                        {'\n  '}
                                        <span className="text-indigo-300">memory</span>
                                        <span className="text-white/40">: </span>
                                        <span className="text-orange-400">true</span>
                                        <span className="text-white/40">,</span>
                                        {'\n'}
                                        <span className="text-white/60">{'});'}</span>
                                        {'\n\n'}
                                        <span className="text-white/40">{'// Deploy to edge in one command'}</span>
                                        {'\n'}
                                        <span className="text-blue-400">await</span>
                                        <span className="text-white"> agent</span>
                                        <span className="text-white/40">.</span>
                                        <span className="text-yellow-300">deploy</span>
                                        <span className="text-white/60">{'({ region: '}</span>
                                        <span className="text-emerald-400">'global'</span>
                                        <span className="text-white/60">{' });'}</span>
                                    </code>
                                </pre>
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl -z-10 rounded-3xl" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
            <section className="py-32 border-t border-white/[0.04] bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Testimonials</motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black tracking-tighter text-white" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                            Trusted by{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Elite Teams</span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <TestimonialCard
                            name="Sarah Chen"
                            role="CTO"
                            company="NexaFlow"
                            avatar="SC"
                            stars={5}
                            text="Orion AI reduced our DevOps incident response time by 73%. The agentic observability is unlike anything we've used before — every decision is traceable and auditable."
                            delay={0.05}
                        />
                        <TestimonialCard
                            name="Marcus Thorne"
                            role="Principal Engineer"
                            company="Vertex Systems"
                            avatar="MT"
                            stars={5}
                            text="The Zero-Knowledge Silo architecture was the deciding factor for our enterprise compliance team. We passed our SOC 2 audit with zero findings related to AI data handling."
                            delay={0.1}
                        />
                        <TestimonialCard
                            name="Dr. Elara Volt"
                            role="AI Research Lead"
                            company="Quantum Labs"
                            avatar="EV"
                            stars={5}
                            text="Real-time agent tracing has fundamentally changed how we debug multi-step reasoning failures. What used to take days now takes minutes with Orion's replay system."
                            delay={0.15}
                        />
                        <TestimonialCard
                            name="James Okafor"
                            role="VP Engineering"
                            company="Meridian Bank"
                            avatar="JO"
                            stars={5}
                            text="Running 40,000+ concurrent agent tasks daily with sub-50ms latency. The parallel execution engine is genuinely impressive at this scale."
                            delay={0.2}
                        />
                        <TestimonialCard
                            name="Priya Nair"
                            role="Head of AI"
                            company="Luminary Health"
                            avatar="PN"
                            stars={5}
                            text="HIPAA compliance out of the box was a game-changer. Our clinical AI workflows are now fully automated with complete audit trails for every agent action."
                            delay={0.25}
                        />
                        <TestimonialCard
                            name="Alex Rivera"
                            role="Founder"
                            company="Cascade AI"
                            avatar="AR"
                            stars={5}
                            text="We went from prototype to production in 3 days using the Orion SDK. The developer experience is the best I've seen in the AI infrastructure space."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ── PRICING ──────────────────────────────────────────────────────── */}
            <section id="pricing" className="py-32 border-t border-white/[0.04]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Pricing</motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                            Simple,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Transparent</span>{' '}
                            Pricing
                        </motion.h2>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white/35 text-base">Start free. Scale as you grow. No hidden fees.</motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PricingCard
                            plan="Starter"
                            price="Free"
                            desc="Perfect for exploring and prototyping."
                            features={['5,000 agent tasks/mo', '3 concurrent agents', 'Community support', 'Basic observability', '1 workspace']}
                            cta="Get Started Free"
                            delay={0.05}
                            onCta={() => navigate('/register')}
                        />
                        <PricingCard
                            plan="Pro"
                            price="$79"
                            desc="For teams shipping production AI agents."
                            features={['500,000 agent tasks/mo', '50 concurrent agents', 'Priority support', 'Full observability & replay', '10 workspaces', 'Custom tool registry']}
                            cta="Start Pro Trial"
                            highlight
                            delay={0.1}
                            onCta={() => navigate('/register')}
                        />
                        <PricingCard
                            plan="Enterprise"
                            price="Custom"
                            desc="For organizations at scale."
                            features={['Unlimited agent tasks', 'Unlimited concurrency', 'Dedicated SLA & support', 'Zero-knowledge silos', 'SSO & RBAC', 'On-premise deployment']}
                            cta="Contact Sales"
                            delay={0.15}
                            onCta={() => { }}
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
            <section className="py-32 border-t border-white/[0.04] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-indigo-600/5 pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                            Ready to build the{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">future?</span>
                        </h2>
                        <p className="text-white/40 text-lg mb-10">Join 340+ enterprise teams already running on Orion AI.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleDemo}
                                className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:-translate-y-1 flex items-center gap-2"
                            >
                                Start for Free <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-10 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/[0.08] transition-all"
                            >
                                View Documentation
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────────────── */}
            <footer className="border-t border-white/[0.04] py-16 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Command size={16} className="text-white" />
                                </div>
                                <span className="text-base font-black tracking-tight text-white">Orion<span className="text-indigo-400">AI</span></span>
                            </div>
                            <p className="text-sm text-white/30 leading-relaxed max-w-xs">
                                The operating system for autonomous AI work. Enterprise-grade, developer-first.
                            </p>
                        </div>
                        {[
                            { title: 'Product', links: ['Platform', 'Solutions', 'Pricing', 'Changelog'] },
                            { title: 'Developers', links: ['Documentation', 'SDK Reference', 'Examples', 'Status'] },
                            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                        ].map(({ title, links }) => (
                            <div key={title}>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-5">{title}</p>
                                <div className="flex flex-col gap-3">
                                    {links.map(l => (
                                        <a key={l} href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-white/20 font-semibold">© 2026 Orion Intelligence, Inc. All rights reserved.</p>
                        <div className="flex items-center gap-5">
                            <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors">Privacy</a>
                            <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors">Terms</a>
                            <div className="flex gap-4 ml-4">
                                <Twitter size={16} className="text-white/20 hover:text-white/60 cursor-pointer transition-colors" />
                                <Github size={16} className="text-white/20 hover:text-white/60 cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

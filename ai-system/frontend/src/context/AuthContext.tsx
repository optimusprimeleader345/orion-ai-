import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
    id: string
    name: string
    email: string
    avatar?: string
    provider: 'email' | 'google'
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
    loginWithGoogle: () => void
    loginAsDemo: () => Promise<{ success: boolean; error?: string }>
    logout: () => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'sentinel_user'

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const API_BASE = 'http://localhost:8000/api'

    // Load persisted user on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setUser(JSON.parse(stored))
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Persist user on change
    const saveUser = (u: User | null) => {
        setUser(u)
        if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
        else localStorage.removeItem(STORAGE_KEY)
    }

    // ── Email / Password Login ──────────────────────────────────────────────────
    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                const u: User = { ...data.user }
                saveUser(u)
                return { success: true }
            } else {
                return { success: false, error: data.detail || 'Login failed.' }
            }
        } catch (err: any) {
            return { success: false, error: 'Network error or server unavailable.' }
        } finally {
            setIsLoading(false)
        }
    }

    // ── Register ────────────────────────────────────────────────────────────────
    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                const u: User = { ...data.user }
                saveUser(u)
                return { success: true }
            } else {
                return { success: false, error: data.detail || 'Registration failed.' }
            }
        } catch (err: any) {
            return { success: false, error: 'Network error or server unavailable.' }
        } finally {
            setIsLoading(false)
        }
    }

    // ── Google OAuth ────────────────────────────────────────────────────────────
    const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'

    const loginWithGoogle = () => {
        if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
            // alert('Google login requires a Google OAuth Client ID.\nFor this demo, we will simulate a successful Google callback.')

            // Mocking a successful Google payload for UI demonstration if ID is not set
            const mockPayload = {
                sub: 'google_123',
                name: 'Pro Builder',
                email: 'builder@example.com',
                picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=builder'
            }

            fetch(`${API_BASE}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile: mockPayload })
            }).then(res => res.json()).then(data => {
                if (data.success) saveUser(data.user)
            })
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.onload = () => {
            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: any) => {
                    const payload = JSON.parse(atob(response.credential.split('.')[1]))

                    const res = await fetch(`${API_BASE}/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profile: payload })
                    })
                    const data = await res.json()
                    if (data.success) saveUser(data.user)
                }
            });
            (window as any).google.accounts.id.prompt()
        }
        document.head.appendChild(script)
    }

    // ── Demo Login ─────────────────────────────────────────────────────────────
    const loginAsDemo = async () => {
        setIsLoading(true)
        await new Promise(r => setTimeout(r, 1000))
        const demoUser: User = {
            id: 'demo_user_123',
            name: 'Demo Architect',
            email: 'demo@sentinel.ai',
            provider: 'email',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
        }
        saveUser(demoUser)
        setIsLoading(false)
        return { success: true }
    }

    // ── Logout ──────────────────────────────────────────────────────────────────
    const logout = () => saveUser(null)

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, loginAsDemo, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './pages/Dashboard'
import { useAuth } from './context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#030303] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-2xl bg-indigo-600"
        />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dash" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dash" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dash" /> : <RegisterPage />} />

        {/* Protected Dashboard Route */}
        <Route path="/dash" element={user ? <Dashboard /> : <Navigate to="/login" />} />

        {/* Legacy redirect for any old links */}
        <Route path="/app" element={<Navigate to="/dash" />} />

        {/* Catch-all redirect to landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
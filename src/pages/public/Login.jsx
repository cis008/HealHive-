import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login as apiLogin } from '../../api/auth'
import { Eye, EyeOff, AlertCircle, Loader2, Stethoscope, User, ShieldCheck } from 'lucide-react'

const roles = [
    { key: 'user', label: 'User', icon: User, desc: 'Access therapy sessions & support' },
    { key: 'therapist', label: 'Therapist', icon: Stethoscope, desc: 'Manage your professional dashboard' },
    { key: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Platform administration' },
]

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname

    const [activeRole, setActiveRole] = useState('user')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const currentRole = roles.find(r => r.key === activeRole)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.')
            return
        }
        setError('')
        setLoading(true)

        const result = await apiLogin(email.trim(), password, activeRole)

        if (result.success) {
            login(result.user)
            const dest = from || {
                user: '/user/dashboard',
                therapist: '/therapist/dashboard',
                admin: '/admin',
            }[activeRole]
            navigate(dest, { replace: true })
        } else {
            setError(result.error || 'Login failed. Please try again.')
        }
        setLoading(false)
    }

    return (
        <div className="pt-16 min-h-screen gradient-bg relative flex items-center justify-center p-4 overflow-hidden">
            <div className="floating-orb orb-1" />
            <div className="floating-orb orb-2" />

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-wood-900 tracking-tight mb-2">Welcome back</h1>
                    <p className="text-wood-500">Sign in to your HealHive account</p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-3xl p-6 sm:p-8">
                    {/* Role Tabs */}
                    <div className="flex gap-1 p-1 bg-wood-100/80 rounded-2xl mb-8">
                        {roles.map(role => (
                            <button
                                key={role.key}
                                onClick={() => { setActiveRole(role.key); setError('') }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${activeRole === role.key
                                        ? 'bg-wood-600 text-white shadow-sm'
                                        : 'text-wood-500 hover:text-wood-700'
                                    }`}
                            >
                                <role.icon className="w-3.5 h-3.5" />
                                {role.label}
                            </button>
                        ))}
                    </div>

                    {/* Role description */}
                    <p className="text-xs text-wood-500 text-center mb-6">{currentRole.desc}</p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-wood-700 mb-1.5">
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                autoComplete="email"
                                className="w-full px-4 py-3 rounded-xl border border-wood-200 text-sm text-wood-800 placeholder-wood-400 bg-white/80 outline-none transition-all focus:border-wood-500 focus:ring-2 focus:ring-wood-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-wood-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-wood-200 text-sm text-wood-800 placeholder-wood-400 bg-white/80 outline-none transition-all focus:border-wood-500 focus:ring-2 focus:ring-wood-200"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600 p-1"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600" role="alert">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email.trim() || !password.trim()}
                            className="w-full py-3 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-wood-700 to-wood-600 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-wood-300/30 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Login'}
                        </button>
                    </form>

                    {/* Footer links */}
                    <div className="mt-6 text-center text-sm text-wood-500">
                        {activeRole === 'therapist' ? (
                            <p>Not registered? <Link to="/therapist/signup" className="font-medium text-wood-600 hover:text-wood-800 transition-colors">Apply as Therapist</Link></p>
                        ) : activeRole === 'user' ? (
                            <p>New here? <Link to="/chat" className="font-medium text-wood-600 hover:text-wood-800 transition-colors">Start anonymous chat first</Link></p>
                        ) : null}
                    </div>
                </div>

                {/* Hint */}
                <div className="mt-4 p-3 bg-wood-50/80 rounded-2xl text-[11px] text-wood-500 text-center space-y-0.5">
                    <p className="font-medium text-wood-600">Demo accounts</p>
                    <p>User: user@healhive.com / user123</p>
                    <p>Therapist: therapist@healhive.com / therapist123</p>
                    <p>Admin: admin@healhive.com / admin123</p>
                </div>
            </div>
        </div>
    )
}

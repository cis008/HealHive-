import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
    const { user, role, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
        setMobileOpen(false)
    }

    const dashboardPath = {
        user: '/user/dashboard',
        therapist: '/therapist/dashboard',
        admin: '/admin',
    }[role]

    const isLanding = location.pathname === '/'

    const navLinks = [
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Privacy', href: '/#privacy' },
        { label: 'For Therapists', href: '/#for-therapists' },
        { label: 'Contact', href: '/#contact' },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className={`mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isLanding ? 'bg-wood-50/70 backdrop-blur-xl border-b border-wood-200/30' : 'bg-wood-50/90 backdrop-blur-xl border-b border-wood-200/50 shadow-sm'
                }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-8 h-8" fill="none">
                            <defs>
                                <linearGradient id="navLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#9a6740" />
                                    <stop offset="100%" stopColor="#b07d4f" />
                                </linearGradient>
                            </defs>
                            <path d="M24 6C20 6 16.5 8 14.5 11C12.5 8 9 6 5 6C5 6 2 14 2 20C2 30 14 40 24 44C34 40 46 30 46 20C46 14 43 6 43 6C39 6 35.5 8 33.5 11C31.5 8 28 6 24 6Z" fill="url(#navLogo)" opacity="0.9" />
                            <path d="M24 18V30M18 24H30" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-wood-900">Heal</span>
                            <span className="bg-gradient-to-r from-wood-600 to-wood-400 bg-clip-text text-transparent">Hive</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {isLanding && navLinks.map(link => (
                            <a key={link.label} href={link.href}
                                className="px-3 py-2 text-sm text-wood-700 hover:text-wood-900 rounded-lg hover:bg-wood-100/60 transition-all duration-200">
                                {link.label}
                            </a>
                        ))}

                        <div className="w-px h-6 bg-wood-200 mx-2" />

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link to={dashboardPath}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-wood-700 hover:bg-wood-100 rounded-lg transition-all">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-wood-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login"
                                    className="px-4 py-2 text-sm font-medium text-wood-700 hover:text-wood-900 hover:bg-wood-100 rounded-lg transition-all">
                                    Login
                                </Link>
                                <Link to="/chat"
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-wood-600 to-wood-500 rounded-xl hover:shadow-lg hover:shadow-wood-300/40 transition-all duration-300">
                                    Start Chat
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-wood-600 hover:text-wood-900 rounded-lg">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-wood-200 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                        {isLanding && navLinks.map(link => (
                            <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                                className="block px-3 py-2.5 text-sm text-wood-600 hover:text-wood-900 hover:bg-wood-50 rounded-lg transition-all">
                                {link.label}
                            </a>
                        ))}
                        <div className="h-px bg-wood-100 my-2" />
                        {user ? (
                            <>
                                <Link to={dashboardPath} onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2.5 text-sm font-medium text-wood-700 hover:bg-wood-50 rounded-lg">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2.5 text-sm text-wood-700 hover:bg-wood-50 rounded-lg">
                                    Login
                                </Link>
                                <Link to="/chat" onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2.5 text-sm font-medium text-wood-600 hover:bg-wood-50 rounded-lg">
                                    Start Anonymous Chat
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

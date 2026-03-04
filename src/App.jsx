import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Public pages
import Landing from './pages/public/Landing'
import AnonymousChat from './pages/public/AnonymousChat'
import Login from './pages/public/Login'

// User pages
import UserDashboard from './pages/user/UserDashboard'
import BookSession from './pages/user/BookSession'
import VideoSession from './pages/user/VideoSession'

// Therapist pages
import TherapistSignup from './pages/therapist/TherapistSignup'
import TherapistDashboard from './pages/therapist/TherapistDashboard'
import VerificationStatus from './pages/therapist/VerificationStatus'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

function AppLayout() {
    const location = useLocation()

    // Pages that use their own layout (no navbar/footer)
    const noLayoutPages = ['/admin/login', '/user/session']
    const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login'
    const hideLayout = noLayoutPages.includes(location.pathname) || location.pathname === '/user/session'
    const hideFooter = isAdminRoute || location.pathname === '/chat'

    return (
        <div className="min-h-screen flex flex-col">
            {!hideLayout && <Navbar />}

            <main className="flex-1">
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/chat" element={<AnonymousChat />} />
                    <Route path="/login" element={<Login />} />

                    {/* User — Protected */}
                    <Route path="/user/dashboard" element={
                        <ProtectedRoute allowedRoles={['user']}>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/user/book" element={
                        <ProtectedRoute allowedRoles={['user']}>
                            <BookSession />
                        </ProtectedRoute>
                    } />
                    <Route path="/user/session" element={
                        <ProtectedRoute allowedRoles={['user']}>
                            <VideoSession />
                        </ProtectedRoute>
                    } />

                    {/* Therapist — Protected */}
                    <Route path="/therapist/signup" element={<TherapistSignup />} />
                    <Route path="/therapist/dashboard" element={
                        <ProtectedRoute allowedRoles={['therapist']}>
                            <TherapistDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/therapist/verification" element={
                        <ProtectedRoute allowedRoles={['therapist']}>
                            <VerificationStatus />
                        </ProtectedRoute>
                    } />

                    {/* Admin */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* 404 */}
                    <Route path="*" element={
                        <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-wood-50 to-white">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-wood-200 mb-4">404</h1>
                                <p className="text-wood-500 mb-6">Page not found</p>
                                <a href="/" className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-wood-700 to-wood-600 hover:shadow-lg transition-all">
                                    Go Home
                                </a>
                            </div>
                        </div>
                    } />
                </Routes>
            </main>

            {!hideLayout && !hideFooter && <Footer />}
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppLayout />
            </AuthProvider>
        </BrowserRouter>
    )
}

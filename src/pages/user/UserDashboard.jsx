import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchSessions, mockTherapists } from '../../api/mock'
import SessionCard from '../../components/SessionCard'
import { Calendar, MessageCircle, User, Loader2 } from 'lucide-react'

export default function UserDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    const therapist = mockTherapists.find(t => t.id === user?.assignedTherapist)

    useEffect(() => {
        fetchSessions(user?.id).then(data => {
            setSessions(data)
            setLoading(false)
        })
    }, [user?.id])

    const upcomingSessions = sessions.filter(s => s.status === 'upcoming')
    const pastSessions = sessions.filter(s => s.status === 'completed')

    return (
        <div className="pt-16 min-h-screen bg-gradient-to-b from-wood-50 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-wood-800 tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-wood-500 mt-1">Here's your wellness dashboard</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Link to="/user/book" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-wood-100 hover:shadow-lg hover:border-wood-200 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-wood-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6 text-wood-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-wood-800 text-sm">Book Session</h3>
                            <p className="text-xs text-wood-500">Schedule with your therapist</p>
                        </div>
                    </Link>

                    <Link to="/chat" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-wood-100 hover:shadow-lg hover:border-beige-300 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-beige-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6 text-beige-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-wood-800 text-sm">AI Chat</h3>
                            <p className="text-xs text-wood-500">Talk to our AI assistant</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-wood-100">
                        <div className="w-12 h-12 rounded-2xl bg-wood-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-wood-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-wood-800 text-sm">{upcomingSessions.length}</h3>
                            <p className="text-xs text-wood-500">Upcoming sessions</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-wood-800 mb-4">Upcoming Sessions</h2>
                            {loading ? (
                                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-wood-400 animate-spin" /></div>
                            ) : upcomingSessions.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingSessions.map(s => (
                                        <SessionCard key={s.id} session={s} onJoin={() => navigate('/user/session')} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-wood-100">
                                    <Calendar className="w-10 h-10 text-wood-300 mx-auto mb-3" />
                                    <p className="text-sm text-wood-500">No upcoming sessions</p>
                                    <Link to="/user/book" className="inline-block mt-3 text-sm font-medium text-wood-600 hover:text-wood-800">Book one now →</Link>
                                </div>
                            )}
                        </div>

                        {pastSessions.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-wood-800 mb-4">Session History</h2>
                                <div className="space-y-3">
                                    {pastSessions.map(s => <SessionCard key={s.id} session={s} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        <h2 className="text-lg font-semibold text-wood-800 mb-4">Your Therapist</h2>
                        {therapist ? (
                            <div className="bg-white rounded-2xl border border-wood-100 p-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-wood-100 to-beige-100 flex items-center justify-center mb-4 mx-auto">
                                    <User className="w-8 h-8 text-wood-500" />
                                </div>
                                <h3 className="font-semibold text-wood-800 text-center">{therapist.name}</h3>
                                <p className="text-xs text-wood-500 text-center mt-1 font-medium">{therapist.specialization}</p>
                                <p className="text-xs text-wood-400 mt-3 text-center leading-relaxed">{therapist.bio}</p>
                                <Link to="/user/book" className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-wood-700 bg-wood-50 hover:bg-wood-100 transition-all">
                                    <Calendar className="w-4 h-4" /> Book Session
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-wood-100 p-6 text-center">
                                <p className="text-sm text-wood-500">No therapist assigned yet</p>
                                <Link to="/chat" className="inline-block mt-2 text-sm font-medium text-wood-600">Start a chat to get matched →</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

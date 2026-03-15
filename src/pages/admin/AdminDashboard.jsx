import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchAdminDashboard, reviewFlag, reviewTherapist } from '../../api/admin'
import { AlertTriangle, CheckCircle, Clock, Users, Activity, Shield, UserCheck, UserX, TrendingUp, Star, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
    const { user } = useAuth()
    const [flags, setFlags] = useState([])
    const [therapists, setTherapists] = useState([])
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('flags')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchAdminDashboard()
            .then(({ flags, therapists, metrics }) => {
                setFlags(flags)
                setTherapists(therapists)
                setMetrics(metrics)
            })
            .catch(err => setError(err.message || 'Failed to load admin data.'))
            .finally(() => setLoading(false))
    }, [])

    const handleFlagReviewed = async (flagId) => {
        await reviewFlag(flagId)
        setFlags(prev => prev.map(flag => flag.id === flagId ? { ...flag, status: 'reviewed' } : flag))
    }

    const handleTherapistReview = async (therapistId, action) => {
        await reviewTherapist(therapistId, action)
        setTherapists(prev => prev.map(t => {
            if (t.id !== therapistId) return t
            if (action === 'approve') return { ...t, verified: true, isActive: true }
            return { ...t, verified: false, isActive: false }
        }))
    }

    if (loading) {
        return (
            <div className="pt-16 min-h-screen bg-wood-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-beige-400 animate-spin" />
            </div>
        )
    }

    const tabs = [
        { key: 'flags', label: 'Risk Flags', count: flags.filter(f => f.status === 'unreviewed').length },
        { key: 'therapists', label: 'Therapists', count: therapists.filter(t => !t.verified).length },
        { key: 'metrics', label: 'Metrics' },
    ]

    return (
        <div className="pt-16 min-h-screen bg-wood-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-wood-400 mt-1 text-sm">Platform overview and management</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* Quick Metrics */}
                {metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                        {[
                            { icon: Users, label: 'Users', value: metrics.totalUsers, color: 'text-beige-400' },
                            { icon: UserCheck, label: 'Therapists', value: metrics.activeTherapists, color: 'text-emerald-400' },
                            { icon: Activity, label: 'Sessions', value: metrics.totalSessions, color: 'text-wood-300' },
                            { icon: Clock, label: 'Pending', value: metrics.pendingVerifications, color: 'text-amber-400' },
                            { icon: AlertTriangle, label: 'High Risk', value: metrics.highRiskFlags, color: 'text-red-400' },
                            { icon: Star, label: 'Avg Rating', value: metrics.avgSessionRating, color: 'text-yellow-400' },
                        ].map((m, i) => (
                            <div key={i} className="bg-wood-900/50 border border-wood-800/50 rounded-2xl p-4">
                                <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
                                <p className="text-xl font-bold text-white">{m.value}</p>
                                <p className="text-xs text-wood-400">{m.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-wood-900/50 rounded-2xl mb-6 w-fit">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === tab.key ? 'bg-beige-500 text-wood-950 shadow-sm' : 'text-wood-400 hover:text-white'
                                }`}>
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab.key ? 'bg-wood-950/20' : 'bg-red-500/20 text-red-400'
                                    }`}>{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'flags' && (
                    <div className="space-y-3">
                        {flags.map(flag => (
                            <div key={flag.id} className={`bg-wood-900/50 border rounded-2xl p-5 ${flag.severity === 'high' ? 'border-red-500/30' : 'border-amber-500/20'
                                }`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={`w-4 h-4 ${flag.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${flag.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>{flag.severity} risk</span>
                                    </div>
                                    <span className={`flex items-center gap-1 text-xs ${flag.status === 'unreviewed' ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {flag.status === 'unreviewed' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                        {flag.status}
                                    </span>
                                </div>
                                <p className="text-sm text-wood-300 mb-2">{flag.reason}</p>
                                <p className="text-xs text-wood-500 italic p-3 bg-wood-950/50 rounded-xl mb-3">{flag.snippet}</p>
                                <div className="flex items-center justify-between text-xs text-wood-500">
                                    <span>Session: {flag.chatSessionId}</span>
                                    <span>{new Date(flag.timestamp).toLocaleString()}</span>
                                </div>
                                {flag.status === 'unreviewed' && (
                                    <button onClick={() => handleFlagReviewed(flag.id)} className="mt-3 px-4 py-2 rounded-xl text-xs font-medium text-beige-400 border border-beige-500/30 hover:bg-beige-500/10 transition-all">
                                        Mark as Reviewed
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'therapists' && (
                    <div className="space-y-3">
                        {therapists.map(t => (
                            <div key={t.id} className="bg-wood-900/50 border border-wood-800/50 rounded-2xl p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                                        <p className="text-xs text-wood-400 mt-0.5">{t.specialization}</p>
                                    </div>
                                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${t.verified
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                        }`}>
                                        {t.verified ? <><UserCheck className="w-3 h-3" /> Verified</> : <><Clock className="w-3 h-3" /> Pending</>}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    <div className="rounded-xl border border-wood-800/70 bg-wood-950/40 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-wood-500 mb-1">License Number</p>
                                        <p className="text-xs text-wood-200">{t.licenseNumber || 'Not provided'}</p>
                                    </div>
                                    <div className="rounded-xl border border-wood-800/70 bg-wood-950/40 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-wood-500 mb-1">University</p>
                                        <p className="text-xs text-wood-200">{t.universityName || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-wood-800/70 bg-wood-950/40 px-3 py-2 mb-3">
                                    <p className="text-[10px] uppercase tracking-wide text-wood-500 mb-1">About / What they do</p>
                                    <p className="text-xs text-wood-300">{t.bio || 'No bio provided yet.'}</p>
                                </div>
                                {!t.verified && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleTherapistReview(t.id, 'approve')} className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Approve
                                        </button>
                                        <button onClick={() => handleTherapistReview(t.id, 'reject')} className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1">
                                            <UserX className="w-3 h-3" /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'metrics' && metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Total Registered Users', value: metrics.totalUsers.toLocaleString(), icon: Users, trend: '+12% this month' },
                            { label: 'Active Therapists', value: metrics.activeTherapists, icon: UserCheck, trend: '3 new this week' },
                            { label: 'Total Sessions Held', value: metrics.totalSessions.toLocaleString(), icon: Activity, trend: '+8% growth' },
                            { label: 'Average Session Rating', value: `${metrics.avgSessionRating} / 5.0`, icon: Star, trend: 'Consistently high' },
                        ].map((m, i) => (
                            <div key={i} className="bg-wood-900/50 border border-wood-800/50 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-beige-500/10 flex items-center justify-center">
                                        <m.icon className="w-5 h-5 text-beige-400" />
                                    </div>
                                    <span className="text-xs text-wood-400">{m.label}</span>
                                </div>
                                <p className="text-3xl font-bold text-white mb-1">{m.value}</p>
                                <p className="text-xs text-beige-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{m.trend}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

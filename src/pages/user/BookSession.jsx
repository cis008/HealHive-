import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchTherapists, bookSession } from '../../api/mock'
import { Calendar, Clock, CheckCircle, User, Loader2, ArrowLeft } from 'lucide-react'

export default function BookSession() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [therapists, setTherapists] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTherapist, setSelectedTherapist] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [booking, setBooking] = useState(false)
    const [booked, setBooked] = useState(false)

    useEffect(() => {
        fetchTherapists().then(data => {
            setTherapists(data)
            if (user?.assignedTherapist) {
                const assigned = data.find(t => t.id === user.assignedTherapist)
                if (assigned) setSelectedTherapist(assigned)
            }
            setLoading(false)
        })
    }, [user?.assignedTherapist])

    const handleBook = async () => {
        if (!selectedTherapist || !selectedDate || !selectedSlot) return
        setBooking(true)
        await bookSession(user.id, selectedTherapist.id, selectedDate, selectedSlot)
        setBooked(true)
        setBooking(false)
    }

    if (loading) {
        return (
            <div className="pt-16 min-h-screen bg-gradient-to-b from-wood-50 to-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-wood-400 animate-spin" />
            </div>
        )
    }

    if (booked) {
        return (
            <div className="pt-16 min-h-screen bg-gradient-to-b from-wood-50 to-white flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-wood-800 mb-2">Session Booked!</h2>
                    <p className="text-wood-500 text-sm mb-1">
                        {selectedTherapist.name} — {selectedDate} at {selectedSlot}
                    </p>
                    <p className="text-xs text-wood-400 mb-6">You'll receive session details in your dashboard.</p>
                    <button onClick={() => navigate('/user/dashboard')}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-wood-700 to-wood-600 hover:shadow-lg transition-all">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="pt-16 min-h-screen bg-gradient-to-b from-wood-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button onClick={() => navigate('/user/dashboard')} className="flex items-center gap-1 text-sm text-wood-500 hover:text-wood-700 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to dashboard
                </button>

                <h1 className="text-2xl font-bold text-wood-800 mb-8">Book a Session</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Therapist selection */}
                    <div>
                        <h2 className="text-sm font-semibold text-wood-700 mb-3">Select Therapist</h2>
                        <div className="space-y-3">
                            {therapists.map(t => (
                                <button key={t.id} onClick={() => { setSelectedTherapist(t); setSelectedDate(null); setSelectedSlot(null) }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${selectedTherapist?.id === t.id
                                            ? 'border-wood-400 bg-wood-50/50 shadow-sm'
                                            : 'border-wood-100 bg-white hover:border-wood-200 hover:shadow-sm'
                                        }`}>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-wood-100 to-beige-100 flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-wood-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-wood-800">{t.name}</h3>
                                        <p className="text-xs text-wood-500">{t.specialization}</p>
                                    </div>
                                    {selectedTherapist?.id === t.id && <CheckCircle className="w-5 h-5 text-wood-500 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date & Time selection */}
                    <div>
                        {selectedTherapist ? (
                            <>
                                <h2 className="text-sm font-semibold text-wood-700 mb-3">Select Date & Time</h2>
                                {selectedTherapist.availability.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedTherapist.availability.map(day => (
                                            <div key={day.date} className={`p-4 rounded-2xl border transition-all ${selectedDate === day.date ? 'border-wood-300 bg-wood-50/30' : 'border-wood-100 bg-white'
                                                }`}>
                                                <button onClick={() => { setSelectedDate(day.date); setSelectedSlot(null) }}
                                                    className="flex items-center gap-2 text-sm font-medium text-wood-700 mb-3">
                                                    <Calendar className="w-4 h-4 text-wood-500" />
                                                    {day.date}
                                                </button>
                                                {selectedDate === day.date && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {day.slots.map(slot => (
                                                            <button key={slot} onClick={() => setSelectedSlot(slot)}
                                                                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedSlot === slot
                                                                        ? 'bg-wood-600 text-white shadow-sm'
                                                                        : 'bg-wood-100 text-wood-600 hover:bg-wood-200'
                                                                    }`}>
                                                                <Clock className="w-3 h-3" />
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-wood-500 p-4 bg-white rounded-2xl border border-wood-100">No availability set yet.</p>
                                )}

                                {selectedSlot && (
                                    <button onClick={handleBook} disabled={booking}
                                        className="mt-6 w-full py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-wood-700 to-wood-600 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : 'Confirm Booking'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-wood-400">
                                Select a therapist to see availability
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

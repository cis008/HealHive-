import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function mapSession(session, role = 'user') {
    const dateObj = new Date(session.session_time)
    const safeDate = Number.isNaN(dateObj.getTime()) ? null : dateObj

    return {
        id: session.id,
        therapistName: role === 'therapist'
            ? (session.patient_name || 'Patient')
            : (session.therapist_name || 'Therapist'),
        date: safeDate ? safeDate.toISOString().slice(0, 10) : '',
        time: safeDate
            ? safeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        session_time: session.session_time,
        status: session.session_status === 'scheduled' ? 'upcoming' : session.session_status,
        type: 'video',
        room_id: session.room_id,
        meeting_link: session.meeting_link,
    }
}

export async function fetchMySessions(role = 'user') {
    const token = getToken()
    if (!token) return []

    const res = await fetch(`${API_URL}/api/sessions/`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    if (!data.success || !Array.isArray(data.sessions)) return []

    return data.sessions.map(session => mapSession(session, role))
}

export async function fetchAvailableTherapists() {
    const token = getToken()
    if (!token) return []

    const res = await fetch(`${API_URL}/api/therapists`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!data.success || !Array.isArray(data.therapists)) return []
    return data.therapists
}

export async function createSessionBooking({ therapistId, date, time }) {
    const token = getToken()
    if (!token) return { success: false, error: 'Not authenticated' }

    const session_time = `${date}T${time}:00`

    const res = await fetch(`${API_URL}/api/sessions/book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            therapist_id: therapistId,
            session_time,
        }),
    })

    const data = await res.json()
    return data
}

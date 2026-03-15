import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function authedFetch(path, options = {}) {
    const token = getToken()
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
    const data = await res.json()
    if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Request failed')
    }
    return data
}

export function fetchAdminDashboard() {
    return authedFetch('/api/admin/dashboard')
}

export function reviewTherapist(therapistId, action) {
    return authedFetch(`/api/admin/therapists/${therapistId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
    })
}

export function reviewFlag(reportId) {
    return authedFetch(`/api/admin/reports/${reportId}/review`, {
        method: 'PATCH',
    })
}
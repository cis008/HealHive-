// ─── Real Auth API ───
// Replaces mockLogin for production use

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TOKEN_KEY = 'healhive_token'

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export async function login(email, password, role) {
    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        })
        const data = await res.json()
        if (data.success && data.token) {
            setToken(data.token)
        }
        return data
    } catch {
        return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
}

export async function register(name, email, password, role) {
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        })
        const data = await res.json()
        if (data.success && data.token) {
            setToken(data.token)
        }
        return data
    } catch {
        return { success: false, error: 'Unable to connect to server. Please try again.' }
    }
}

export async function fetchMe() {
    const token = getToken()
    if (!token) return null
    try {
        const res = await fetch(`${API_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        return data.success ? data.user : null
    } catch {
        return null
    }
}

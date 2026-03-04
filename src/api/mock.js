// ─── Mock Data Layer ───
// Simulates backend responses for frontend development

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// ─── Users ───
export const mockUsers = {
    user: {
        id: 'u-001',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        role: 'user',
        assignedTherapist: 't-001',
        sessions: ['s-001', 's-002'],
    },
    therapist: {
        id: 't-001',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@healhive.com',
        role: 'therapist',
        license: 'PSY-2024-1892',
        specialization: 'Anxiety & Depression',
        bio: 'Licensed clinical psychologist with 8 years of experience in CBT and mindfulness-based therapy.',
        verified: true,
        avatar: null,
    },
    admin: {
        id: 'a-001',
        name: 'HealHive Admin',
        email: 'admin@healhive.com',
        role: 'admin',
    },
}

// ─── Therapists ───
export const mockTherapists = [
    {
        id: 't-001',
        name: 'Dr. Sarah Chen',
        specialization: 'Anxiety & Depression',
        bio: 'Licensed clinical psychologist with 8 years of experience in CBT and mindfulness-based therapy.',
        verified: true,
        availability: [
            { date: '2026-03-01', slots: ['10:00', '11:00', '14:00', '15:00'] },
            { date: '2026-03-02', slots: ['09:00', '10:00', '13:00'] },
            { date: '2026-03-03', slots: ['11:00', '14:00', '16:00'] },
        ],
    },
    {
        id: 't-002',
        name: 'Dr. James Rivera',
        specialization: 'Trauma & PTSD',
        bio: 'Specialist in EMDR therapy and trauma recovery with a focus on veterans and first responders.',
        verified: true,
        availability: [
            { date: '2026-03-01', slots: ['09:00', '13:00', '16:00'] },
            { date: '2026-03-02', slots: ['10:00', '14:00'] },
        ],
    },
    {
        id: 't-003',
        name: 'Dr. Priya Sharma',
        specialization: 'Relationships & Family',
        bio: 'Family therapist with expertise in couples counseling and parent-child dynamics.',
        verified: false,
        availability: [],
    },
]

// ─── Sessions ───
export const mockSessions = [
    {
        id: 's-001',
        userId: 'u-001',
        therapistId: 't-001',
        therapistName: 'Dr. Sarah Chen',
        date: '2026-03-01',
        time: '10:00',
        status: 'upcoming',
        type: 'video',
    },
    {
        id: 's-002',
        userId: 'u-001',
        therapistId: 't-001',
        therapistName: 'Dr. Sarah Chen',
        date: '2026-02-20',
        time: '14:00',
        status: 'completed',
        type: 'video',
        notes: 'Discussed coping strategies for work-related anxiety.',
    },
]

// ─── Admin Flags ───
export const mockFlags = [
    {
        id: 'f-001',
        chatSessionId: 'chat-291',
        timestamp: '2026-02-26T08:14:00Z',
        severity: 'high',
        reason: 'User expressed thoughts of self-harm',
        status: 'unreviewed',
        snippet: '"I sometimes feel like things would be better if I wasn\'t here..."',
    },
    {
        id: 'f-002',
        chatSessionId: 'chat-305',
        timestamp: '2026-02-25T19:42:00Z',
        severity: 'medium',
        reason: 'Repeated mentions of hopelessness',
        status: 'reviewed',
        snippet: '"Nothing ever gets better no matter what I try."',
    },
    {
        id: 'f-003',
        chatSessionId: 'chat-318',
        timestamp: '2026-02-26T11:05:00Z',
        severity: 'high',
        reason: 'Crisis language detected',
        status: 'unreviewed',
        snippet: '"I don\'t want to go on anymore."',
    },
]

// ─── Platform Metrics ───
export const mockMetrics = {
    totalUsers: 1247,
    activeTherapists: 23,
    totalSessions: 3891,
    pendingVerifications: 4,
    highRiskFlags: 2,
    avgSessionRating: 4.6,
}

// ─── Mock API Functions ───
export async function mockLogin(email, password, role) {
    await delay(800)
    const user = mockUsers[role]
    if (user) {
        return { success: true, user }
    }
    return { success: false, error: 'Invalid credentials' }
}

export async function fetchSessions(userId) {
    await delay(500)
    return mockSessions.filter(s => s.userId === userId)
}

export async function fetchTherapists() {
    await delay(500)
    return mockTherapists.filter(t => t.verified)
}

export async function fetchAllTherapists() {
    await delay(500)
    return mockTherapists
}

export async function fetchFlags() {
    await delay(500)
    return mockFlags
}

export async function fetchMetrics() {
    await delay(400)
    return mockMetrics
}

export async function bookSession(userId, therapistId, date, time) {
    await delay(700)
    const newSession = {
        id: `s-${Date.now()}`,
        userId,
        therapistId,
        therapistName: mockTherapists.find(t => t.id === therapistId)?.name || 'Unknown',
        date,
        time,
        status: 'upcoming',
        type: 'video',
    }
    mockSessions.push(newSession)
    return { success: true, session: newSession }
}

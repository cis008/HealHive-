// ─── n8n Chatbot Integration ───
// Sends messages to n8n webhook and parses responses.
// When the AI generates an assessment report, it returns two fields:
//   reply          → shown to the user (short, empathetic)
//   therapistReport → saved to the backend for therapists only

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || null
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TIMEOUT_MS = 30000   // 30s — assessment scoring steps can be slow
const MAX_RETRIES = 3

// Mock responses when no webhook is configured
const mockResponses = [
    "Thank you for sharing that with me. I'm here to listen. Can you tell me more about how you've been feeling lately?",
    "I understand that can be difficult. How long have you been experiencing these feelings?",
    "That's a really important thing to acknowledge. On a scale of 1–10, how would you rate your overall wellbeing this week?",
    "I appreciate your openness. It sounds like it might be helpful to talk to a professional who can provide more personalized support. Would you like me to help you connect with a therapist?",
    "Remember, reaching out is a sign of strength. Would you like to explore some coping strategies that others have found helpful?",
    "I hear you. It's completely valid to feel that way. Are there specific situations or triggers that tend to make things harder?",
]

let mockIndex = 0

async function fetchWithTimeout(url, options, timeout = TIMEOUT_MS) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
        const response = await fetch(url, { ...options, signal: controller.signal })
        clearTimeout(id)
        return response
    } catch (error) {
        clearTimeout(id)
        throw error
    }
}

// ─── Save therapist report to backend (fire-and-forget) ───
async function saveTherapistReport(sessionId, userMessage, therapistReport, meta = {}) {
    try {
        await fetch(`${API_URL}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                userMessage,
                therapistReport,
                toolUsed: meta.toolUsed || null,
                score: meta.score || null,
                severity: meta.severity || null,
            }),
        })
    } catch {
        // Non-critical — don't surface this error to the user
    }
}

export async function sendMessage(message, sessionId = null, history = []) {
    // ── Mock mode ──
    if (!WEBHOOK_URL) {
        await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))
        const response = mockResponses[mockIndex % mockResponses.length]
        mockIndex++
        return {
            success: true,
            reply: response,
            flagged: message.toLowerCase().includes('harm') || message.toLowerCase().includes("don't want to"),
        }
    }

    // ── Real n8n webhook call ──
    let lastError = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetchWithTimeout(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    sessionId,
                    timestamp: new Date().toISOString(),
                    // Full history so n8n AI has context without needing a memory node
                    history: history.map(m => ({
                        role: m.isBot ? 'assistant' : 'user',
                        content: m.text,
                    })),
                }),
            })

            if (!response.ok) throw new Error(`Server error: ${response.status}`)

            // Safely parse — handle empty or non-JSON bodies from n8n
            let data = {}
            const rawText = await response.text()
            if (rawText && rawText.trim().startsWith('{')) {
                try { data = JSON.parse(rawText) } catch { /* keep data = {} */ }
            }

            // Dual-output: if therapistReport exists, save it silently
            if (data.therapistReport && sessionId) {
                saveTherapistReport(
                    sessionId,
                    data.reply || data.userMessage || data.message || '',
                    data.therapistReport,
                    { toolUsed: data.toolUsed, score: data.score, severity: data.severity }
                )
            }

            const reply = data.reply || data.userMessage || data.message || data.response || data.output || data.text
            if (!reply) throw new Error('Empty response from server')

            return {
                success: true,
                reply,
                flagged: data.flagged || false,
            }
        } catch (error) {
            lastError = error
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
            }
        }
    }

    return {
        success: false,
        error: lastError?.name === 'AbortError'
            ? 'Request timed out. Please try again.'
            : 'Unable to connect. Please check your connection and try again.',
    }
}

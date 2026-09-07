import { GoogleGenAI, Type } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const TRIAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ['task', 'deadline', 'meeting', 'info', 'newsletter'],
    },
    priority: {
      type: Type.STRING,
      enum: ['urgent', 'upcoming', 'low'],
    },
    deadline_at: {
      type: Type.STRING,
      nullable: true,
      description: 'ISO 8601 datetime if a specific deadline or meeting time is mentioned, otherwise null',
    },
    summary: {
      type: Type.STRING,
      description: 'One-sentence plain-English summary of the email',
    },
    reasoning: {
      type: Type.STRING,
      description: 'One short sentence on why this priority was assigned',
    },
  },
  required: ['category', 'priority', 'summary', 'reasoning'],
}

export type TriageResult = {
  category: 'task' | 'deadline' | 'meeting' | 'info' | 'newsletter'
  priority: 'urgent' | 'upcoming' | 'low'
  deadline_at: string | null
  summary: string
  reasoning: string
}

export async function triageEmail(
  email: {
    subject: string | null
    sender_name: string | null
    sender_email: string | null
    snippet: string | null
    received_at: string
  },
  senderPreference?: { importantCount: number; unimportantCount: number }
): Promise<TriageResult> {
  const preferenceNote =
    senderPreference && (senderPreference.importantCount > 0 || senderPreference.unimportantCount > 0)
      ? `\n\nPersonalization note: this user has previously marked emails from this sender as important ${senderPreference.importantCount} time(s) and unimportant ${senderPreference.unimportantCount} time(s). Weigh this into the priority, but don't ignore what the email actually says.`
      : ''

  const prompt = `You are an email triage assistant. Analyze this email and classify it.

From: ${email.sender_name ?? email.sender_email ?? 'unknown'} <${email.sender_email ?? 'unknown'}>
Subject: ${email.subject ?? '(no subject)'}
Received: ${email.received_at}
Snippet: ${email.snippet ?? '(no preview available)'}${preferenceNote}

Classify the category, assign a priority, extract a deadline_at datetime ONLY if one is explicitly mentioned (otherwise null), and give a one-sentence summary and one-sentence reasoning for the priority.`

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: TRIAGE_SCHEMA,
    },
  })

  return JSON.parse(response.text ?? '{}')
}
import { google } from 'googleapis'
import { runWithConcurrencyLimit } from '@/lib/concurrency'
import { gmail_v1 } from 'googleapis'

export function getGmailClient(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({ refresh_token: refreshToken })

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

// Pulls the header value we want out of Gmail's payload.headers array
function getHeader(headers: gmail_v1.Schema$MessagePartHeader[], name: string) {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null
}
// Message-ID headers look like "<abc123@mail.gmail.com>" — strip the angle brackets
function cleanMessageId(raw: string | null) {
  if (!raw) return null
  return raw.replace(/^<|>$/g, '').trim()
}

// Gmail's "From" header looks like: "Jane Doe <jane@example.com>" — split it apart
function parseSender(fromHeader: string | null) {
  if (!fromHeader) return { name: null, email: null }
  const match = fromHeader.match(/^(.*?)\s*<(.+)>$/)
  if (match) return { name: match[1].replace(/"/g, '').trim(), email: match[2].trim() }
  return { name: null, email: fromHeader.trim() }
}

export async function fetchRecentEmails(refreshToken: string, maxResults = 50) {
  const gmail = getGmailClient(refreshToken)

  const list = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox',
  })

  const messageIds = list.data.messages ?? []

  const tasks = messageIds.map(({ id }) => async () => {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: id!,
      format: 'metadata',
      metadataHeaders: ['Subject', 'From', 'Date', 'Message-ID'],
    })

    const headers = msg.data.payload?.headers ?? []
    const { name: senderName, email: senderEmail } = parseSender(getHeader(headers, 'From'))

    return {
  gmail_message_id: msg.data.id!,
  gmail_thread_id: msg.data.threadId!,
  message_id: cleanMessageId(getHeader(headers, 'Message-ID')),
  subject: getHeader(headers, 'Subject'),
  sender_name: senderName,
  sender_email: senderEmail,
  snippet: msg.data.snippet ?? null,
  received_at: new Date(getHeader(headers, 'Date') ?? Date.now()).toISOString(),
}
  })

  return runWithConcurrencyLimit(tasks, 4)
}
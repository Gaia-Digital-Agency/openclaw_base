import { NextResponse } from 'next/server'

import { getPortalSession } from '@/lib/portal-auth'
import { sendPortalEmail } from '@/lib/portal-email'
import { createEmailLog, listEmailLogs } from '@/lib/portal-storage'

const unauthorized = () => NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

export async function GET() {
  const session = await getPortalSession()
  if (!session) return unauthorized()

  return NextResponse.json({ logs: await listEmailLogs() })
}

export async function POST(request: Request) {
  const session = await getPortalSession()
  if (!session) return unauthorized()

  const body = (await request.json()) as {
    body?: string
    subject?: string
    to?: string
  }

  const to = body.to?.trim() || ''
  const subject = body.subject?.trim() || ''
  const message = body.body?.trim() || ''

  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'To, subject, and message are required.' }, { status: 400 })
  }

  try {
    await sendPortalEmail({
      body: message,
      subject,
      to,
    })

    const log = await createEmailLog({
      body: message,
      sentAt: new Date().toISOString(),
      status: 'sent',
      subject,
      to,
    })

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Failed to send email.'

    const log = await createEmailLog({
      body: message,
      error: messageText,
      status: 'failed',
      subject,
      to,
    })

    return NextResponse.json({ error: messageText, log }, { status: 500 })
  }
}

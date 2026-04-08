import { NextResponse } from 'next/server'

import { getPortalSession } from '@/lib/portal-auth'
import { createGoogleCalendarEvent } from '@/lib/google-calendar'
import { createAppointment, listAppointments, updateAppointment } from '@/lib/portal-storage'

const unauthorized = () => NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

export async function GET() {
  const session = await getPortalSession()
  if (!session) return unauthorized()

  return NextResponse.json({ appointments: await listAppointments() })
}

export async function POST(request: Request) {
  const session = await getPortalSession()
  if (!session) return unauthorized()

  const body = (await request.json()) as {
    clientEmail?: string
    clientName?: string
    endAt?: string
    notes?: string
    startAt?: string
    title?: string
  }

  if (!body.title || !body.clientName || !body.startAt || !body.endAt) {
    return NextResponse.json({ error: 'Title, client name, start time, and end time are required.' }, { status: 400 })
  }

  const start = new Date(body.startAt)
  const end = new Date(body.endAt)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 })
  }

  const appointment = await createAppointment({
    clientEmail: body.clientEmail?.trim() || '',
    clientName: body.clientName.trim(),
    endAt: body.endAt,
    googleSyncStatus: 'skipped',
    notes: body.notes?.trim() || '',
    startAt: body.startAt,
    title: body.title.trim(),
  })

  try {
    const googleEvent = await createGoogleCalendarEvent(appointment)
    const updatedAppointment = await updateAppointment(appointment.id, {
      googleEventId: googleEvent.status === 'synced' ? googleEvent.eventId : undefined,
      googleEventLink: googleEvent.status === 'synced' ? googleEvent.eventLink : undefined,
      googleSyncError: googleEvent.status === 'skipped' ? googleEvent.error : undefined,
      googleSyncStatus: googleEvent.status,
    })

    if (updatedAppointment) {
      return NextResponse.json({ appointment: updatedAppointment }, { status: 201 })
    }
  } catch (error) {
    const updatedAppointment = await updateAppointment(appointment.id, {
      googleSyncError: error instanceof Error ? error.message : 'Unable to sync to Google Calendar.',
      googleSyncStatus: 'failed',
    })

    if (updatedAppointment) {
      return NextResponse.json({ appointment: updatedAppointment }, { status: 201 })
    }
  }

  return NextResponse.json({ appointment }, { status: 201 })
}

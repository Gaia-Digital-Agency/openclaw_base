import { NextResponse } from 'next/server'

import { getPortalSession } from '@/lib/portal-auth'
import { deleteGoogleCalendarEvent, updateGoogleCalendarEvent } from '@/lib/google-calendar'
import { deleteAppointment, getAppointmentById, updateAppointment } from '@/lib/portal-storage'

const unauthorized = () => NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, context: Context) {
  const session = await getPortalSession()
  if (!session) return unauthorized()

  const { id } = await context.params
  const currentAppointment = await getAppointmentById(id)

  if (!currentAppointment) {
    return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
  }

  const body = (await request.json()) as {
    clientEmail?: string
    clientName?: string
    endAt?: string
    notes?: string
    startAt?: string
    status?: 'confirmed' | 'cancelled'
    title?: string
  }

  const proposedAppointment = {
    ...currentAppointment,
    clientEmail: body.clientEmail !== undefined ? body.clientEmail.trim() : currentAppointment.clientEmail,
    clientName: body.clientName !== undefined ? body.clientName.trim() : currentAppointment.clientName,
    endAt: body.endAt ?? currentAppointment.endAt,
    notes: body.notes !== undefined ? body.notes.trim() : currentAppointment.notes,
    startAt: body.startAt ?? currentAppointment.startAt,
    status: body.status ?? currentAppointment.status,
    title: body.title !== undefined ? body.title.trim() : currentAppointment.title,
  }

  if (
    !proposedAppointment.title ||
    !proposedAppointment.clientName ||
    !proposedAppointment.startAt ||
    !proposedAppointment.endAt
  ) {
    return NextResponse.json({ error: 'Title, client name, start time, and end time are required.' }, { status: 400 })
  }

  const start = new Date(proposedAppointment.startAt)
  const end = new Date(proposedAppointment.endAt)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 })
  }

  const appointment = await updateAppointment(id, {
    clientEmail: body.clientEmail !== undefined ? body.clientEmail.trim() : undefined,
    clientName: body.clientName !== undefined ? body.clientName.trim() : undefined,
    endAt: body.endAt,
    notes: body.notes !== undefined ? body.notes.trim() : undefined,
    startAt: body.startAt,
    status: body.status,
    title: body.title !== undefined ? body.title.trim() : undefined,
  })

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
  }

  try {
    const googleEvent = await updateGoogleCalendarEvent(appointment)
    const syncedAppointment = await updateAppointment(appointment.id, {
      googleEventId: googleEvent.status === 'synced' ? googleEvent.eventId : appointment.googleEventId,
      googleEventLink: googleEvent.status === 'synced' ? googleEvent.eventLink : appointment.googleEventLink,
      googleSyncError: googleEvent.status === 'skipped' ? googleEvent.error : undefined,
      googleSyncStatus: googleEvent.status,
    })

    return NextResponse.json({ appointment: syncedAppointment || appointment })
  } catch (error) {
    const failedAppointment = await updateAppointment(appointment.id, {
      googleSyncError: error instanceof Error ? error.message : 'Unable to sync to Google Calendar.',
      googleSyncStatus: 'failed',
    })

    return NextResponse.json({ appointment: failedAppointment || appointment })
  }
}

export async function DELETE(_: Request, context: Context) {
  const session = await getPortalSession()
  if (!session) return unauthorized()

  const { id } = await context.params
  const appointment = await getAppointmentById(id)

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
  }

  try {
    await deleteGoogleCalendarEvent(appointment)
  } catch {
    // Local deletion still takes precedence so the portal cannot get stuck on stale bookings.
  }

  const deleted = await deleteAppointment(id)

  if (!deleted) {
    return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}

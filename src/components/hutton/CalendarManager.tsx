'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { portalApi } from '@/lib/portal-client'
import type { Appointment } from '@/lib/portal-storage'

type AppointmentForm = {
  clientEmail: string
  clientName: string
  endAt: string
  notes: string
  startAt: string
  title: string
}

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
})

const initialForm: AppointmentForm = {
  clientEmail: '',
  clientName: '',
  endAt: '',
  notes: '',
  startAt: '',
  title: '',
}

const toGoogleCalendarDate = (value: string) => {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace('.000', '')
}

const getGoogleCalendarUrl = (appointment?: Appointment) => {
  if (!appointment) {
    return 'https://calendar.google.com/calendar/u/0/r'
  }

  if (appointment.googleEventLink) {
    return appointment.googleEventLink
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    dates: `${toGoogleCalendarDate(appointment.startAt)}/${toGoogleCalendarDate(appointment.endAt)}`,
    details: [appointment.notes, appointment.clientEmail].filter(Boolean).join('\n'),
    text: appointment.title,
  })

  return `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`
}

export function CalendarManager() {
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState<AppointmentForm>(initialForm)
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  })
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setEditingAppointmentId(null)
    setForm(initialForm)
  }

  const toLocalDateTimeInputValue = (value: string) => {
    const date = new Date(value)
    const offset = date.getTimezoneOffset()
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
  }

  const startEditing = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id)
    setForm({
      clientEmail: appointment.clientEmail,
      clientName: appointment.clientName,
      endAt: toLocalDateTimeInputValue(appointment.endAt),
      notes: appointment.notes,
      startAt: toLocalDateTimeInputValue(appointment.startAt),
      title: appointment.title,
    })
  }

  const loadAppointments = async () => {
    const response = await fetch(portalApi('/appointments'), { cache: 'no-store' })
    const data = (await response.json()) as { appointments?: Appointment[]; error?: string }

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load appointments.')
    }

    setAppointments(data.appointments || [])
  }

  useEffect(() => {
    startTransition(() => {
      loadAppointments().catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load appointments.')
      })
    })
  }, [])

  const visibleDays = useMemo(() => {
    const start = new Date(monthCursor)
    const firstWeekday = start.getUTCDay()
    start.setUTCDate(start.getUTCDate() - firstWeekday)

    return Array.from({ length: 42 }, (_, index) => {
      const current = new Date(start)
      current.setUTCDate(start.getUTCDate() + index)
      const key = current.toISOString().slice(0, 10)

      return {
        appointments: appointments.filter((appointment) => appointment.startAt.slice(0, 10) === key),
        date: current,
        key,
        inMonth: current.getUTCMonth() === monthCursor.getUTCMonth(),
      }
    })
  }, [appointments, monthCursor])

  const selectedAppointments = appointments.filter(
    (appointment) => appointment.startAt.slice(0, 10) === selectedDate,
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Card className="overflow-hidden border-black/5 shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-black/5 pb-5">
          <div>
            <CardTitle className="text-2xl">{monthCursor.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</CardTitle>
            <CardDescription>Bookings appear directly on the calendar after creation.</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href={getGoogleCalendarUrl()} rel="noreferrer" target="_blank">
                Open Google Calendar
              </a>
            </Button>
            <Button
              onClick={() =>
                setMonthCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 1, 1)))
              }
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setMonthCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1)))
              }
              variant="outline"
            >
              Next
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-black/5 bg-[#f6efe3] text-center text-xs font-semibold tracking-[0.24em] text-[#7c6448] uppercase">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
              <div className="px-2 py-3" key={label}>
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {visibleDays.map((day) => {
              const isSelected = day.key === selectedDate

              return (
                <button
                  className={[
                    'min-h-32 border-b border-r border-black/5 p-3 text-left transition-colors',
                    day.inMonth ? 'bg-white' : 'bg-[#f8f5ee]',
                    isSelected ? 'bg-[#fff4db]' : 'hover:bg-[#fff9ef]',
                  ].join(' ')}
                  key={day.key}
                  onClick={() => setSelectedDate(day.key)}
                  type="button"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className={day.inMonth ? 'text-sm font-semibold text-[#1d140d]' : 'text-sm text-muted-foreground'}>
                      {day.date.getUTCDate()}
                    </span>
                    {day.appointments.length ? (
                      <span className="rounded-full bg-[#d97706] px-2 py-0.5 text-[10px] font-semibold text-white">
                        {day.appointments.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    {day.appointments.slice(0, 3).map((appointment) => (
                      <div className="rounded-xl bg-[#1d140d] px-2 py-1 text-xs text-white" key={appointment.id}>
                        <div className="font-medium">{appointment.title}</div>
                        <div className="text-white/75">
                          {new Date(appointment.startAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-black/5 shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
          <CardHeader>
            <CardTitle className="text-xl">{editingAppointmentId ? 'Edit Appointment' : 'Create Appointment'}</CardTitle>
            <CardDescription>
              {editingAppointmentId
                ? 'Update the booking details and save the changes back to the live calendar.'
                : 'Add a booking and it will appear on the calendar immediately.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault()
                setSubmitting(true)
                setError('')

                try {
                  const isEditing = Boolean(editingAppointmentId)
                  const response = await fetch(
                    isEditing ? portalApi(`/appointments/${editingAppointmentId}`) : portalApi('/appointments'),
                    {
                      body: JSON.stringify(form),
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      method: isEditing ? 'PATCH' : 'POST',
                    },
                  )

                  const data = (await response.json()) as { appointment?: Appointment; error?: string }

                  if (!response.ok) {
                    setError(data.error || `Unable to ${isEditing ? 'update' : 'create'} appointment.`)
                    return
                  }

                  setAppointments((current) =>
                    (isEditing
                      ? current.map((appointment) => (appointment.id === data.appointment!.id ? data.appointment! : appointment))
                      : [...current, data.appointment!]
                    ).sort((a, b) => a.startAt.localeCompare(b.startAt)),
                  )
                  setSelectedDate(data.appointment!.startAt.slice(0, 10))
                  resetForm()
                } catch {
                  setError('Unable to reach the appointment service.')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="title">Booking title</Label>
                <Input id="title" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} value={form.title} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client name</Label>
                  <Input
                    id="client-name"
                    onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                    value={form.clientName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-email">Client email</Label>
                  <Input
                    id="client-email"
                    onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))}
                    type="email"
                    value={form.clientEmail}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-at">Start</Label>
                  <Input
                    id="start-at"
                    onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
                    type="datetime-local"
                    value={form.startAt}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-at">End</Label>
                  <Input
                    id="end-at"
                    onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
                    type="datetime-local"
                    value={form.endAt}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={4}
                  value={form.notes}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex gap-3">
                <Button className="flex-1" disabled={submitting} type="submit">
                  {submitting ? 'Saving booking...' : editingAppointmentId ? 'Save changes' : 'Create booking'}
                </Button>
                {editingAppointmentId ? (
                  <Button
                    disabled={submitting}
                    onClick={resetForm}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-black/5 shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
          <CardHeader>
            <CardTitle className="text-xl">Bookings for {selectedDate}</CardTitle>
            <CardDescription>Select a date in the calendar to review the day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedAppointments.length ? (
              selectedAppointments.map((appointment) => (
                <div className="rounded-2xl border border-black/5 bg-[#fcfaf6] p-4" key={appointment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1d140d]">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.clientName}
                        {appointment.clientEmail ? ` • ${appointment.clientEmail}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => startEditing(appointment)} size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button
                        onClick={async () => {
                          await fetch(portalApi(`/appointments/${appointment.id}`), { method: 'DELETE' })
                          if (editingAppointmentId === appointment.id) {
                            resetForm()
                          }
                          await loadAppointments()
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {timeFormatter.format(new Date(appointment.startAt))} to {timeFormatter.format(new Date(appointment.endAt))}
                  </p>
                  {appointment.notes ? <p className="mt-2 text-sm leading-6 text-[#4d3c2b]">{appointment.notes}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Google sync:{' '}
                    {appointment.googleSyncStatus === 'synced'
                      ? 'Synced'
                      : appointment.googleSyncStatus === 'failed'
                        ? appointment.googleSyncError || 'Failed'
                        : 'Not configured'}
                  </p>
                  <div className="mt-3">
                    <Button asChild size="sm" variant="outline">
                      <a href={getGoogleCalendarUrl(appointment)} rel="noreferrer" target="_blank">
                        {appointment.googleEventLink ? 'Open Synced Google Event' : 'Open in Google Calendar'}
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No bookings scheduled for this date yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-black/5 shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
          <CardHeader>
            <CardTitle className="text-xl">Upcoming</CardTitle>
            <CardDescription>The next confirmed bookings across the portal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => (
              <div className="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3" key={appointment.id}>
                <div>
                  <p className="font-medium text-[#1d140d]">{appointment.title}</p>
                  <p className="text-sm text-muted-foreground">{appointment.clientName}</p>
                </div>
                <p className="text-sm text-muted-foreground">{dayFormatter.format(new Date(appointment.startAt))}</p>
              </div>
            ))}
            {!appointments.length ? <p className="text-sm text-muted-foreground">No upcoming appointments yet.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Appointment } from './portal-storage'

type GoogleTokenResponse = {
  access_token: string
}

type GoogleEventResponse = {
  htmlLink?: string
  id?: string
}

export const googleOAuthConfig = {
  calendarId: process.env.GOOGLE_CALENDAR_ID || 'ai@gaiada.com',
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
  timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'Asia/Makassar',
} as const

export const isGoogleCalendarSyncConfigured = () => {
  return Boolean(
    googleOAuthConfig.clientId &&
      googleOAuthConfig.clientSecret &&
      googleOAuthConfig.refreshToken &&
      googleOAuthConfig.calendarId,
  )
}

export const getGoogleAccessToken = async () => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      client_id: googleOAuthConfig.clientId,
      client_secret: googleOAuthConfig.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: googleOAuthConfig.refreshToken,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  const data = (await response.json()) as GoogleTokenResponse & {
    error?: string
    error_description?: string
  }

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Unable to refresh Google access token.')
  }

  return data.access_token
}

export const createGoogleCalendarEvent = async (appointment: Appointment) => {
  if (!isGoogleCalendarSyncConfigured()) {
    return {
      error: 'Google Calendar sync is not configured.',
      status: 'skipped' as const,
    }
  }

  const accessToken = await getGoogleAccessToken()

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleOAuthConfig.calendarId)}/events`,
    {
      body: JSON.stringify(createGoogleEventPayload(appointment)),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  const data = (await response.json()) as GoogleEventResponse & {
    error?: {
      code?: number
      message?: string
    }
  }

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || 'Unable to create Google Calendar event.')
  }

  return {
    eventId: data.id,
    eventLink: data.htmlLink || '',
    status: 'synced' as const,
  }
}

const createGoogleEventPayload = (appointment: Appointment) => {
  const attendees = appointment.clientEmail ? [{ email: appointment.clientEmail }] : undefined
  const description = [
    `Client: ${appointment.clientName}`,
    appointment.clientEmail ? `Email: ${appointment.clientEmail}` : '',
    appointment.notes ? `Notes: ${appointment.notes}` : '',
    `Portal appointment ID: ${appointment.id}`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    attendees,
    description,
    end: {
      dateTime: appointment.endAt,
      timeZone: googleOAuthConfig.timeZone,
    },
    start: {
      dateTime: appointment.startAt,
      timeZone: googleOAuthConfig.timeZone,
    },
    summary: appointment.title,
  }
}

export const updateGoogleCalendarEvent = async (appointment: Appointment) => {
  if (!appointment.googleEventId) {
    return createGoogleCalendarEvent(appointment)
  }

  if (!isGoogleCalendarSyncConfigured()) {
    return {
      error: 'Google Calendar sync is not configured.',
      status: 'skipped' as const,
    }
  }

  const accessToken = await getGoogleAccessToken()
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleOAuthConfig.calendarId)}/events/${encodeURIComponent(appointment.googleEventId)}`,
    {
      body: JSON.stringify(createGoogleEventPayload(appointment)),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )

  const data = (await response.json()) as GoogleEventResponse & {
    error?: {
      code?: number
      message?: string
    }
  }

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || 'Unable to update Google Calendar event.')
  }

  return {
    eventId: data.id,
    eventLink: data.htmlLink || '',
    status: 'synced' as const,
  }
}

export const deleteGoogleCalendarEvent = async (appointment: Appointment) => {
  if (!appointment.googleEventId || !isGoogleCalendarSyncConfigured()) {
    return
  }

  const accessToken = await getGoogleAccessToken()
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleOAuthConfig.calendarId)}/events/${encodeURIComponent(appointment.googleEventId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'DELETE',
    },
  )

  if (response.status === 404) {
    return
  }

  if (!response.ok) {
    const data = (await response.json()) as {
      error?: {
        message?: string
      }
    }

    throw new Error(data.error?.message || 'Unable to delete Google Calendar event.')
  }
}

import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export type Appointment = {
  clientEmail: string
  clientName: string
  createdAt: string
  endAt: string
  googleEventId?: string
  googleEventLink?: string
  googleSyncError?: string
  googleSyncStatus?: 'failed' | 'skipped' | 'synced'
  id: string
  notes: string
  startAt: string
  status: 'confirmed' | 'cancelled'
  title: string
  updatedAt: string
}

export type EmailLog = {
  body: string
  createdAt: string
  error?: string
  id: string
  sentAt?: string
  status: 'failed' | 'sent'
  subject: string
  to: string
}

const dataDir = path.join(process.cwd(), 'data')
const appointmentsFile = path.join(dataDir, 'hutton-appointments.json')
const emailLogsFile = path.join(dataDir, 'hutton-email-logs.json')

const ensureDataDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const readCollection = async <T>(filePath: string): Promise<T[]> => {
  await ensureDataDir()

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T[]
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return []
    throw error
  }
}

const writeCollection = async <T>(filePath: string, items: T[]) => {
  await ensureDataDir()
  await fs.writeFile(filePath, JSON.stringify(items, null, 2))
}

export const listAppointments = async () => {
  const appointments = await readCollection<Appointment>(appointmentsFile)
  return appointments.sort((a, b) => a.startAt.localeCompare(b.startAt))
}

export const getAppointmentById = async (id: string) => {
  const appointments = await listAppointments()
  return appointments.find((appointment) => appointment.id === id) || null
}

export const createAppointment = async (
  input: Pick<
    Appointment,
    | 'clientEmail'
    | 'clientName'
    | 'endAt'
    | 'googleEventId'
    | 'googleEventLink'
    | 'googleSyncError'
    | 'googleSyncStatus'
    | 'notes'
    | 'startAt'
    | 'title'
  >,
) => {
  const appointments = await listAppointments()
  const timestamp = new Date().toISOString()

  const appointment: Appointment = {
    ...input,
    createdAt: timestamp,
    endAt: new Date(input.endAt).toISOString(),
    id: crypto.randomUUID(),
    startAt: new Date(input.startAt).toISOString(),
    status: 'confirmed',
    updatedAt: timestamp,
  }

  appointments.push(appointment)
  await writeCollection(appointmentsFile, appointments)

  return appointment
}

export const updateAppointment = async (
  id: string,
  updates: Partial<
    Pick<
      Appointment,
      | 'clientEmail'
      | 'clientName'
      | 'endAt'
      | 'googleEventId'
      | 'googleEventLink'
      | 'googleSyncError'
      | 'googleSyncStatus'
      | 'notes'
      | 'startAt'
      | 'status'
      | 'title'
    >
  >,
) => {
  const appointments = await listAppointments()
  const index = appointments.findIndex((appointment) => appointment.id === id)

  if (index === -1) return null

  const current = appointments[index]
  const next: Appointment = {
    ...current,
    ...updates,
    endAt: updates.endAt ? new Date(updates.endAt).toISOString() : current.endAt,
    startAt: updates.startAt ? new Date(updates.startAt).toISOString() : current.startAt,
    updatedAt: new Date().toISOString(),
  }

  appointments[index] = next
  await writeCollection(appointmentsFile, appointments)

  return next
}

export const deleteAppointment = async (id: string) => {
  const appointments = await listAppointments()
  const next = appointments.filter((appointment) => appointment.id !== id)

  if (next.length === appointments.length) return false

  await writeCollection(appointmentsFile, next)
  return true
}

export const listEmailLogs = async () => {
  const logs = await readCollection<EmailLog>(emailLogsFile)
  return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const createEmailLog = async (input: Pick<EmailLog, 'body' | 'error' | 'sentAt' | 'status' | 'subject' | 'to'>) => {
  const logs = await listEmailLogs()
  const log: EmailLog = {
    ...input,
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
  }

  logs.unshift(log)
  await writeCollection(emailLogsFile, logs)

  return log
}

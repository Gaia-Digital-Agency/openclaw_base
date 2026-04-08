'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { portalApi } from '@/lib/portal-client'
import type { EmailLog } from '@/lib/portal-storage'

type EmailForm = {
  body: string
  subject: string
  to: string
}

const initialForm: EmailForm = {
  body: '',
  subject: '',
  to: '',
}

export function EmailManager() {
  const [error, setError] = useState('')
  const [form, setForm] = useState<EmailForm>(initialForm)
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  const loadLogs = async () => {
    const response = await fetch(portalApi('/email'), { cache: 'no-store' })
    const data = (await response.json()) as { error?: string; logs?: EmailLog[] }

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load email history.')
    }

    setLogs(data.logs || [])
  }

  useEffect(() => {
    loadLogs().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load email history.')
    })
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-black/5 shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl">Send Email</CardTitle>
          <CardDescription>Use the Gmail account for Hutton outreach, booking confirmations, and follow-up messages.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setError('')
              setSuccess('')
              setSubmitting(true)

              try {
                const response = await fetch(portalApi('/email'), {
                  body: JSON.stringify(form),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                })

                const data = (await response.json()) as { error?: string; log?: EmailLog }

                if (!response.ok) {
                  setError(data.error || 'Unable to send email.')
                  if (data.log) {
                    setLogs((current) => [data.log!, ...current])
                  }
                  return
                }

                setLogs((current) => [data.log!, ...current])
                setForm(initialForm)
                setSuccess('Email sent successfully.')
              } catch {
                setError('Unable to reach the email service.')
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" onChange={(event) => setForm((current) => ({ ...current, to: event.target.value }))} type="email" value={form.to} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} value={form.subject} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} rows={12} value={form.body} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-green-700">{success}</p> : null}

            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? 'Sending...' : 'Send email'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-black/5 shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl">Recent Email Activity</CardTitle>
          <CardDescription>Every attempt is logged so testing is visible before Hutton starts using it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length ? (
            logs.map((log) => (
              <div className="rounded-2xl border border-black/5 bg-[#fcfaf6] p-4" key={log.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-[#1d140d]">{log.subject}</p>
                  <span
                    className={[
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700',
                    ].join(' ')}
                  >
                    {log.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{log.to}</p>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#4d3c2b] whitespace-pre-wrap">{log.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                  {log.error ? ` • ${log.error}` : ''}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No email has been sent from this portal yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

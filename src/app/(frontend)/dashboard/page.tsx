import Link from 'next/link'

import { PortalShell } from '@/components/hutton/PortalShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requirePortalSession } from '@/lib/portal-auth'

export default async function DashboardPage() {
  await requirePortalSession()

  return (
    <PortalShell
      current="dashboard"
      subtitle="Choose the workflow Hutton needs today. Both tools are built for live testing on this site before onboarding the team."
      title="Operational Dashboard"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-black/5 bg-white shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl">Appointment Management Calendar</CardTitle>
            <CardDescription>Create bookings, review the schedule, and keep the calendar current.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">
              Every appointment is stored by the portal and rendered immediately in the calendar view so testing feels like the final workflow.
            </p>
            <Button asChild className="w-full">
              <Link href="/calendar">Open Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-black/5 bg-white shadow-[0_25px_80px_rgba(76,58,29,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl">Email Sending</CardTitle>
            <CardDescription>Send live outbound messages and review delivery attempts in one place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">
              The email page sends through the Gmail account once its SMTP credentials are set on the server and keeps a visible activity log for validation.
            </p>
            <Button asChild className="w-full">
              <Link href="/email">Open Email</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  )
}

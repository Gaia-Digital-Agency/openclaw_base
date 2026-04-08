import { CalendarManager } from '@/components/hutton/CalendarManager'
import { PortalShell } from '@/components/hutton/PortalShell'
import { requirePortalSession } from '@/lib/portal-auth'

export default async function CalendarPage() {
  await requirePortalSession()

  return (
    <PortalShell
      current="calendar"
      subtitle="This calendar is the live booking surface for Hutton testing. New appointments appear instantly and can be reviewed by day and by month."
      title="Appointment Management Calendar"
    >
      <CalendarManager />
    </PortalShell>
  )
}

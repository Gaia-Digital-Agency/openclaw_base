'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { portalApi } from '@/lib/portal-client'

export function PortalLogoutButton() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  return (
    <Button
      disabled={submitting}
      onClick={async () => {
        setSubmitting(true)

        try {
          await fetch(portalApi('/auth/logout'), {
            method: 'POST',
          })
          router.replace('/login')
          router.refresh()
        } finally {
          setSubmitting(false)
        }
      }}
      variant="outline"
    >
      {submitting ? 'Signing out...' : 'Log out'}
    </Button>
  )
}

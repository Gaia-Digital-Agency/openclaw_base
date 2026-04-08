import { NextResponse } from 'next/server'

import { getPortalSession } from '@/lib/portal-auth'

export async function GET() {
  const session = await getPortalSession()

  return NextResponse.json({
    authenticated: Boolean(session),
    username: session?.username || null,
  })
}

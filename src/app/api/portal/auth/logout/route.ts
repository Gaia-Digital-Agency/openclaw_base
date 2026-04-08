import { NextResponse } from 'next/server'

import { getPortalCookieOptions } from '@/lib/portal-auth'
import { portalConfig } from '@/lib/portal-config'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(portalConfig.cookieName, '', {
    ...getPortalCookieOptions(),
    expires: new Date(0),
  })
  return response
}

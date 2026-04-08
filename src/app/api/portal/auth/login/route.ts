import { NextResponse } from 'next/server'

import {
  createPortalSessionToken,
  getPortalCookieOptions,
  isPortalCredentialValid,
} from '@/lib/portal-auth'
import { portalConfig } from '@/lib/portal-config'

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string; username?: string }
  const username = body.username?.trim() || ''
  const password = body.password || ''

  if (!isPortalCredentialValid(username, password)) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(portalConfig.cookieName, createPortalSessionToken(username), getPortalCookieOptions())

  return response
}

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

import { portalConfig } from './portal-config'

type PortalSession = {
  exp: number
  username: string
}

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url')
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

const sign = (payload: string) => {
  return crypto.createHmac('sha256', portalConfig.sessionSecret).update(payload).digest('base64url')
}

export const isPortalCredentialValid = (username: string, password: string) => {
  return username === portalConfig.username && password === portalConfig.password
}

export const createPortalSessionToken = (username: string) => {
  const payload: PortalSession = {
    exp: Math.floor(Date.now() / 1000) + portalConfig.sessionTtlSeconds,
    username,
  }

  const encodedPayload = encode(JSON.stringify(payload))

  return `${encodedPayload}.${sign(encodedPayload)}`
}

export const parsePortalSessionToken = (token?: string | null): PortalSession | null => {
  if (!token) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  if (sign(payload) !== signature) return null

  try {
    const session = JSON.parse(decode(payload)) as PortalSession

    if (!session.username || !session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export const getPortalSession = async () => {
  const store = await cookies()
  return parsePortalSessionToken(store.get(portalConfig.cookieName)?.value)
}

export const requirePortalSession = async () => {
  const session = await getPortalSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

export const getPortalCookieOptions = () => {
  const secure = (process.env.NEXT_PUBLIC_SERVER_URL || '').startsWith('https://')

  return {
    httpOnly: true,
    maxAge: portalConfig.sessionTtlSeconds,
    path: '/',
    sameSite: 'lax',
    secure,
  } as const
}

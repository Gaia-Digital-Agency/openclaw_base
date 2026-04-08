import { portalConfig } from './portal-config'
import { getGoogleAccessToken } from './google-calendar'

type EmailInput = {
  body: string
  subject: string
  to: string
}

const escapeBody = (value: string) => {
  return value.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..')
}

const createMessage = ({ body, subject, to }: EmailInput) => {
  return [
    `From: Hutton Skills <${portalConfig.emailFrom}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    escapeBody(body),
    '',
  ].join('\r\n')
}

const toBase64Url = (value: string) => Buffer.from(value, 'utf8').toString('base64url')

export const sendPortalEmail = async (input: EmailInput) => {
  const accessToken = await getGoogleAccessToken()
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    body: JSON.stringify({
      raw: toBase64Url(createMessage(input)),
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const data = (await response.json()) as {
    error?: {
      code?: number
      message?: string
    }
    id?: string
  }

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || 'Unable to send Gmail message.')
  }
}

export const portalConfig = {
  basePath: '/templatehos',
  cookieName: 'hutton_portal_session',
  emailFrom: process.env.PORTAL_EMAIL_FROM || process.env.PORTAL_SMTP_USER || 'ai@gaiada.com',
  password: process.env.PORTAL_PASSWORD || 'Teameditor@123',
  sessionSecret: process.env.PORTAL_SESSION_SECRET || process.env.PAYLOAD_SECRET || 'hutton-portal-secret',
  sessionTtlSeconds: 60 * 60 * 24 * 7,
  smtpHost: process.env.PORTAL_SMTP_HOST || 'smtp.gmail.com',
  smtpPass: process.env.PORTAL_SMTP_PASS || '',
  smtpPort: Number(process.env.PORTAL_SMTP_PORT || '465'),
  smtpUser: process.env.PORTAL_SMTP_USER || 'ai@gaiada.com',
  username: process.env.PORTAL_USERNAME || 'user',
} as const

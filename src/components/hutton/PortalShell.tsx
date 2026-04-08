import Link from 'next/link'
import type { ReactNode } from 'react'

import { PortalLogoutButton } from './PortalLogoutButton'

type Props = {
  children: ReactNode
  current: 'calendar' | 'dashboard' | 'email'
  subtitle: string
  title: string
}

const linkClass = (active: boolean) =>
  [
    'rounded-full border px-4 py-2 text-sm transition-colors',
    active ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-accent',
  ].join(' ')

export function PortalShell({ children, current, subtitle, title }: Props) {
  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[linear-gradient(180deg,#f6f5ef_0%,#fff9ef_45%,#ffffff_100%)]">
      <section className="container py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-[0_30px_80px_rgba(65,47,25,0.08)] backdrop-blur md:flex-row md:items-end md:justify-between md:p-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
              Hutton Skills Portal
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1d140d] md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className={linkClass(current === 'dashboard')} href="/dashboard">
              Dashboard
            </Link>
            <Link className={linkClass(current === 'calendar')} href="/calendar">
              Calendar
            </Link>
            <Link className={linkClass(current === 'email')} href="/email">
              Email
            </Link>
            <PortalLogoutButton />
          </div>
        </div>

        {children}
      </section>
    </main>
  )
}

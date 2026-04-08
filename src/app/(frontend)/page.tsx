import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="bg-[linear-gradient(180deg,#f3efe4_0%,#f7edd9_28%,#ffffff_74%)]">
      <section className="container grid gap-10 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-[#d6c5a8] bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.28em] text-[#7d633d] uppercase">
            Hutton Skills
          </div>

          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[#1d140d] md:text-6xl">
              A live booking and outreach portal built for Hutton.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[#5a4631] md:text-lg">
              This site gives Hutton’s booking manager one place to manage appointments on a live calendar and send outbound email. It is being launched for testing first on the staging multisite before Hutton begins using it directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/calendar">Preview Calendar</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-[#1f1610] p-6 text-white shadow-[0_35px_90px_rgba(35,24,15,0.32)] md:p-8">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#f0c278] uppercase">What this site is for</p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Calendar Control</h2>
              <p className="mt-2 text-sm leading-7 text-white/75">
                Create and view appointments in a booking calendar so the schedule stays visible and current.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Email Sending</h2>
              <p className="mt-2 text-sm leading-7 text-white/75">
                Send operational email from the Hutton workflow and keep a visible history of every send attempt.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#f0c278] p-5 text-[#1f1610]">
              <p className="text-sm font-semibold">Testing credentials</p>
              <p className="mt-2 text-sm leading-7">
                Username: <strong>user</strong>
                <br />
                Password: <strong>Teameditor@123</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

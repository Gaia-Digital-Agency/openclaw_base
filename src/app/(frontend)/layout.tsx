import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'
import { WhatsAppCTA } from '@/components/WhatsAppCTA'
import { BackToTop } from '@/components/BackToTop'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
          <WhatsAppCTA />
          <BackToTop />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Hutton Service',
  description: 'Hutton Service helps manage appointments, bookings, and client email communication.',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    title: 'Hutton Service',
    description: 'Hutton Service helps manage appointments, bookings, and client email communication.',
  },
}

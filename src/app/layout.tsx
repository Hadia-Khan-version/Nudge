import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { AuroraBackground } from '@/components/AuroraBackground'

const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex-sans' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' })
const instrument = Instrument_Serif({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], variable: '--font-instrument' })

export const metadata: Metadata = {
  title: 'Nudge',
  description: 'Your inbox, minus the noise.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} ${instrument.variable}`}>
      <body className="relative min-h-screen bg-void font-sans text-ink antialiased">
        <AuroraBackground />
        <div className="noise-layer pointer-events-none fixed inset-0 z-50" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _dmSans = DM_Sans({ subsets: ["latin"], variable: '--font-dm-sans' });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Dr. Sindhu Ragavi | Dermatologist in Chennai | Book Appointment',
  description: 'Book an appointment with Dr. Sindhu Ragavi, consultant dermatologist in Velachery, Chennai. Expert skin care treatments with free cancellation.',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_dmSans.variable} ${_playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}

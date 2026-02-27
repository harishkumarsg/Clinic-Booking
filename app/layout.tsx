import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _dmSans = DM_Sans({ subsets: ["latin"], variable: '--font-dm-sans' });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Dr. Sindhu\'s Skin Clinic | Book Appointment Online',
  description: 'Book an appointment with Dr. B.Sindhu Raaghavi, expert dermatologist in Velachery, Chennai. Specialized treatments for skin, hair, and aesthetic concerns.',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      {
        url: '/clinic-logo.png',
        type: 'image/png',
      },
    ],
    apple: '/clinic-logo.png',
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

import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'BirdsRadar - Protect Our Migratory Birds',
  description: 'Join Sydney\'s citizen-science movement to track bird migrations and reduce light pollution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans`} style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>{children}</body>
    </html>
  )
}

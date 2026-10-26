import type { Metadata } from 'next'
import '@fontsource-variable/geom'
import 'leaflet/dist/leaflet.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'BirdRadar — A world in flight',
  description: 'Explore real historical bird tracking, discover migration across continents, and collect illustrated bird stamps.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

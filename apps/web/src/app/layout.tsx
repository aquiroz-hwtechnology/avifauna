import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/layout/Providers'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'Mi Fauna App',
  description: 'Identificación y registro de especies de fauna con GPS',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mi Fauna App',
  },
}

export const viewport: Viewport = {
  themeColor: '#14532d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <main className="pb-20">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}

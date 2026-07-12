import type { Metadata } from 'next'
import '@/styles/globals.css'
import { ChangelogPill } from '@/components/organisms/ChangelogPill'

export const metadata: Metadata = {
  title: 'La Magdalena',
  description: 'Convertimos impacto real en narrativas creíbles, visibles y relevantes.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'La Magdalena',
    description: 'Convertimos impacto real en narrativas creíbles, visibles y relevantes.',
    url: 'https://lamagdalena.com.co',
    siteName: 'La Magdalena',
    images: [
      {
        url: '/og-image.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <ChangelogPill />
      </body>
    </html>
  )
}

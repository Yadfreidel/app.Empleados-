// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'F&M Fumigación — Calendario Operativo',
    template: '%s | F&M Fumigación',
  },
  description: 'Sistema de gestión operativa para F&M Fumigación. Consulta y administra los trabajos programados en cada hotel.',
  keywords: ['fumigación', 'calendario operativo', 'control de plagas', 'hoteles'],
  robots: 'noindex,nofollow', // app interna
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

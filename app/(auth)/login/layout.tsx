// app/(auth)/login/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso Administrador',
  description: 'Inicio de sesión para administradores de F&M Fumigación.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}

'use client'
// app/(auth)/login/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import type { Metadata } from 'next'
import Logo from '@/components/layout/Logo'
import Button from '@/components/ui/Button'
import { loginSchema } from '@/lib/validations'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      // Import client dynamically to avoid SSR issues
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      })
      if (authError) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
        return
      }
      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, var(--fm-green-950) 0%, var(--fm-blue-950) 100%)',
      }}
    >
      {/* Card */}
      <div className="fm-card w-full max-w-sm p-8 fm-animate-scalein">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <h1 className="text-xl font-700 text-slate-900 text-center mb-1">
          Acceso Administrador
        </h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          Ingresa tus credenciales para continuar
        </p>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2.5 p-3.5 rounded-fm mb-5 fm-animate-fadein text-sm"
            role="alert"
            style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="fm-label">Correo electrónico</label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-faint)' }}
                aria-hidden="true"
              >
                <Mail size={16} />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="fm-input pl-9"
                placeholder="admin@fumigacion.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="fm-label">Contraseña</label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-faint)' }}
                aria-hidden="true"
              >
                <Lock size={16} />
              </span>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                className="fm-input pl-9 pr-10"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                style={{ color: 'var(--color-text-faint)' }}
                tabIndex={-1}
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            id="btn-login"
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            Iniciar sesión
          </Button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Ver calendario
          </Link>
        </div>
      </div>
    </div>
  )
}

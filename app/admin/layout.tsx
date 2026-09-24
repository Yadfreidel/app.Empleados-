'use client'
// app/(admin)/layout.tsx — Layout compartido del panel administrador
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, CalendarDays, Building2, Tag,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import Logo from '@/components/layout/Logo'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/actividades', label: 'Actividades', icon: CalendarDays },
  { href: '/admin/hoteles',     label: 'Hoteles',     icon: Building2 },
  { href: '/admin/operaciones', label: 'Operaciones', icon: Tag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail]     = useState<string | null>(null)
  const [roleStatus, setRoleStatus]   = useState<'loading' | 'admin' | 'not_admin' | 'no_profile' | 'demo'>('loading')

  // Get current user email and profile
  useEffect(() => {
    async function getUser() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email ?? null)
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, active')
            .eq('id', user.id)
            .maybeSingle()

          if (!profile) {
            setRoleStatus('no_profile')
          } else if (profile.role === 'admin' && profile.active) {
            setRoleStatus('admin')
          } else {
            setRoleStatus('not_admin')
          }
        } else {
          setUserEmail(null)
          setRoleStatus('demo')
        }
      } catch {
        // Supabase not configured yet
        setUserEmail('admin@demo.local')
        setRoleStatus('demo')
      }
    }
    getUser()
  }, [])

  async function handleLogout() {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* ignore */ }
    router.push('/login')
  }

  function NavContent() {
    return (
      <nav className="flex flex-col gap-1 flex-1" aria-label="Navegación de administrador">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-fm text-sm font-500 transition-all group',
                active
                  ? 'bg-fm-green-800 text-white shadow-fm-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={17} className={cn(!active && 'text-slate-400 group-hover:text-slate-600')} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 h-screen sticky top-0"
        style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <NavContent />
        </div>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="px-3 py-2.5 mb-1">
            <p className="text-xs font-600 text-slate-800 truncate">{userEmail || '…'}</p>
            <p className="text-xs text-slate-400">
              {roleStatus === 'admin'
                ? 'Administrador'
                : roleStatus === 'loading'
                ? 'Verificando rol…'
                : roleStatus === 'no_profile'
                ? 'Sin perfil en BD'
                : 'Rol: Consulta'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-fm text-sm font-500 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <>
          <div
            className="fm-backdrop lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col lg:hidden fm-animate-fadein"
            style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <Logo size="sm" />
              <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 px-3 py-4 overflow-y-auto">
              <NavContent />
            </div>
            <div className="px-3 py-4 border-t border-slate-100">
              <div className="px-3 py-1 mb-2">
                <p className="text-xs font-600 text-slate-800 truncate">{userEmail || '…'}</p>
                <p className="text-xs text-slate-400">
                  {roleStatus === 'admin' ? 'Administrador' : 'Rol no admin'}
                </p>
              </div>
              <button
                onClick={() => { setSidebarOpen(false); handleLogout() }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-fm text-sm font-500 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 h-14 flex-shrink-0 sticky top-0 z-20"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
          <Button
            id="btn-mobile-menu"
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </Button>
          <Logo size="sm" />
        </header>

        {/* Warning banner if database permissions are not admin */}
        {(roleStatus === 'no_profile' || roleStatus === 'not_admin') && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900 text-sm">
            <div className="fm-container flex items-start gap-3">
              <span className="text-lg leading-none">⚠️</span>
              <div>
                <p className="font-600">Permisos de Administrador requeridos en la Base de Datos</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Tu usuario (<span className="font-mono">{userEmail}</span>) está autenticado, pero {roleStatus === 'no_profile' ? 'no tiene registro en la tabla profiles' : 'tiene rol "consulta" en lugar de "admin"'}. Esto bloquea el guardado por las políticas de seguridad (RLS). Para solucionarlo, ejecuta el script <code className="bg-amber-100 font-mono px-1 rounded text-amber-900">supabase/fix_database.sql</code> en el SQL Editor de tu Supabase Dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 fm-container py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

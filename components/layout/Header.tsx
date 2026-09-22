'use client'
// components/layout/Header.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, LayoutDashboard, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  isAdmin?: boolean
  onAdminLogout?: () => void
}

export default function Header({ isAdmin, onAdminLogout }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = isAdmin
    ? [
        { href: '/admin/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
        { href: '/admin/actividades', label: 'Actividades', icon: CalendarDays },
      ]
    : [
        { href: '/', label: 'Calendario', icon: CalendarDays },
      ]

  return (
    <header
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="fm-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 focus-visible:outline-offset-4">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-fm text-sm font-500 transition-colors',
                  pathname === href || (href !== '/' && pathname.startsWith(href))
                    ? 'bg-fm-green-50 text-fm-green-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Button variant="ghost" size="sm" onClick={onAdminLogout} className="hidden md:flex">
                Cerrar sesión
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" leftIcon={<LogIn size={14} />} className="hidden md:flex">
                  Admin
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-slate-100 fm-animate-fadein"
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="fm-container py-3 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-fm text-sm font-500 transition-colors',
                  pathname === href || (href !== '/' && pathname.startsWith(href))
                    ? 'bg-fm-green-50 text-fm-green-800'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <hr className="fm-divider my-2" />
            {isAdmin ? (
              <button
                onClick={() => { setMobileOpen(false); onAdminLogout?.() }}
                className="flex items-center gap-3 px-3 py-3 rounded-fm text-sm font-500 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-fm text-sm font-500 text-fm-green-700 hover:bg-fm-green-50 transition-colors"
              >
                <LogIn size={18} />
                Acceso administrador
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

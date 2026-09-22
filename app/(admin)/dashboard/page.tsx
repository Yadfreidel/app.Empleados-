// app/(admin)/dashboard/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CalendarDays, Building2, Tag, Activity,
  TrendingUp, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="fm-card fm-card-hover block p-5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-fm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `${color}15`, color }}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="text-2xl font-800 text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-600 text-slate-700">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </Link>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8 fm-animate-fadein">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-800 text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Resumen operativo de F&amp;M Fumigación
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays} label="Actividades hoy" value="—"
          sub="Conecta Supabase para ver datos" color="#15803d"
          href="/admin/actividades"
        />
        <StatCard
          icon={Clock} label="Esta semana" value="—"
          color="#2563eb" href="/admin/actividades"
        />
        <StatCard
          icon={AlertTriangle} label="Urgentes" value="—"
          color="#dc2626" href="/admin/actividades"
        />
        <StatCard
          icon={CheckCircle2} label="Completadas" value="—"
          color="#0891b2" href="/admin/actividades"
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-700 text-slate-800 mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/actividades', icon: Activity, label: 'Actividades', desc: 'Crear y gestionar trabajos' },
            { href: '/admin/hoteles',     icon: Building2, label: 'Hoteles',     desc: 'Administrar hoteles' },
            { href: '/admin/operaciones', icon: Tag,       label: 'Operaciones', desc: 'Tipos y colores' },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="fm-card fm-card-hover flex items-center gap-4 px-5 py-4 group"
            >
              <div
                className="w-10 h-10 rounded-fm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: 'var(--fm-green-50)', color: 'var(--fm-green-700)' }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-sm font-700 text-slate-900">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div
        className="rounded-fm-lg p-5 flex items-start gap-4"
        style={{ background: 'var(--fm-blue-50)', border: '1px solid var(--fm-blue-100)' }}
      >
        <TrendingUp size={20} style={{ color: 'var(--fm-blue-600)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="text-sm font-600" style={{ color: 'var(--fm-blue-900)' }}>
            Sistema listo para conectar
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fm-blue-700)' }}>
            Agrega las variables <code className="font-mono bg-white/70 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
            <code className="font-mono bg-white/70 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el archivo{' '}
            <code className="font-mono bg-white/70 px-1 py-0.5 rounded">.env.local</code> para activar la base de datos.
          </p>
        </div>
      </div>
    </div>
  )
}

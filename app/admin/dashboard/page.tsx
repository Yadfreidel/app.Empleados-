'use client'
// app/(admin)/dashboard/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CalendarDays, Building2, Tag, Activity,
  Clock, AlertTriangle, CheckCircle2, TrendingUp,
} from 'lucide-react'
import { format, isToday, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { Skeleton } from '@/components/ui/Skeleton'

function StatCard({
  icon: Icon, label, value, sub, color, href, loading,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  href: string
  loading?: boolean
}) {
  return (
    <Link href={href} className="fm-card fm-card-hover block p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-fm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={20} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16 mb-1 rounded" />
      ) : (
        <div className="text-2xl font-800 text-slate-900 mb-1">{value}</div>
      )}
      <div className="text-sm font-600 text-slate-700">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </Link>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    today: 0, week: 0, urgent: 0, completed: 0,
    hotels: 0, opTypes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<{id: string; title: string; date: string; status: string}[]>([])

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const today = format(new Date(), 'yyyy-MM-dd')
        const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
        const weekEnd   = format(endOfWeek(new Date(),   { weekStartsOn: 1 }), 'yyyy-MM-dd')

        const [
          { count: todayCount },
          { count: weekCount },
          { count: urgentCount },
          { count: completedCount },
          { count: hotelsCount },
          { count: opTypesCount },
          { data: recent },
        ] = await Promise.all([
          supabase.from('activities').select('*', { count: 'exact', head: true }).eq('date', today),
          supabase.from('activities').select('*', { count: 'exact', head: true }).gte('date', weekStart).lte('date', weekEnd),
          supabase.from('activities').select('*', { count: 'exact', head: true }).eq('priority', 'urgente').not('status', 'eq', 'completado'),
          supabase.from('activities').select('*', { count: 'exact', head: true }).eq('status', 'completado'),
          supabase.from('hotels').select('*', { count: 'exact', head: true }).eq('active', true),
          supabase.from('operation_types').select('*', { count: 'exact', head: true }).eq('active', true),
          supabase.from('activities').select('id,title,date,status').order('created_at', { ascending: false }).limit(5),
        ])
        setStats({
          today:     todayCount ?? 0,
          week:      weekCount ?? 0,
          urgent:    urgentCount ?? 0,
          completed: completedCount ?? 0,
          hotels:    hotelsCount ?? 0,
          opTypes:   opTypesCount ?? 0,
        })
        setRecentActivities(recent ?? [])
      } catch (e) {
        console.error('Dashboard stats error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
    programado:  { bg: '#eff6ff', text: '#1d4ed8' },
    en_progreso: { bg: '#fefce8', text: '#a16207' },
    completado:  { bg: '#f0fdf4', text: '#15803d' },
    cancelado:   { bg: '#fef2f2', text: '#b91c1c' },
    postpuesto:  { bg: '#faf5ff', text: '#7c3aed' },
  }
  const STATUS_LABEL: Record<string, string> = {
    programado: 'Programado', en_progreso: 'En progreso',
    completado: 'Completado', cancelado: 'Cancelado', postpuesto: 'Postpuesto',
  }

  return (
    <div className="space-y-8 fm-animate-fadein">
      <div>
        <h1 className="text-2xl font-800 text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen operativo de F&amp;M Fumigación</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Actividades hoy"   value={stats.today}     color="#15803d" href="/admin/actividades" loading={loading} />
        <StatCard icon={Clock}        label="Esta semana"        value={stats.week}      color="#2563eb" href="/admin/actividades" loading={loading} />
        <StatCard icon={AlertTriangle} label="Urgentes activas" value={stats.urgent}    color="#dc2626" href="/admin/actividades" loading={loading} />
        <StatCard icon={CheckCircle2}  label="Completadas"      value={stats.completed} color="#0891b2" href="/admin/actividades" loading={loading} />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-700 text-slate-800 mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/actividades', icon: Activity,  label: 'Actividades', desc: 'Crear y gestionar trabajos' },
            { href: '/admin/hoteles',     icon: Building2, label: `Hoteles (${loading ? '…' : stats.hotels})`, desc: 'Administrar hoteles' },
            { href: '/admin/operaciones', icon: Tag,       label: `Operaciones (${loading ? '…' : stats.opTypes})`, desc: 'Tipos y colores' },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="fm-card fm-card-hover flex items-center gap-4 px-5 py-4 group">
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

      {/* Recent activities */}
      {recentActivities.length > 0 && (
        <div>
          <h2 className="text-base font-700 text-slate-800 mb-3">Actividades recientes</h2>
          <div className="fm-card divide-y divide-slate-100">
            {recentActivities.map(a => {
              const sc = STATUS_BADGE[a.status] ?? STATUS_BADGE.programado
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-600 text-slate-900 truncate">{a.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{format(parseISO(a.date), 'dd/MM/yyyy')}</div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-500 flex-shrink-0"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-2 text-right">
            <Link href="/admin/actividades" className="text-xs text-fm-green-700 hover:underline font-500">
              Ver todas →
            </Link>
          </div>
        </div>
      )}

      {/* Info tip when connected */}
      {!loading && stats.hotels === 0 && stats.opTypes === 0 && (
        <div
          className="rounded-fm-lg p-5 flex items-start gap-4"
          style={{ background: 'var(--fm-blue-50)', border: '1px solid var(--fm-blue-100)' }}
        >
          <TrendingUp size={20} style={{ color: 'var(--fm-blue-600)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-600" style={{ color: 'var(--fm-blue-900)' }}>
              Primeros pasos
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fm-blue-700)' }}>
              Comienza creando los hoteles y tipos de operación. Luego podrás registrar actividades en el calendario.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

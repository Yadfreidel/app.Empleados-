'use client'
// components/calendar/DayPanel.tsx
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Calendar } from 'lucide-react'
import type { Activity } from '@/types'
import ActivityCard from './ActivityCard'
import Button from '@/components/ui/Button'
import { EmptyCalendarDay } from '@/components/ui/EmptyState'
import { ActivityCardSkeleton } from '@/components/ui/Skeleton'
import { capitalize } from '@/lib/utils'

interface DayPanelProps {
  date: Date | null
  activities: Activity[]
  loading?: boolean
  onClose: () => void
}

export default function DayPanel({ date, activities, loading, onClose }: DayPanelProps) {
  if (!date) return null

  const dateLabel = capitalize(format(date, "EEEE d 'de' MMMM", { locale: es }))

  return (
    <section
      className="fm-card flex flex-col overflow-hidden h-full fm-animate-fadein"
      aria-label={`Actividades del ${dateLabel}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-fm flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--fm-green-100)', color: 'var(--fm-green-700)' }}
            aria-hidden="true"
          >
            <Calendar size={16} />
          </div>
          <div>
            <h2 className="text-sm font-700 text-slate-900 leading-snug">{dateLabel}</h2>
            <p className="text-xs text-slate-500">
              {loading ? '…' : `${activities.length} actividad${activities.length !== 1 ? 'es' : ''}`}
            </p>
          </div>
        </div>
        <Button
          id="btn-close-day-panel"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Cerrar panel del día"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <>
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </>
        ) : activities.length === 0 ? (
          <EmptyCalendarDay />
        ) : (
          activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </section>
  )
}

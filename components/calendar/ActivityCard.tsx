// components/calendar/ActivityCard.tsx
import { Clock, Building2, Tag, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Activity } from '@/types'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import { formatTime, truncate, getContrastText } from '@/lib/utils'

interface ActivityCardProps {
  activity: Activity
  compact?: boolean
}

export default function ActivityCard({ activity, compact }: ActivityCardProps) {
  const typeColor = activity.color_override || activity.operation_type?.color || '#16a34a'
  const textOnColor = getContrastText(typeColor)

  return (
    <article
      className="fm-card fm-card-hover overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: typeColor }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Operation type pill */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 flex-shrink-0"
            style={{ background: typeColor, color: textOnColor }}
          >
            <Tag size={10} />
            {activity.operation_type?.name || 'Operación'}
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <StatusBadge status={activity.status} />
            <PriorityBadge priority={activity.priority} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-700 text-slate-900 mb-1 leading-snug">
          {activity.title}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
          {/* Hotel */}
          <span className="flex items-center gap-1">
            <Building2 size={11} />
            {activity.hotel?.name || '—'}
          </span>
          {/* Time */}
          {activity.start_time && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatTime(activity.start_time)}
              {activity.end_time && ` – ${formatTime(activity.end_time)}`}
            </span>
          )}
        </div>

        {/* Description (truncated) */}
        {!compact && activity.description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            {truncate(activity.description, 120)}
          </p>
        )}

        {/* Notes preview */}
        {!compact && activity.notes && (
          <p className="text-xs text-slate-400 italic leading-relaxed">
            {truncate(activity.notes, 80)}
          </p>
        )}
      </div>
    </article>
  )
}

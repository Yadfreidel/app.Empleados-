// components/ui/EmptyState.tsx
import { Calendar, Inbox, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--fm-green-50)', color: 'var(--fm-green-600)' }}
      >
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-600 text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}

export function EmptyCalendarDay() {
  return (
    <EmptyState
      icon={Calendar}
      title="Sin actividades"
      description="No hay trabajos programados para este día."
    />
  )
}

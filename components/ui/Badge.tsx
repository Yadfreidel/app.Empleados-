'use client'
// components/ui/Badge.tsx
import { cn } from '@/lib/utils'
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils'
import type { ActivityStatus, ActivityPriority } from '@/types'

interface BadgeProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Badge({ children, className, style }: BadgeProps) {
  return (
    <span className={cn('fm-badge', className)} style={style}>
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: ActivityStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status]
  return (
    <Badge
      className={className}
      style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}

interface PriorityBadgeProps {
  priority: ActivityPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colors = PRIORITY_COLORS[priority]
  return (
    <Badge
      className={className}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}

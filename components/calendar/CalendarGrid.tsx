'use client'
// components/calendar/CalendarGrid.tsx
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, format, addMonths, subMonths
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useState, useCallback } from 'react'
import type { Activity } from '@/types'
import { cn, capitalize } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface CalendarGridProps {
  activities: Activity[]
  onDaySelect: (date: Date) => void
  selectedDate: Date | null
  loading?: boolean
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function CalendarGrid({
  activities,
  onDaySelect,
  selectedDate,
  loading,
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const prevMonth = useCallback(() => setCurrentMonth(m => subMonths(m, 1)), [])
  const nextMonth = useCallback(() => setCurrentMonth(m => addMonths(m, 1)), [])
  const goToday   = useCallback(() => setCurrentMonth(new Date()), [])

  // Build days grid (6 weeks)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd   = endOfMonth(currentMonth)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd    = endOfWeek(monthEnd,   { weekStartsOn: 0 })
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // Index activities by date string
  const activityMap = new Map<string, Activity[]>()
  activities.forEach(act => {
    const key = act.date // YYYY-MM-DD
    if (!activityMap.has(key)) activityMap.set(key, [])
    activityMap.get(key)!.push(act)
  })

  function getDotsForDay(date: Date): { color: string; id: string }[] {
    const key = format(date, 'yyyy-MM-dd')
    const acts = activityMap.get(key) || []
    // Unique colors, max 3 dots
    const uniqueColors = [...new Set(acts.map(a =>
      a.color_override || a.operation_type?.color || '#16a34a'
    ))].slice(0, 3)
    return uniqueColors.map((color, i) => ({ color, id: `${key}-${i}` }))
  }

  return (
    <div className="fm-card overflow-hidden">
      {/* ── Calendar Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Button
            id="btn-prev-month"
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} />
          </Button>
          <h2
            className="font-700 text-slate-900 min-w-[11rem] text-center text-base md:text-lg capitalize"
            aria-live="polite"
          >
            {capitalize(format(currentMonth, 'MMMM yyyy', { locale: es }))}
          </h2>
          <Button
            id="btn-next-month"
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
        <Button
          id="btn-today"
          variant="outline"
          size="sm"
          leftIcon={<CalendarDays size={14} />}
          onClick={goToday}
        >
          Hoy
        </Button>
      </div>

      {/* ── Weekday labels ── */}
      <div
        className="grid grid-cols-7 text-center"
        style={{ borderBottom: '1px solid var(--color-border)', padding: '0.5rem 0.75rem 0.25rem' }}
      >
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-xs font-600 uppercase tracking-wide py-1"
            style={{ color: 'var(--color-text-faint)' }}
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── Days grid ── */}
      <div className="grid grid-cols-7 p-2 gap-0.5" aria-label="Calendario de actividades">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const dayIsToday     = isToday(day)
          const isSelected     = selectedDate ? isSameDay(day, selectedDate) : false
          const dots           = getDotsForDay(day)
          const hasActivities  = dots.length > 0
          const dateKey        = format(day, 'yyyy-MM-dd')

          return (
            <button
              key={dateKey}
              id={`calendar-day-${dateKey}`}
              onClick={() => onDaySelect(day)}
              aria-label={`${format(day, 'EEEE d MMMM', { locale: es })}${hasActivities ? `, ${activityMap.get(dateKey)?.length} actividad(es)` : ''}`}
              aria-pressed={isSelected}
              className={cn(
                'relative flex flex-col items-center justify-start rounded-fm transition-all duration-150',
                'min-h-[3.25rem] md:min-h-[4rem] pt-1.5 pb-1.5 px-0.5 cursor-pointer border',
                isSelected
                  ? 'border-fm-green-500 bg-fm-green-800 shadow-fm'
                  : hasActivities && isCurrentMonth
                    ? 'border-slate-200 bg-white hover:border-fm-green-300 hover:bg-fm-green-50'
                    : 'border-transparent bg-transparent hover:bg-slate-50',
                !isCurrentMonth && 'opacity-35',
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-full text-sm font-600 leading-none transition-colors',
                  isSelected
                    ? 'text-white'
                    : dayIsToday
                      ? 'bg-fm-green-100 text-fm-green-800 font-700'
                      : isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Activity dots */}
              {hasActivities && (
                <div className="flex items-center gap-0.5 mt-1" aria-hidden="true">
                  {dots.map(dot => (
                    <span
                      key={dot.id}
                      className="fm-day-dot"
                      style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : dot.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

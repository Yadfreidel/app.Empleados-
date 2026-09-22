'use client'
// components/calendar/CalendarFilters.tsx
import { Filter, X } from 'lucide-react'
import type { Hotel, OperationType, FilterState, ActivityStatus, ActivityPriority } from '@/types'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface CalendarFiltersProps {
  hotels: Hotel[]
  operationTypes: OperationType[]
  filters: FilterState
  onChange: (filters: FilterState) => void
}

const STATUSES: ActivityStatus[] = ['programado', 'en_progreso', 'completado', 'cancelado', 'postpuesto']
const PRIORITIES: ActivityPriority[] = ['baja', 'normal', 'alta', 'urgente']

export default function CalendarFilters({
  hotels,
  operationTypes,
  filters,
  onChange,
}: CalendarFiltersProps) {
  const hasFilters = Object.values(filters).some(v => v !== null)

  function update(key: keyof FilterState, value: string | null) {
    onChange({ ...filters, [key]: value })
  }

  function reset() {
    onChange({ hotel_id: null, operation_type_id: null, status: null, priority: null })
  }

  return (
    <div className="fm-card p-3 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-600 text-slate-500 flex-shrink-0">
        <Filter size={13} />
        Filtros
      </span>

      {/* Hotel */}
      <select
        id="filter-hotel"
        className="fm-input !py-1.5 !text-sm !w-auto flex-1 min-w-[120px]"
        value={filters.hotel_id || ''}
        onChange={e => update('hotel_id', e.target.value || null)}
        aria-label="Filtrar por hotel"
      >
        <option value="">Todos los hoteles</option>
        {hotels.filter(h => h.active).map(h => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </select>

      {/* Operation type */}
      <select
        id="filter-operation-type"
        className="fm-input !py-1.5 !text-sm !w-auto flex-1 min-w-[140px]"
        value={filters.operation_type_id || ''}
        onChange={e => update('operation_type_id', e.target.value || null)}
        aria-label="Filtrar por tipo de operación"
      >
        <option value="">Todos los tipos</option>
        {operationTypes.filter(o => o.active).map(o => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>

      {/* Status */}
      <select
        id="filter-status"
        className="fm-input !py-1.5 !text-sm !w-auto flex-1 min-w-[130px]"
        value={filters.status || ''}
        onChange={e => update('status', e.target.value || null)}
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los estados</option>
        {STATUSES.map(s => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Priority */}
      <select
        id="filter-priority"
        className="fm-input !py-1.5 !text-sm !w-auto flex-1 min-w-[120px]"
        value={filters.priority || ''}
        onChange={e => update('priority', e.target.value || null)}
        aria-label="Filtrar por prioridad"
      >
        <option value="">Todas las prioridades</option>
        {PRIORITIES.map(p => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <Button
          id="btn-clear-filters"
          variant="ghost"
          size="sm"
          leftIcon={<X size={13} />}
          onClick={reset}
          className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          Limpiar
        </Button>
      )}
    </div>
  )
}

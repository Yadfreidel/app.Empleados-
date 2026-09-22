// components/calendar/Legend.tsx
import type { OperationType } from '@/types'

interface LegendProps {
  operationTypes: OperationType[]
}

export default function Legend({ operationTypes }: LegendProps) {
  const active = operationTypes.filter(o => o.active)
  if (active.length === 0) return null

  return (
    <div className="fm-card px-4 py-3">
      <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Tipos de operación</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {active.map(op => (
          <div key={op.id} className="flex items-center gap-2 text-xs text-slate-700">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: op.color }}
              aria-hidden="true"
            />
            {op.name}
          </div>
        ))}
      </div>
    </div>
  )
}

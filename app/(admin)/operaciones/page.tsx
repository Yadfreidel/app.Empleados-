// app/(admin)/operaciones/page.tsx
import type { Metadata } from 'next'
import { Tag, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Tipos de Operación' }

export default function OperacionesPage() {
  return (
    <div className="space-y-6 fm-animate-fadein">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-800 text-slate-900">Tipos de Operación</h1>
          <p className="text-sm text-slate-500 mt-0.5">Catálogo de operaciones con colores e íconos</p>
        </div>
        <button
          id="btn-add-operation"
          className="fm-btn fm-btn-primary fm-btn-md"
          disabled
          title="Disponible tras conectar Supabase"
        >
          <Plus size={16} />
          Nuevo tipo
        </button>
      </div>

      {/* Preview de tipos de demostración */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { name: 'Fumigación',  color: '#15803d', desc: 'Servicio programado en un hotel.' },
          { name: 'Inspección',  color: '#2563eb', desc: 'Revisión o seguimiento.' },
          { name: 'Retiro',      color: '#0891b2', desc: 'Retiro de equipos o materiales.' },
          { name: 'Aplicación',  color: '#7c3aed', desc: 'Aplicación de producto o tratamiento.' },
          { name: 'Monitoreo',   color: '#d97706', desc: 'Revisión de estaciones de control.' },
          { name: 'Entrega',     color: '#be185d', desc: 'Entrega de materiales o suministros.' },
        ].map(op => (
          <div key={op.name} className="fm-card p-4 flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-fm flex-shrink-0 flex items-center justify-center"
              style={{ background: op.color }}
            >
              <Tag size={16} color="white" />
            </div>
            <div>
              <div className="text-sm font-700 text-slate-900">{op.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{op.desc}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-3 h-3 rounded-full" style={{ background: op.color }} />
                <span className="text-xs font-mono text-slate-400">{op.color}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-slate-400">
        Estos tipos son de ejemplo. Conecta Supabase para gestionarlos desde la base de datos.
      </p>
    </div>
  )
}

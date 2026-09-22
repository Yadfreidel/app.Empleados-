// app/(admin)/actividades/page.tsx
import type { Metadata } from 'next'
import { Activity, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Actividades' }

export default function ActividadesPage() {
  return (
    <div className="space-y-6 fm-animate-fadein">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-800 text-slate-900">Actividades</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona todos los trabajos programados</p>
        </div>
        <button
          id="btn-add-activity"
          className="fm-btn fm-btn-primary fm-btn-md"
          disabled
          title="Disponible tras conectar Supabase"
        >
          <Plus size={16} />
          Nueva actividad
        </button>
      </div>

      {/* Placeholder */}
      <div className="fm-card p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--fm-green-50)', color: 'var(--fm-green-600)' }}>
          <Activity size={26} strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-700 text-slate-800 mb-2">Listado de actividades</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Conecta Supabase para ver, filtrar, crear, editar y eliminar actividades programadas.
        </p>
      </div>
    </div>
  )
}

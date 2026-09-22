// app/(admin)/hoteles/page.tsx
import type { Metadata } from 'next'
import { Building2, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Hoteles' }

export default function HotelesPage() {
  return (
    <div className="space-y-6 fm-animate-fadein">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-800 text-slate-900">Hoteles</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona los hoteles de F&amp;M Fumigación</p>
        </div>
        <button
          id="btn-add-hotel"
          className="fm-btn fm-btn-primary fm-btn-md"
          disabled
          title="Disponible tras conectar Supabase"
        >
          <Plus size={16} />
          Nuevo hotel
        </button>
      </div>

      {/* Placeholder */}
      <div className="fm-card p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--fm-green-50)', color: 'var(--fm-green-600)' }}>
          <Building2 size={26} strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-700 text-slate-800 mb-2">Lista de hoteles</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Conecta Supabase para ver y gestionar los hoteles registrados.
        </p>
      </div>
    </div>
  )
}

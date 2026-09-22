'use client'
// app/page.tsx — Página principal: Calendario público de F&M
import { useState, useEffect, useCallback } from 'react'
import { format, isSameDay } from 'date-fns'
import type { Activity, Hotel, OperationType, FilterState } from '@/types'
import Header from '@/components/layout/Header'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import DayPanel from '@/components/calendar/DayPanel'
import CalendarFilters from '@/components/calendar/CalendarFilters'
import Legend from '@/components/calendar/Legend'
import { CalendarSkeleton } from '@/components/ui/Skeleton'

// ─── Demo data (se eliminará cuando Supabase esté conectado) ──────
const DEMO_OPERATION_TYPES: OperationType[] = [
  { id: '1', name: 'Fumigación',  color: '#15803d', icon: 'spray-can', description: '', active: true, created_at: '' },
  { id: '2', name: 'Inspección',  color: '#2563eb', icon: 'search',    description: '', active: true, created_at: '' },
  { id: '3', name: 'Monitoreo',   color: '#d97706', icon: 'eye',       description: '', active: true, created_at: '' },
  { id: '4', name: 'Aplicación',  color: '#7c3aed', icon: 'droplet',   description: '', active: true, created_at: '' },
  { id: '5', name: 'Retiro',      color: '#0891b2', icon: 'package',   description: '', active: true, created_at: '' },
  { id: '6', name: 'Entrega',     color: '#be185d', icon: 'truck',     description: '', active: true, created_at: '' },
]

const DEMO_HOTELS: Hotel[] = [
  { id: 'h1', name: 'Hotel Caribe',   location: 'Zona Norte', code: 'CAR', active: true, notes: null, created_at: '' },
  { id: 'h2', name: 'Hotel Palma',    location: 'Centro',     code: 'PAL', active: true, notes: null, created_at: '' },
  { id: 'h3', name: 'Hotel Bahía',    location: 'Zona Sur',   code: 'BAH', active: true, notes: null, created_at: '' },
]

function buildDemoActivities(): Activity[] {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = (n: number) => `${y}-${m}-${String(n).padStart(2, '0')}`

  return [
    {
      id: 'a1', title: 'Fumigación general área cocina',
      description: 'Aplicación de insecticida en área de cocinas y almacén de alimentos.',
      date: d(today.getDate()), start_time: '08:00', end_time: '10:00',
      hotel_id: 'h1', operation_type_id: '1',
      status: 'programado', priority: 'alta', color_override: null, published: true,
      notes: 'Solicitar acceso anticipado a jefatura de cocina.',
      created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[0], operation_type: DEMO_OPERATION_TYPES[0],
    },
    {
      id: 'a2', title: 'Inspección preventiva piso 3',
      description: 'Revisión de estaciones de monitoreo en habitaciones del tercer piso.',
      date: d(today.getDate()), start_time: '11:00', end_time: null,
      hotel_id: 'h2', operation_type_id: '2',
      status: 'programado', priority: 'normal', color_override: null, published: true,
      notes: null, created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[1], operation_type: DEMO_OPERATION_TYPES[1],
    },
    {
      id: 'a3', title: 'Monitoreo de estaciones zona jardín',
      description: 'Revisión mensual de cebaderos y trampas.',
      date: d(today.getDate() + 1), start_time: '09:00', end_time: '11:00',
      hotel_id: 'h3', operation_type_id: '3',
      status: 'programado', priority: 'baja', color_override: null, published: true,
      notes: null, created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[2], operation_type: DEMO_OPERATION_TYPES[2],
    },
    {
      id: 'a4', title: 'Aplicación gel cucarachas',
      description: 'Tratamiento con gel en área de bar y restaurante.',
      date: d(today.getDate() + 3), start_time: '07:00', end_time: '09:00',
      hotel_id: 'h1', operation_type_id: '4',
      status: 'programado', priority: 'alta', color_override: null, published: true,
      notes: 'Servicio antes de apertura del restaurante.',
      created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[0], operation_type: DEMO_OPERATION_TYPES[3],
    },
    {
      id: 'a5', title: 'Retiro de equipos trampa',
      date: d(today.getDate() + 5), start_time: '14:00', end_time: null,
      description: 'Retiro de trampas para revisión y mantenimiento.',
      hotel_id: 'h2', operation_type_id: '5',
      status: 'programado', priority: 'normal', color_override: null, published: true,
      notes: null, created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[1], operation_type: DEMO_OPERATION_TYPES[4],
    },
    {
      id: 'a6', title: 'Entrega de productos Hotel Bahía',
      date: d(today.getDate() + 5), start_time: '16:00', end_time: null,
      description: 'Entrega de stock mensual de productos.',
      hotel_id: 'h3', operation_type_id: '6',
      status: 'programado', priority: 'normal', color_override: null, published: true,
      notes: null, created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[2], operation_type: DEMO_OPERATION_TYPES[5],
    },
    {
      id: 'a7', title: 'Fumigación área piscina',
      date: d(today.getDate() + 7), start_time: '06:30', end_time: '08:00',
      description: 'Tratamiento preventivo en área de piscinas y jardines.',
      hotel_id: 'h3', operation_type_id: '1',
      status: 'programado', priority: 'urgente', color_override: null, published: true,
      notes: 'Autorizado por gerencia. Área cerrada al público 6:00-8:30.',
      created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[2], operation_type: DEMO_OPERATION_TYPES[0],
    },
    {
      id: 'a8', title: 'Inspección post-tratamiento',
      date: d(today.getDate() - 2), start_time: '10:00', end_time: '12:00',
      description: 'Verificación de efectividad del tratamiento anterior.',
      hotel_id: 'h1', operation_type_id: '2',
      status: 'completado', priority: 'normal', color_override: null, published: true,
      notes: null, created_at: '', updated_at: '',
      hotel: DEMO_HOTELS[0], operation_type: DEMO_OPERATION_TYPES[1],
    },
  ]
}

export default function CalendarPage() {
  const [allActivities] = useState<Activity[]>(() => buildDemoActivities())
  const [hotels]           = useState<Hotel[]>(DEMO_HOTELS)
  const [operationTypes]   = useState<OperationType[]>(DEMO_OPERATION_TYPES)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [filters, setFilters] = useState<FilterState>({
    hotel_id: null, operation_type_id: null, status: null, priority: null,
  })
  const [loading] = useState(false)

  // Filter activities
  const filteredActivities = allActivities.filter(act => {
    if (filters.hotel_id && act.hotel_id !== filters.hotel_id) return false
    if (filters.operation_type_id && act.operation_type_id !== filters.operation_type_id) return false
    if (filters.status && act.status !== filters.status) return false
    if (filters.priority && act.priority !== filters.priority) return false
    return act.published
  })

  // Activities for selected day
  const dayActivities = selectedDate
    ? filteredActivities.filter(act => act.date === format(selectedDate, 'yyyy-MM-dd'))
    : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 fm-container py-6">
        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-xl md:text-2xl font-800 text-slate-900 leading-tight">
            Calendario Operativo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Trabajos programados de F&amp;M Fumigación en todos los hoteles
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <CalendarFilters
            hotels={hotels}
            operationTypes={operationTypes}
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {/* Main layout: Calendar + Day panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
          {/* Calendar */}
          <div className="space-y-4">
            {loading ? (
              <CalendarSkeleton />
            ) : (
              <CalendarGrid
                activities={filteredActivities}
                selectedDate={selectedDate}
                onDaySelect={date => setSelectedDate(
                  prev => (prev && isSameDay(prev, date)) ? null : date
                )}
                loading={loading}
              />
            )}
            {/* Legend */}
            <Legend operationTypes={operationTypes} />
          </div>

          {/* Day panel */}
          {selectedDate && (
            <div className="lg:sticky lg:top-20">
              <DayPanel
                date={selectedDate}
                activities={dayActivities}
                loading={loading}
                onClose={() => setSelectedDate(null)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-5 text-xs"
        style={{ color: 'var(--color-text-faint)', borderTop: '1px solid var(--color-border)' }}
      >
        © {new Date().getFullYear()} F&amp;M Fumigación — Sistema de gestión operativa
      </footer>
    </div>
  )
}

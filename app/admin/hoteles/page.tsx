'use client'
// app/(admin)/hoteles/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Building2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import type { Metadata } from 'next'
import type { Hotel, HotelFormData } from '@/types'
import type { LucideIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { ReactNode } from 'react'
import { hotelSchema } from '@/lib/validations'

// ── Form ──────────────────────────────────────────────────────────────────────
const EMPTY_FORM: HotelFormData = {
  name: '', location: '', code: '', active: true, notes: '',
}

function HotelForm({
  value, onChange, error,
}: {
  value: HotelFormData
  onChange: (v: HotelFormData) => void
  error?: string | null
}) {
  const set = (key: keyof HotelFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: e.target.value })

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-fm text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      <div>
        <label className="fm-label">Nombre <span className="text-red-500">*</span></label>
        <input className="fm-input" value={value.name} onChange={set('name')} placeholder="Hotel Paraíso" maxLength={100} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fm-label">Código</label>
          <input className="fm-input" value={value.code} onChange={set('code')} placeholder="HTL-01" maxLength={20} />
        </div>
        <div>
          <label className="fm-label">Ubicación</label>
          <input className="fm-input" value={value.location} onChange={set('location')} placeholder="Ciudad, Zona" maxLength={200} />
        </div>
      </div>
      <div>
        <label className="fm-label">Notas</label>
        <textarea className="fm-input resize-none" rows={3} value={value.notes} onChange={set('notes')} maxLength={500} />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...value, active: !value.active })}
          className="flex items-center gap-2 text-sm font-500 transition-colors"
          style={{ color: value.active ? 'var(--fm-green-700)' : 'var(--color-text-faint)' }}
        >
          {value.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          {value.active ? 'Activo' : 'Inactivo'}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HotelesPage() {
  const [hotels, setHotels]       = useState<Hotel[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Hotel | null>(null)
  const [form, setForm]           = useState<HotelFormData>(EMPTY_FORM)
  const [formErr, setFormErr]     = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Hotel | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('name')
      if (error) throw error
      setHotels(data ?? [])
    } catch (e: unknown) {
      console.error('Error cargando hoteles:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormErr(null)
    setModalOpen(true)
  }

  function openEdit(h: Hotel) {
    setEditing(h)
    setForm({ name: h.name, location: h.location ?? '', code: h.code ?? '', active: h.active, notes: h.notes ?? '' })
    setFormErr(null)
    setModalOpen(true)
  }

  async function handleSave() {
    const result = hotelSchema.safeParse(form)
    if (!result.success) {
      setFormErr(result.error.issues[0].message)
      return
    }
    setSaving(true)
    setFormErr(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const payload = {
        name:     result.data.name,
        location: result.data.location || null,
        code:     result.data.code || null,
        active:   result.data.active,
        notes:    result.data.notes || null,
      }
      if (editing) {
        const { error } = await supabase.from('hotels').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('hotels').insert(payload)
        if (error) throw error
      }
      setModalOpen(false)
      await load()
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.from('hotels').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      await load()
    } catch (e: unknown) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = hotels.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.code ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (h.location ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 fm-animate-fadein">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-800 text-slate-900">Hoteles</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona los hoteles de F&amp;M Fumigación</p>
        </div>
        <Button id="btn-add-hotel" leftIcon={<Plus size={16} />} onClick={openCreate}>
          Nuevo hotel
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="fm-input pl-9"
          placeholder="Buscar hotel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-fm-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? 'Sin resultados' : 'No hay hoteles'}
          description={search ? 'Intenta con otra búsqueda.' : 'Crea el primer hotel usando el botón superior.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(h => (
            <div
              key={h.id}
              className="fm-card flex items-center gap-4 px-5 py-4"
            >
              <div
                className="w-10 h-10 rounded-fm flex items-center justify-center flex-shrink-0"
                style={{ background: h.active ? 'var(--fm-green-50)' : 'var(--color-surface-raised)', color: h.active ? 'var(--fm-green-700)' : 'var(--color-text-faint)' }}
              >
                <Building2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-700 text-slate-900 truncate">{h.name}</span>
                  {h.code && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-faint)' }}>
                      {h.code}
                    </span>
                  )}
                  {!h.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                      Inactivo
                    </span>
                  )}
                </div>
                {h.location && <p className="text-xs text-slate-500 mt-0.5 truncate">{h.location}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  id={`btn-edit-hotel-${h.id}`}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(h)}
                  aria-label="Editar"
                >
                  <Pencil size={15} />
                </Button>
                <Button
                  id={`btn-delete-hotel-${h.id}`}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(h)}
                  aria-label="Eliminar"
                  style={{ color: '#dc2626' }}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Editar hotel' : 'Nuevo hotel'}
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Guardar cambios' : 'Crear hotel'}</Button>
          </>
        }
      >
        <HotelForm value={form} onChange={setForm} error={formErr} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar hotel"
        message={`¿Estás seguro que deseas eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer. Las actividades asociadas no se podrán eliminar si existen.`}
        confirmLabel="Eliminar"
      />
    </div>
  )
}

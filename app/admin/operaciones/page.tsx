'use client'
// app/(admin)/operaciones/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { OperationType, OperationTypeFormData } from '@/types'
import Button from '@/components/ui/Button'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { operationTypeSchema } from '@/lib/validations'
import { getContrastText, formatSupabaseError } from '@/lib/utils'

const EMPTY_FORM: OperationTypeFormData = {
  name: '', description: '', color: '#15803d', icon: '', active: true,
}

const PRESET_COLORS = [
  '#15803d','#2563eb','#0891b2','#7c3aed','#d97706','#be185d',
  '#dc2626','#ea580c','#64748b','#0f172a',
]

function OpTypeForm({
  value, onChange, error,
}: {
  value: OperationTypeFormData
  onChange: (v: OperationTypeFormData) => void
  error?: string | null
}) {
  const set = (key: keyof OperationTypeFormData) =>
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
        <input className="fm-input" value={value.name} onChange={set('name')} placeholder="Fumigación" maxLength={80} required />
      </div>
      <div>
        <label className="fm-label">Descripción</label>
        <textarea className="fm-input resize-none" rows={2} value={value.description} onChange={set('description')} maxLength={300} />
      </div>
      <div>
        <label className="fm-label">Color <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-3 flex-wrap mt-1">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...value, color: c })}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c,
                borderColor: value.color === c ? '#0f172a' : 'transparent',
                boxShadow: value.color === c ? '0 0 0 2px white, 0 0 0 4px #0f172a' : 'none',
              }}
              aria-label={c}
            />
          ))}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.color}
              onChange={e => onChange({ ...value, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
              title="Color personalizado"
            />
            <span className="text-xs font-mono text-slate-500">{value.color}</span>
          </div>
        </div>
        {/* Preview */}
        <div
          className="mt-3 px-4 py-2.5 rounded-fm inline-flex items-center gap-2 text-sm font-600"
          style={{ background: value.color, color: getContrastText(value.color) }}
        >
          <Tag size={14} />
          {value.name || 'Vista previa'}
        </div>
      </div>
      <div>
        <label className="fm-label">Ícono (nombre Lucide)</label>
        <input className="fm-input" value={value.icon} onChange={set('icon')} placeholder="spray-can" maxLength={50} />
        <p className="text-xs text-slate-400 mt-1">Opcional. Referencia: lucide.dev</p>
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

export default function OperacionesPage() {
  const [types, setTypes]         = useState<OperationType[]>([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<OperationType | null>(null)
  const [form, setForm]           = useState<OperationTypeFormData>(EMPTY_FORM)
  const [formErr, setFormErr]     = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OperationType | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('operation_types')
        .select('*')
        .order('name')
      if (error) throw error
      setTypes(data ?? [])
    } catch (e) {
      console.error(e)
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

  function openEdit(t: OperationType) {
    setEditing(t)
    setForm({ name: t.name, description: t.description ?? '', color: t.color, icon: t.icon ?? '', active: t.active })
    setFormErr(null)
    setModalOpen(true)
  }

  async function handleSave() {
    const result = operationTypeSchema.safeParse(form)
    if (!result.success) { setFormErr(result.error.issues[0].message); return }
    setSaving(true); setFormErr(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const payload = {
        name:        result.data.name,
        description: result.data.description || null,
        color:       result.data.color,
        icon:        result.data.icon || null,
        active:      result.data.active,
      }
      if (editing) {
        const { error } = await supabase.from('operation_types').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('operation_types').insert(payload)
        if (error) throw error
      }
      setModalOpen(false)
      await load()
    } catch (e: unknown) {
      setFormErr(formatSupabaseError(e, 'Error al guardar el tipo de operación'))
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
      const { error } = await supabase.from('operation_types').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      await load()
    } catch (e) {
      console.error(e)
      alert(formatSupabaseError(e, 'Error al eliminar el tipo de operación'))
    } finally { setDeleting(false) }
  }

  return (
    <div className="space-y-6 fm-animate-fadein">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-800 text-slate-900">Tipos de Operación</h1>
          <p className="text-sm text-slate-500 mt-0.5">Catálogo de operaciones con colores e íconos</p>
        </div>
        <Button id="btn-add-operation" leftIcon={<Plus size={16} />} onClick={openCreate}>
          Nuevo tipo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-fm-lg" />)}
        </div>
      ) : types.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No hay tipos de operación"
          description="Crea el primer tipo usando el botón superior."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {types.map(t => (
            <div key={t.id} className="fm-card p-4 flex items-start gap-3 group">
              <div
                className="w-10 h-10 rounded-fm flex-shrink-0 flex items-center justify-center"
                style={{ background: t.color }}
              >
                <Tag size={16} color={getContrastText(t.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-700 text-slate-900 truncate">{t.name}</span>
                  {!t.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                      Inactivo
                    </span>
                  )}
                </div>
                {t.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.description}</p>}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  <span className="text-xs font-mono text-slate-400">{t.color}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  id={`btn-edit-op-${t.id}`}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(t)}
                  aria-label="Editar"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  id={`btn-delete-op-${t.id}`}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(t)}
                  aria-label="Eliminar"
                  style={{ color: '#dc2626' }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Editar tipo de operación' : 'Nuevo tipo de operación'}
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Guardar cambios' : 'Crear tipo'}</Button>
          </>
        }
      >
        <OpTypeForm value={form} onChange={setForm} error={formErr} />
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar tipo de operación"
        message={`¿Eliminar "${deleteTarget?.name}"? Las actividades que lo usan quedarán sin tipo si se elimina. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </div>
  )
}

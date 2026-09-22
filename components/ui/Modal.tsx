'use client'
// components/ui/Modal.tsx
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  footer?: ReactNode
}

const maxWidths = {
  sm:  'max-w-sm',
  md:  'max-w-md',
  lg:  'max-w-lg',
  xl:  'max-w-xl',
  '2xl': 'max-w-2xl',
}

export default function Modal({ open, onClose, title, children, maxWidth = 'md', footer }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fm-backdrop" onClick={onClose} aria-hidden="true" />
      {/* Modal */}
      <div className="fm-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={`fm-modal-content w-full ${maxWidths[maxWidth]}`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 id="modal-title" className="text-lg font-700 text-slate-900">{title}</h2>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Cerrar">
                <X size={18} />
              </Button>
            </div>
          )}
          {/* Body */}
          <div className="px-6 py-5">
            {children}
          </div>
          {/* Footer */}
          {footer && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Confirm dialog
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', loading
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
    </Modal>
  )
}

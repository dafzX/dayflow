import { X } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand',
    secondary: 'border border-line bg-white text-ink hover:bg-canvas focus-visible:ring-accent',
    ghost: 'text-muted hover:bg-canvas hover:text-ink focus-visible:ring-accent',
    danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${size === 'sm' ? 'min-h-9 px-3 text-xs' : 'min-h-10 px-4 text-sm'} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-white shadow-card ${className}`}>{children}</section>
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">DAYFLOW <span className="px-1 text-line">/</span> Ruang kerja</p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-[28px]">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section aria-labelledby="modal-title" aria-modal="true" className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6" role="dialog">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink" id="modal-title">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button aria-label="Close dialog" className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-ink">{label}</span>{children}</label>
}

export function FormActions({ onCancel, submitLabel = 'Simpan perubahan', disabled = false }: { onCancel: () => void; submitLabel?: string; disabled?: boolean }) {
  return <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4"><Button disabled={disabled} onClick={onCancel} type="button" variant="secondary">Batal</Button><Button disabled={disabled} type="submit">{submitLabel}</Button></div>
}

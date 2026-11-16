import { useState, type FormEvent } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../../types'
import { Button, Field, FormActions, Modal } from '../ui'
import { inputClass } from '../ui/styles'
import { categoryLabel, taskPriorityLabel, taskStatusLabel } from '../../lib/locale'

const blankTask: Omit<Task, 'id'> = {
  title: '',
  description: '',
  dueDate: new Date().toISOString().slice(0, 10),
  priority: 'Medium',
  status: 'To Do',
  category: 'Work',
}

export function TaskDialog({ task, initialDate, onClose, onSave, submitting = false, error }: {
  task?: Task
  initialDate?: string
  onClose: () => void
  onSave: (task: Omit<Task, 'id'>) => void | Promise<void>
  submitting?: boolean
  error?: string
}) {
  const [values, setValues] = useState<Omit<Task, 'id'>>(task ? {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    category: task.category,
    completedAt: task.completedAt,
  } : { ...blankTask, dueDate: initialDate ?? blankTask.dueDate })
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.title.trim() || !values.dueDate) return
    onSave({ ...values, title: values.title.trim() })
  }
  return (
    <Modal title={task ? 'Ubah tugas' : 'Buat tugas'} description="Tentukan langkah berikutnya dengan jelas." onClose={onClose}>
      <form onSubmit={submit}>
        <div className="space-y-4">
          <Field label="Nama tugas">
            <input autoFocus className={inputClass} maxLength={100} onChange={(event) => update('title', event.target.value)} placeholder="Apa yang perlu diselesaikan?" required value={values.title} />
          </Field>
          <Field label="Deskripsi">
            <textarea className={`${inputClass} min-h-20 py-2`} onChange={(event) => update('description', event.target.value)} placeholder="Tambahkan beberapa detail..." rows={3} value={values.description} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tenggat"><input className={inputClass} onChange={(event) => update('dueDate', event.target.value)} required type="date" value={values.dueDate} /></Field>
            <Field label="Kategori"><select className={inputClass} onChange={(event) => update('category', event.target.value)} value={values.category}>{['Work', 'Personal', 'Health', 'Learning', 'Other'].map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}</select></Field>
            <Field label="Prioritas"><select className={inputClass} onChange={(event) => update('priority', event.target.value)} value={values.priority}>{(['Low', 'Medium', 'High'] as TaskPriority[]).map((item) => <option key={item} value={item}>{taskPriorityLabel(item)}</option>)}</select></Field>
            <Field label="Status"><select className={inputClass} onChange={(event) => update('status', event.target.value)} value={values.status}>{(['To Do', 'In Progress', 'Completed'] as TaskStatus[]).map((item) => <option key={item} value={item}>{taskStatusLabel(item)}</option>)}</select></Field>
          </div>
        </div>
        {error && <p role="alert" className="mt-4 text-xs text-danger">{error}</p>}
        <FormActions disabled={submitting} onCancel={onClose} submitLabel={submitting ? 'Menyimpan…' : task ? 'Simpan tugas' : 'Buat tugas'} />
      </form>
    </Modal>
  )
}

export function TaskQuickAdd({ onClick }: { onClick: () => void }) {
  return <Button onClick={onClick} type="button">+ Tambah tugas</Button>
}

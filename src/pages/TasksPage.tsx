import { CalendarDays, Check, Circle, LayoutGrid, List, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TaskDialog } from '../components/tasks/TaskDialog'
import { Button, Card, PageHeader } from '../components/ui'
import { inputClass } from '../components/ui/styles'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../contexts/AppDataContext'
import { formatLocalized } from '../lib/format'
import { categoryLabel, taskPriorityLabel, taskStatusLabel } from '../lib/locale'
import { deleteTask, saveTask } from '../services/tasks'
import type { Task, TaskPriority, TaskStatus } from '../types'

const priorities: TaskPriority[] = ['Low', 'Medium', 'High']
const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed']
const priorityStyle: Record<TaskPriority, string> = {
  Low: 'bg-canvas text-muted',
  Medium: 'bg-[#fbf4e7] text-[#a6782c]',
  High: 'bg-[#fbefed] text-danger',
}

export function TasksPage() {
  const { tasks, refreshData } = useAppData()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Task | undefined>()
  const [view, setView] = useState<'list' | 'board'>('list')
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [statusFilter, setStatusFilter] = useState('All status')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [sortBy, setSortBy] = useState('Due date')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const filtered = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description} ${task.category} ${categoryLabel(task.category)}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (statusFilter === 'All status' || task.status === statusFilter) && (priorityFilter === 'All priorities' || task.priority === priorityFilter)
  }).sort((a, b) => sortBy === 'Priority'
    ? priorities.indexOf(b.priority) - priorities.indexOf(a.priority) || a.dueDate.localeCompare(b.dueDate)
    : a.dueDate.localeCompare(b.dueDate)), [tasks, query, statusFilter, priorityFilter, sortBy])

  const openNew = () => { setEditing(undefined); setDialogOpen(true) }
  const save = async (task: Omit<Task, 'id'>) => {
    if (!user) { setActionError('Masuk untuk menyimpan tugas.'); return }
    setSaving(true)
    setActionError('')
    try {
      await saveTask(user.id, editing?.id, task)
      await refreshData()
      setDialogOpen(false)
      setEditing(undefined)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Tugas tidak dapat disimpan.')
    } finally {
      setSaving(false)
    }
  }
  const toggleComplete = async (task: Task) => {
    if (!user) { setActionError('Masuk untuk memperbarui tugas.'); return }
    setActionError('')
    try {
      await saveTask(user.id, task.id, { ...task, status: task.status === 'Completed' ? 'To Do' : 'Completed' })
      await refreshData()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Tugas tidak dapat diperbarui.')
    }
  }
  const remove = async (task: Task) => {
    if (!window.confirm(`Hapus tugas “${task.title}”?`)) return
    if (!user) { setActionError('Masuk untuk menghapus tugas.'); return }
    setActionError('')
    try {
      await deleteTask(user.id, task.id)
      await refreshData()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Tugas tidak dapat dihapus.')
    }
  }

  return (
    <div>
      <PageHeader title="Tugas saya" description={`${tasks.length} tugas untuk membantu aktivitas Anda.`} action={<Button onClick={openNew}><Plus size={16} />Tambah tugas</Button>} />
      {actionError && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-white px-4 py-3 text-xs text-danger">{actionError}</p>}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative w-full sm:max-w-[260px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} /><input className={`${inputClass} pl-9`} onChange={(event) => setQuery(event.target.value)} placeholder="Cari tugas..." value={query} /></label>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Filter berdasarkan status" className={`${inputClass} w-auto min-w-[120px]`} onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="All status">Semua status</option>{statuses.map((status) => <option key={status} value={status}>{taskStatusLabel(status)}</option>)}</select>
            <select aria-label="Filter berdasarkan prioritas" className={`${inputClass} w-auto min-w-[130px]`} onChange={(event) => setPriorityFilter(event.target.value)} value={priorityFilter}><option value="All priorities">Semua prioritas</option>{priorities.map((priority) => <option key={priority} value={priority}>{taskPriorityLabel(priority)}</option>)}</select>
            <select aria-label="Urutkan tugas" className={`${inputClass} w-auto min-w-[120px]`} onChange={(event) => setSortBy(event.target.value)} value={sortBy}><option value="Due date">Tenggat</option><option value="Priority">Prioritas</option></select>
            <div className="flex rounded-xl border border-line p-1">
              <button aria-label="Tampilan daftar" className={`rounded-lg p-2 ${view === 'list' ? 'bg-soft text-brand' : 'text-muted hover:bg-canvas'}`} onClick={() => setView('list')} type="button"><List size={16} /></button>
              <button aria-label="Tampilan kanban" className={`rounded-lg p-2 ${view === 'board' ? 'bg-soft text-brand' : 'text-muted hover:bg-canvas'}`} onClick={() => setView('board')} type="button"><LayoutGrid size={16} /></button>
            </div>
          </div>
        </div>
        {view === 'list' ? (
          <div className="divide-y divide-line">
            {filtered.map((task) => <TaskRow key={task.id} onDelete={() => remove(task)} onEdit={() => { setEditing(task); setDialogOpen(true) }} onToggle={() => toggleComplete(task)} task={task} />)}
            {filtered.length === 0 && <div className="p-12 text-center"><p className="text-sm font-medium text-ink">Tugas tidak ditemukan</p><p className="mt-1 text-xs text-muted">Coba kata kunci lain atau tambahkan tugas baru.</p><Button className="mt-4" onClick={openNew} size="sm"><Plus size={14} />Tambah tugas</Button></div>}
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-3 sm:p-5">
            {statuses.map((status) => {
              const items = filtered.filter((task) => task.status === status)
              return <div className="min-h-64 rounded-xl bg-canvas/70 p-3" key={status}>
                <div className="mb-3 flex items-center justify-between px-1"><h3 className="text-xs font-semibold text-ink">{taskStatusLabel(status)}</h3><span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-muted">{items.length}</span></div>
                <div className="space-y-2">{items.map((task) => <div className="rounded-xl border border-line bg-white p-3" key={task.id}>
                  <div className="flex items-start gap-2"><button aria-label={task.status === 'Completed' ? 'Tandai belum selesai' : 'Tandai selesai'} className="mt-0.5 text-muted hover:text-accent" onClick={() => toggleComplete(task)} type="button">{task.status === 'Completed' ? <Check className="text-accent" size={15} /> : <Circle size={15} />}</button><p className={`flex-1 text-xs font-medium text-ink ${task.status === 'Completed' ? 'line-through opacity-60' : ''}`}>{task.title}</p><button aria-label={`Ubah ${task.title}`} className="text-muted hover:text-ink" onClick={() => { setEditing(task); setDialogOpen(true) }} type="button"><Pencil size={13} /></button></div>
                  <div className="mt-3 flex items-center justify-between"><span className={`rounded-full px-2 py-1 text-[9px] font-medium ${priorityStyle[task.priority]}`}>{taskPriorityLabel(task.priority)}</span><span className="text-[10px] text-muted">{task.dueDate ? formatLocalized(parseISO(task.dueDate), 'd MMM') : 'Tanpa tenggat'}</span></div>
                </div>)}</div>
              </div>
            })}
          </div>
        )}
      </Card>
      {dialogOpen && <TaskDialog error={actionError} onClose={() => { if (!saving) { setDialogOpen(false); setEditing(undefined); setActionError('') } }} onSave={save} submitting={saving} task={editing} />}
    </div>
  )
}

function TaskRow({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <button aria-label={task.status === 'Completed' ? 'Tandai belum selesai' : 'Tandai selesai'} className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-soft hover:text-brand" onClick={onToggle} type="button">{task.status === 'Completed' ? <span className="flex size-5 items-center justify-center rounded-full bg-accent text-white"><Check size={12} /></span> : <Circle size={18} />}</button>
      <div className="min-w-0 flex-1"><p className={`truncate text-sm font-medium ${task.status === 'Completed' ? 'text-muted line-through' : 'text-ink'}`}>{task.title}</p><p className="mt-1 truncate text-[11px] text-muted">{categoryLabel(task.category)}{task.description ? ` · ${task.description}` : ''}</p></div>
      <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-medium sm:inline-flex ${priorityStyle[task.priority]}`}>{taskPriorityLabel(task.priority)}</span>
      <span className="hidden items-center gap-1.5 text-[11px] text-muted md:flex"><CalendarDays size={13} />{task.dueDate ? formatLocalized(parseISO(task.dueDate), 'd MMM') : 'Tanpa tanggal'}</span>
      <span className={`hidden rounded-full px-2.5 py-1 text-[10px] sm:inline-flex ${task.status === 'Completed' ? 'bg-soft text-brand' : task.status === 'In Progress' ? 'bg-[#eef1f8] text-[#586c9b]' : 'bg-canvas text-muted'}`}>{taskStatusLabel(task.status)}</span>
      <div className="flex gap-0.5"><button aria-label={`Ubah ${task.title}`} className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink" onClick={onEdit} type="button"><Pencil size={14} /></button><button aria-label={`Hapus ${task.title}`} className="rounded-lg p-2 text-muted hover:bg-[#fbefed] hover:text-danger" onClick={onDelete} type="button"><Trash2 size={14} /></button></div>
    </div>
  )
}

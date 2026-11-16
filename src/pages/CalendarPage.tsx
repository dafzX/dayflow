import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TaskDialog } from '../components/tasks/TaskDialog'
import { Button, Card, PageHeader } from '../components/ui'
import { useAppData } from '../contexts/AppDataContext'
import { useAuth } from '../contexts/AuthContext'
import { categoryLabel, taskStatusLabel } from '../lib/locale'
import { formatLocalized } from '../lib/format'
import { saveTask } from '../services/tasks'
import type { Task } from '../types'

type CalendarView = 'Month' | 'Week' | 'Day'

export function CalendarPage() {
  const { tasks, refreshData } = useAppData()
  const { user } = useAuth()
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState(new Date())
  const [view, setView] = useState<CalendarView>('Month')
  const [adding, setAdding] = useState(false)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const days = useMemo(() => {
    if (view === 'Day') return [selected]
    if (view === 'Week') return eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) })
    return eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }) })
  }, [cursor, selected, view])
  const tasksForDate = (date: Date) => tasks.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), date))
  const dateTitle = view === 'Day' ? formatLocalized(selected, 'EEEE, d MMMM yyyy') : formatLocalized(cursor, 'MMMM yyyy')
  const shift = (direction: number) => {
    if (view === 'Month') setCursor((date) => direction > 0 ? addMonths(date, direction) : subMonths(date, -direction))
    else if (view === 'Week') setCursor((date) => direction > 0 ? addWeeks(date, direction) : subWeeks(date, -direction))
    else setSelected((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + direction))
  }
  const save = async (task: Omit<Task, 'id'>) => {
    if (!user) { setActionError('Masuk untuk menyimpan tugas.'); return }
    setSaving(true)
    setActionError('')
    try {
      await saveTask(user.id, undefined, task)
      await refreshData()
      setAdding(false)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Tugas tidak dapat disimpan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Kalender" description="Lihat agenda dan tenggat yang akan datang." action={<Button onClick={() => setAdding(true)}><Plus size={16} />Tugas baru</Button>} />
      {actionError && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-white px-4 py-3 text-xs text-danger">{actionError}</p>}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3"><h2 className="min-w-[155px] text-base font-semibold text-ink">{dateTitle}</h2><button aria-label="Periode sebelumnya" className="rounded-lg border border-line p-2 text-muted hover:bg-canvas" onClick={() => shift(-1)} type="button"><ChevronLeft size={15} /></button><button aria-label="Periode berikutnya" className="rounded-lg border border-line p-2 text-muted hover:bg-canvas" onClick={() => shift(1)} type="button"><ChevronRight size={15} /></button><button className="rounded-lg px-2 py-1.5 text-xs font-medium text-brand hover:bg-soft" onClick={() => { setCursor(new Date()); setSelected(new Date()) }} type="button">Hari ini</button></div>
          <div className="flex rounded-xl bg-canvas p-1">{(['Month', 'Week', 'Day'] as CalendarView[]).map((item) => <button className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${view === item ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-ink'}`} key={item} onClick={() => setView(item)} type="button">{({ Month: 'Bulan', Week: 'Minggu', Day: 'Hari' })[item]}</button>)}</div>
        </div>
        {view === 'Month' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-7 border-b border-line">{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => <div className="py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-muted" key={day}>{day}</div>)}</div>
              <div className="grid grid-cols-7">{days.map((date) => {
                const dateTasks = tasksForDate(date)
                return <button aria-label={`${formatLocalized(date, 'd MMMM')}, ${dateTasks.length} tugas`} className={`min-h-[105px] border-b border-r border-line p-2 text-left transition hover:bg-canvas/70 ${!isSameMonth(date, cursor) ? 'bg-canvas/40' : 'bg-white'} ${isSameDay(date, selected) ? 'ring-1 ring-inset ring-accent' : ''}`} key={date.toISOString()} onClick={() => setSelected(date)} type="button">
                  <span className={`mb-1 flex size-6 items-center justify-center rounded-full text-[11px] ${isSameDay(date, new Date()) ? 'bg-brand font-semibold text-white' : isSameMonth(date, cursor) ? 'text-ink' : 'text-muted'}`}>{formatLocalized(date, 'd')}</span>
                  <div className="space-y-1">{dateTasks.slice(0, 2).map((task) => <span className={`block truncate rounded px-1.5 py-1 text-[9px] ${task.status === 'Completed' ? 'bg-soft text-brand' : 'bg-[#f3f5f2] text-ink'}`} key={task.id}>{task.title}</span>)}{dateTasks.length > 2 && <span className="block px-1 text-[9px] text-muted">+{dateTasks.length - 2} lainnya</span>}</div>
                </button>
              })}</div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-line">{days.map((date) => <button className={`flex w-full items-start gap-4 p-4 text-left hover:bg-canvas/60 sm:p-5 ${isSameDay(date, selected) ? 'bg-canvas/50' : ''}`} key={date.toISOString()} onClick={() => setSelected(date)} type="button"><span className="w-12 shrink-0 text-center"><span className="block text-[10px] uppercase text-muted">{formatLocalized(date, 'EEE')}</span><span className={`mt-1 inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold ${isSameDay(date, new Date()) ? 'bg-brand text-white' : 'text-ink'}`}>{formatLocalized(date, 'd')}</span></span><span className="flex-1 space-y-2">{tasksForDate(date).length ? tasksForDate(date).map((task) => <span className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2" key={task.id}><span className="truncate text-xs font-medium text-ink">{task.title}</span><span className="ml-3 text-[10px] text-muted">{categoryLabel(task.category)} · {taskStatusLabel(task.status)}</span></span>) : <span className="block py-3 text-xs text-muted">Tidak ada tugas terjadwal</span>}</span></button>)}</div>
        )}
      </Card>
      <Card className="mt-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="text-sm font-semibold text-ink">{formatLocalized(selected, 'EEEE, d MMM')}</p><p className="mt-1 text-xs text-muted">{tasksForDate(selected).length} tugas terjadwal</p></div><Button onClick={() => setAdding(true)} variant="secondary"><Plus size={15} />Tambah tugas pada tanggal ini</Button></Card>
      {adding && <TaskDialog error={actionError} initialDate={formatLocalized(selected, 'yyyy-MM-dd')} onClose={() => { if (!saving) { setAdding(false); setActionError('') } }} onSave={save} submitting={saving} />}
    </div>
  )
}

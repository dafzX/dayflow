import { CalendarDays, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { parseISO } from 'date-fns'
import { useState, type FormEvent } from 'react'
import { Button, Card, Field, FormActions, Modal, PageHeader } from '../components/ui'
import { inputClass } from '../components/ui/styles'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../contexts/AppDataContext'
import { formatLocalized, formatMoney } from '../lib/format'
import { sumMoney } from '../lib/money'
import { addSavingsContribution, deleteSavingsGoal, saveSavingsGoal } from '../services/finance'
import type { SavingsGoal } from '../types'

export function SavingsPage() {
  const { goals, profile, refreshData } = useAppData()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [contributeTo, setContributeTo] = useState<SavingsGoal | undefined>()
  const [editing, setEditing] = useState<SavingsGoal | undefined>()
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const totalSaved = sumMoney(goals.map((goal) => goal.current))
  const totalTarget = sumMoney(goals.map((goal) => goal.target))
  const money = (amount: number) => formatMoney(amount, profile.currency)
  const save = async (goal: Omit<SavingsGoal, 'id'>) => {
    if (!user) { setActionError('Masuk untuk menyimpan target tabungan.'); return }
    setSaving(true)
    setActionError('')
    try {
      await saveSavingsGoal(user.id, editing?.id, goal)
      await refreshData()
      setDialogOpen(false)
      setEditing(undefined)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Target tabungan tidak dapat disimpan.')
    } finally {
      setSaving(false)
    }
  }
  const contribute = async (amount: number) => {
    if (!contributeTo) return
    if (!user) { setActionError('Masuk untuk menambahkan tabungan.'); return }
    setSaving(true)
    setActionError('')
    try {
      await addSavingsContribution(user.id, contributeTo.id, amount)
      await refreshData()
      setContributeTo(undefined)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Kontribusi tabungan tidak dapat ditambahkan.')
    } finally {
      setSaving(false)
    }
  }
  const remove = async (goal: SavingsGoal) => {
    if (!window.confirm(`Hapus target “${goal.name}”?`)) return
    if (!user) { setActionError('Masuk untuk menghapus target tabungan.'); return }
    setActionError('')
    try {
      await deleteSavingsGoal(user.id, goal.id)
      await refreshData()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Target tabungan tidak dapat dihapus.')
    }
  }
  return (
    <div>
      <PageHeader title="Target tabungan" description="Wujudkan hal-hal penting dengan menabung secara konsisten." action={<Button onClick={() => { setActionError(''); setEditing(undefined); setDialogOpen(true) }}><Plus size={16} />Target baru</Button>} />
      {actionError && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-white px-4 py-3 text-xs text-danger">{actionError}</p>}
      <Card className="mb-5 flex flex-col gap-4 bg-brand p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div><p className="text-xs text-white/65">Total tabungan Anda</p><p className="mt-1 text-2xl font-semibold tabular-nums">{money(totalSaved)}</p><p className="mt-1 text-xs text-white/65">Dari {goals.length} target aktif</p></div>
        <div className="sm:w-1/2"><div className="mb-2 flex justify-between text-[11px] text-white/75"><span>Progres keseluruhan</span><span>{totalTarget ? Math.round(totalSaved / totalTarget * 100) : 0}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#9fe0b5]" style={{ width: `${totalTarget ? Math.min(100, totalSaved / totalTarget * 100) : 0}%` }} /></div><p className="mt-2 text-right text-[10px] text-white/65">dari target {money(totalTarget)}</p></div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal, index) => {
          const percent = Math.min(100, Math.round(goal.current / goal.target * 100))
          return <Card className="p-5" key={goal.id}>
            <div className="flex items-start justify-between"><span className={`flex size-10 items-center justify-center rounded-xl ${index % 2 ? 'bg-[#f3f0e8] text-[#92713a]' : 'bg-soft text-brand'}`}><Target size={18} /></span><div className="flex gap-1"><button aria-label={`Ubah ${goal.name}`} className="rounded-lg p-2 text-muted hover:bg-canvas" onClick={() => { setActionError(''); setEditing(goal); setDialogOpen(true) }} type="button"><Pencil size={14} /></button><button aria-label={`Hapus ${goal.name}`} className="rounded-lg p-2 text-muted hover:bg-[#fbefed] hover:text-danger" onClick={() => remove(goal)} type="button"><Trash2 size={14} /></button></div></div>
            <h2 className="mt-4 text-sm font-semibold text-ink">{goal.name}</h2><p className="mt-1 text-xs text-muted">Sedikit demi sedikit, target akan tercapai.</p>
            <div className="mt-5 flex items-end justify-between"><p className="text-lg font-semibold tabular-nums text-ink">{money(goal.current)}</p><span className="text-xs font-semibold text-accent">{percent}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} /></div>
            <div className="mt-2 flex justify-between text-[10px] text-muted"><span>dari {money(goal.target)}</span><span>Kurang {money(Math.max(0, goal.target - goal.current))}</span></div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4"><span className="flex items-center gap-1.5 text-[10px] text-muted"><CalendarDays size={13} />{goal.deadline ? formatLocalized(parseISO(goal.deadline), 'd MMM yyyy') : 'Tanpa tenggat'}</span><Button onClick={() => { setActionError(''); setContributeTo(goal) }} size="sm" variant="secondary"><Plus size={13} />Tambah dana</Button></div>
          </Card>
        })}
        {goals.length === 0 && <Card className="col-span-full p-10 text-center"><p className="text-sm font-medium text-ink">Belum ada target tabungan</p><p className="mt-1 text-xs text-muted">Mulai dengan menentukan target yang ingin Anda capai.</p><Button className="mt-4" onClick={() => { setActionError(''); setDialogOpen(true) }} size="sm"><Plus size={14} />Buat target pertama</Button></Card>}
      </div>
      {dialogOpen && <GoalDialog error={actionError} goal={editing} onClose={() => { if (!saving) { setDialogOpen(false); setEditing(undefined); setActionError('') } }} onSave={save} submitting={saving} />}
      {contributeTo && <ContributionDialog error={actionError} goal={contributeTo} onClose={() => { if (!saving) { setContributeTo(undefined); setActionError('') } }} onSave={contribute} submitting={saving} />}
    </div>
  )
}

function GoalDialog({ goal, onClose, onSave, submitting = false, error }: { goal?: SavingsGoal; onClose: () => void; onSave: (goal: Omit<SavingsGoal, 'id'>) => void | Promise<void>; submitting?: boolean; error?: string }) {
  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(goal?.target ?? 0)
  const [current, setCurrent] = useState(goal?.current ?? 0)
  const [deadline, setDeadline] = useState(goal?.deadline ?? new Date().toISOString().slice(0, 10))
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (target > 0) onSave({ name: name.trim(), target, current, deadline }) }
  return <Modal title={goal ? 'Ubah target tabungan' : 'Buat target tabungan'} onClose={onClose}><form onSubmit={submit}><div className="space-y-4"><Field label="Nama target"><input autoFocus className={inputClass} maxLength={70} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Liburan keluarga" required value={name} /></Field><div className={`grid ${goal ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}><Field label="Jumlah target"><input className={inputClass} min="1" onChange={(event) => setTarget(Number(event.target.value))} required type="number" value={target || ''} /></Field>{!goal && <Field label="Tabungan saat ini"><input className={inputClass} min="0" onChange={(event) => setCurrent(Number(event.target.value))} type="number" value={current || ''} /></Field>}</div><Field label="Tenggat target"><input className={inputClass} onChange={(event) => setDeadline(event.target.value)} required type="date" value={deadline} /></Field></div>{error && <p role="alert" className="mt-4 text-xs text-danger">{error}</p>}<FormActions disabled={submitting} onCancel={onClose} submitLabel={submitting ? 'Menyimpan…' : goal ? 'Simpan target' : 'Buat target'} /></form></Modal>
}

function ContributionDialog({ goal, onClose, onSave, submitting = false, error }: { goal: SavingsGoal; onClose: () => void; onSave: (amount: number) => void | Promise<void>; submitting?: boolean; error?: string }) {
  const [amount, setAmount] = useState(0)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (amount > 0) onSave(amount) }
  return <Modal title="Tambah kontribusi" description={`Tambahkan tabungan ke ${goal.name}.`} onClose={onClose}><form onSubmit={submit}><Field label="Jumlah kontribusi (IDR)"><input autoFocus className={inputClass} min="1" onChange={(event) => setAmount(Number(event.target.value))} required type="number" value={amount || ''} /></Field>{error && <p role="alert" className="mt-4 text-xs text-danger">{error}</p>}<FormActions disabled={submitting} onCancel={onClose} submitLabel={submitting ? 'Menyimpan…' : 'Tambah kontribusi'} /></form></Modal>
}

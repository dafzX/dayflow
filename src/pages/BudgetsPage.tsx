import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, Card, Field, FormActions, Modal, PageHeader } from '../components/ui'
import { inputClass } from '../components/ui/styles'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../contexts/AppDataContext'
import { formatMoney } from '../lib/format'
import { categoryLabel } from '../lib/locale'
import { sumMoney } from '../lib/money'
import { deleteBudget, saveBudget } from '../services/finance'
import type { Budget } from '../types'

export function BudgetsPage() {
  const { budgets, transactions, profile, refreshData } = useAppData()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | undefined>()
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const month = new Date().toISOString().slice(0, 7)
  const currentBudgets = budgets.filter((budget) => budget.month === month)
  const totalLimit = sumMoney(currentBudgets.map((budget) => budget.limit))
  const totalSpent = sumMoney(currentBudgets.map((budget) => spentFor(budget.category)))
  const money = (amount: number) => formatMoney(amount, profile.currency)
  function spentFor(category: string) {
    return sumMoney(transactions.filter((item) => item.type === 'Expense' && (category === 'Overall' || item.category === category) && item.date.startsWith(month)).map((item) => item.amount))
  }
  const save = async (category: string, limit: number) => {
    if (!user) { setActionError('Masuk untuk menyimpan anggaran.'); return }
    setSaving(true)
    setActionError('')
    try {
      await saveBudget(user.id, editing?.id, category, limit, month)
      await refreshData()
      setDialogOpen(false)
      setEditing(undefined)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Anggaran tidak dapat disimpan.')
    } finally {
      setSaving(false)
    }
  }
  const remove = async (budget: Budget) => {
    if (!window.confirm(`Hapus anggaran ${categoryLabel(budget.category)}?`)) return
    if (!user) { setActionError('Masuk untuk menghapus anggaran.'); return }
    setActionError('')
    try {
      await deleteBudget(user.id, budget.id)
      await refreshData()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Anggaran tidak dapat dihapus.')
    }
  }
  return (
    <div>
      <PageHeader title="Anggaran" description="Atur pengeluaran Anda dengan lebih terencana." action={<Button onClick={() => { setEditing(undefined); setActionError(''); setDialogOpen(true) }}><Plus size={16} />Buat anggaran</Button>} />
      {actionError && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-white px-4 py-3 text-xs text-danger">{actionError}</p>}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <BudgetSummary label="Total anggaran" value={money(totalLimit)} />
        <BudgetSummary label="Sudah digunakan" value={money(totalSpent)} />
        <BudgetSummary label="Sisa anggaran" value={money(totalLimit - totalSpent)} />
      </div>
      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-ink">Anggaran kategori bulanan</h2><span className="text-xs text-muted">{new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}</span></div>
      <div className="grid gap-3 md:grid-cols-2">
        {currentBudgets.map((budget) => {
          const spent = spentFor(budget.category)
          const percent = budget.limit ? Math.round(spent / budget.limit * 100) : 0
          const warning = percent >= 80
          return <Card className="p-5" key={budget.id}>
            <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-ink">{categoryLabel(budget.category)}</p><p className="mt-1 text-xs text-muted">Batas pengeluaran bulanan</p></div><div className="flex gap-1"><button aria-label={`Ubah anggaran ${categoryLabel(budget.category)}`} className="rounded-lg p-2 text-muted hover:bg-canvas" onClick={() => { setActionError(''); setEditing(budget); setDialogOpen(true) }} type="button"><Pencil size={14} /></button><button aria-label={`Hapus anggaran ${categoryLabel(budget.category)}`} className="rounded-lg p-2 text-muted hover:bg-[#fbefed] hover:text-danger" onClick={() => remove(budget)} type="button"><Trash2 size={14} /></button></div></div>
            <div className="mt-5 flex items-end justify-between"><p className="text-xl font-semibold tabular-nums tracking-tight text-ink">{money(spent)} <span className="text-xs font-normal text-muted">dari {money(budget.limit)}</span></p><span className={`text-xs font-semibold ${percent >= 100 ? 'text-danger' : warning ? 'text-warning' : 'text-accent'}`}>{percent}%</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas"><div className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-danger' : warning ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div>
            <p className={`mt-2 flex items-center gap-1.5 text-[11px] ${percent >= 100 ? 'text-danger' : warning ? 'text-warning' : 'text-muted'}`}>{warning && <AlertTriangle size={13} />}{percent >= 100 ? `Melebihi anggaran ${money(spent - budget.limit)}` : warning ? `Sisa ${money(budget.limit - spent)} — hampir mencapai batas` : `Sisa ${money(budget.limit - spent)} untuk dibelanjakan`}</p>
          </Card>
        })}
        {currentBudgets.length === 0 && <Card className="col-span-full p-10 text-center"><p className="text-sm font-medium text-ink">Belum ada anggaran bulan ini</p><p className="mt-1 text-xs text-muted">Buat anggaran kategori untuk mulai memantau pengeluaran.</p><Button className="mt-4" onClick={() => { setActionError(''); setDialogOpen(true) }} size="sm"><Plus size={14} />Buat anggaran</Button></Card>}
      </div>
      {dialogOpen && <BudgetDialog budget={editing} error={actionError} onClose={() => { if (!saving) { setDialogOpen(false); setEditing(undefined); setActionError('') } }} onSave={save} submitting={saving} />}
    </div>
  )
}

function BudgetSummary({ label, value }: { label: string; value: string }) {
  return <Card className="p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-lg font-semibold tabular-nums text-ink">{value}</p></Card>
}

function BudgetDialog({ budget, onClose, onSave, submitting = false, error }: { budget?: Budget; onClose: () => void; onSave: (category: string, limit: number) => void | Promise<void>; submitting?: boolean; error?: string }) {
  const [category, setCategory] = useState(budget?.category ?? 'Groceries')
  const [limit, setLimit] = useState(budget?.limit ?? 0)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (limit > 0) onSave(category, limit) }
  return <Modal title={budget ? 'Ubah anggaran' : 'Buat anggaran'} onClose={onClose}><form onSubmit={submit}><div className="space-y-4"><Field label="Kategori"><select className={inputClass} onChange={(event) => setCategory(event.target.value)} value={category}>{['Overall', 'Housing', 'Groceries', 'Dining', 'Transport', 'Utilities', 'Health', 'Education', 'Other'].map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}</select></Field><Field label="Batas bulanan (IDR)"><input autoFocus className={inputClass} min="1" onChange={(event) => setLimit(Number(event.target.value))} required type="number" value={limit || ''} /></Field></div>{error && <p role="alert" className="mt-4 text-xs text-danger">{error}</p>}<FormActions disabled={submitting} onCancel={onClose} submitLabel={submitting ? 'Menyimpan…' : budget ? 'Simpan anggaran' : 'Buat anggaran'} /></form></Modal>
}

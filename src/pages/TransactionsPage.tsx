import { ArrowDownLeft, ArrowUpRight, CalendarDays, Pencil, Plus, Search, Trash2, Wallet } from 'lucide-react'
import { isSameMonth, parseISO, startOfMonth } from 'date-fns'
import { useMemo, useState } from 'react'
import { TransactionDialog } from '../components/finance/TransactionDialog'
import { Button, Card, PageHeader } from '../components/ui'
import { inputClass } from '../components/ui/styles'
import { useAppData } from '../contexts/AppDataContext'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatMoney } from '../lib/format'
import { categoryLabel, transactionTypeLabel, paymentMethodLabel } from '../lib/locale'
import { sumMoney } from '../lib/money'
import { deleteTransaction, saveTransaction } from '../services/finance'
import type { Transaction } from '../types'

export function TransactionsPage() {
  const { transactions, profile, refreshData } = useAppData()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All types')
  const [category, setCategory] = useState('All categories')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortOrder, setSortOrder] = useState('Newest first')
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const thisMonth = transactions.filter((item) => isSameMonth(parseISO(item.date), startOfMonth(new Date())))
  const income = sumMoney(thisMonth.filter((item) => item.type === 'Income').map((item) => item.amount))
  const expenses = sumMoney(thisMonth.filter((item) => item.type === 'Expense').map((item) => item.amount))
  const categories = [...new Set(transactions.map((item) => item.category))]
  const filtered = useMemo(() => [...transactions].filter((item) => `${item.title} ${item.category} ${item.notes}`.toLowerCase().includes(query.toLowerCase()) && (type === 'All types' || item.type === type) && (category === 'All categories' || item.category === category) && (!fromDate || item.date >= fromDate) && (!toDate || item.date <= toDate)).sort((a, b) => sortOrder === 'Newest first' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), [transactions, query, type, category, fromDate, toDate, sortOrder])
  const money = (amount: number) => formatMoney(amount, profile.currency)
  const save = async (item: Omit<Transaction, 'id'>) => {
    if (!user) { setActionError('Masuk untuk menyimpan transaksi.'); return }
    setSaving(true)
    setActionError('')
    try {
      await saveTransaction(user.id, editing?.id, item)
      await refreshData()
      setDialogOpen(false)
      setEditing(undefined)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Transaksi tidak dapat disimpan.')
    } finally {
      setSaving(false)
    }
  }
  const remove = async (item: Transaction) => {
    if (!window.confirm(`Hapus transaksi “${item.title}”?`)) return
    if (!user) { setActionError('Masuk untuk menghapus transaksi.'); return }
    setActionError('')
    try {
      await deleteTransaction(user.id, item.id)
      await refreshData()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Transaksi tidak dapat dihapus.')
    }
  }

  return (
    <div>
      <PageHeader title="Transaksi" description="Pantau pemasukan dan pengeluaran Anda." action={<Button onClick={() => { setEditing(undefined); setActionError(''); setDialogOpen(true) }}><Plus size={16} />Tambah transaksi</Button>} />
      {actionError && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-white px-4 py-3 text-xs text-danger">{actionError}</p>}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FinanceStat icon={Wallet} label="Pemasukan bulan ini" value={money(income)} tone="text-accent bg-soft" />
        <FinanceStat icon={ArrowUpRight} label="Pengeluaran bulan ini" value={money(expenses)} tone="text-danger bg-[#fbefed]" />
        <FinanceStat icon={ArrowDownLeft} label="Arus kas bersih" value={money(sumMoney([income, -expenses]))} tone="text-brand bg-[#f3f0e8]" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative w-full sm:max-w-[270px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} /><input className={`${inputClass} pl-9`} onChange={(event) => setQuery(event.target.value)} placeholder="Cari transaksi..." value={query} /></label>
          <div className="flex flex-wrap gap-2"><select aria-label="Filter jenis transaksi" className={`${inputClass} w-auto min-w-[120px]`} onChange={(event) => setType(event.target.value)} value={type}><option value="All types">Semua jenis</option><option value="Income">{transactionTypeLabel('Income')}</option><option value="Expense">{transactionTypeLabel('Expense')}</option></select><select aria-label="Filter kategori" className={`${inputClass} w-auto min-w-[140px]`} onChange={(event) => setCategory(event.target.value)} value={category}><option value="All categories">Semua kategori</option>{categories.map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}</select><label className="relative flex min-w-[142px] flex-1 items-center"><CalendarDays className="pointer-events-none absolute left-2.5 text-muted" size={13} /><input aria-label="Dari tanggal" className={`${inputClass} pl-8 text-xs`} onChange={(event) => setFromDate(event.target.value)} type="date" value={fromDate} /></label><label className="relative flex min-w-[142px] flex-1 items-center"><CalendarDays className="pointer-events-none absolute left-2.5 text-muted" size={13} /><input aria-label="Sampai tanggal" className={`${inputClass} pl-8 text-xs`} onChange={(event) => setToDate(event.target.value)} type="date" value={toDate} /></label><select aria-label="Urutkan transaksi" className={`${inputClass} w-auto min-w-[130px]`} onChange={(event) => setSortOrder(event.target.value)} value={sortOrder}><option value="Newest first">Terbaru</option><option value="Oldest first">Terlama</option></select></div>
        </div>
        <div className="divide-y divide-line">
          {filtered.map((item) => <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5" key={item.id}>
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.type === 'Income' ? 'bg-soft text-accent' : 'bg-[#fbefed] text-danger'}`}>{item.type === 'Income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{item.title}</p><p className="mt-1 truncate text-[11px] text-muted">{categoryLabel(item.category)} · {paymentMethodLabel(item.paymentMethod)}</p></div>
            <span className="hidden text-xs text-muted sm:block">{formatDate(item.date)}</span>
            <p className={`min-w-[115px] text-right text-sm font-semibold tabular-nums ${item.type === 'Income' ? 'text-accent' : 'text-ink'}`}>{item.type === 'Income' ? '+' : '−'}{money(item.amount)}</p>
            <div className="flex gap-0.5"><button aria-label={`Ubah ${item.title}`} className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink" onClick={() => { setActionError(''); setEditing(item); setDialogOpen(true) }} type="button"><Pencil size={14} /></button><button aria-label={`Hapus ${item.title}`} className="rounded-lg p-2 text-muted hover:bg-[#fbefed] hover:text-danger" onClick={() => remove(item)} type="button"><Trash2 size={14} /></button></div>
          </div>)}
          {filtered.length === 0 && <div className="p-12 text-center"><p className="text-sm font-medium text-ink">Transaksi tidak ditemukan</p><p className="mt-1 text-xs text-muted">Ubah filter atau tambahkan transaksi.</p></div>}
        </div>
      </Card>
      {dialogOpen && <TransactionDialog error={actionError} onClose={() => { if (!saving) { setDialogOpen(false); setEditing(undefined); setActionError('') } }} onSave={save} submitting={saving} transaction={editing} />}
    </div>
  )
}

function FinanceStat({ icon: Icon, label, value, tone }: { icon: typeof Wallet; label: string; value: string; tone: string }) {
  return <Card className="flex items-center gap-3 p-4"><span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}><Icon size={17} /></span><div className="min-w-0"><p className="text-[11px] text-muted">{label}</p><p className="mt-1 truncate text-sm font-semibold tabular-nums text-ink">{value}</p></div></Card>
}

import {
  ArrowDownRight, ArrowUpRight, Activity, Check, CheckCircle2, ChevronRight,
  Circle, Clock3, Plus, Wallet, Target, CheckSquare2,
} from 'lucide-react'
import { addDays, eachDayOfInterval, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { TaskDialog } from '../components/tasks/TaskDialog'
import { Button, Card, PageHeader } from '../components/ui'
import { useAppData } from '../contexts/AppDataContext'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatLocalized, formatMoney, formatShortMoney, greeting, todayString } from '../lib/format'
import { categoryLabel, transactionTypeLabel } from '../lib/locale'
import { sumMoney } from '../lib/money'
import { saveTask as persistTask } from '../services/tasks'
import type { Task } from '../types'

function SummaryCard({ label, value, note, icon: Icon, tone }: {
  label: string; value: string; note: string; icon: typeof Wallet; tone: string
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}><Icon size={17} /></span>
      </div>
      <p className="mt-4 text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 truncate text-[20px] font-semibold tabular-nums tracking-[-0.04em] text-ink sm:text-[22px]">{value}</p>
      <p className="mt-1.5 text-[10px] text-muted">{note}</p>
    </Card>
  )
}

function TransactionIcon({ type }: { type: 'Income' | 'Expense' }) {
  return <span className={`flex size-9 items-center justify-center rounded-xl ${type === 'Income' ? 'bg-soft text-accent' : 'bg-[#fbefed] text-danger'}`}>{type === 'Income' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}</span>
}

export function DashboardPage() {
  const { tasks, transactions, budgets, goals, profile, refreshData } = useAppData()
  const { user } = useAuth()
  const [quickAdd, setQuickAdd] = useState(false)
  const [actionError, setActionError] = useState('')
  const [savingTask, setSavingTask] = useState(false)
  const today = todayString()
  const currentMonth = startOfMonth(new Date())
  const monthlyTransactions = transactions.filter((item) => isSameMonth(parseISO(item.date), currentMonth))
  const income = sumMoney(monthlyTransactions.filter((item) => item.type === 'Income').map((item) => item.amount))
  const expenses = sumMoney(monthlyTransactions.filter((item) => item.type === 'Expense').map((item) => item.amount))
  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(startOfMonth(new Date()), 5 - index)
    const monthKey = format(date, 'yyyy-MM')
    const monthTransactions = transactions.filter((item) => item.date.startsWith(monthKey))
    return {
      month: formatLocalized(date, 'MMM'),
      income: sumMoney(monthTransactions.filter((item) => item.type === 'Income').map((item) => item.amount)),
      expenses: sumMoney(monthTransactions.filter((item) => item.type === 'Expense').map((item) => item.amount)),
    }
  })
  const weeklyData = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  }).map((date) => {
    const day = format(date, 'yyyy-MM-dd')
    return {
      day: formatLocalized(date, 'EEE'),
      done: tasks.filter((task) => task.completedAt === day).length,
      planned: tasks.filter((task) => task.dueDate === day).length,
    }
  })
  const completed = tasks.filter((task) => task.status === 'Completed').length
  const todayTasks = tasks.filter((task) => task.dueDate === today && task.status !== 'Completed')
  const upcomingTasks = tasks.filter((task) => task.dueDate > today && task.dueDate <= format(addDays(new Date(), 7), 'yyyy-MM-dd') && task.status !== 'Completed').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const topBudget = budgets.slice(0, 3).map((budget) => ({
    ...budget,
    spent: sumMoney(monthlyTransactions.filter((item) => item.type === 'Expense' && (budget.category === 'Overall' || item.category === budget.category)).map((item) => item.amount)),
  }))
  const balance = sumMoney(transactions.map((item) => item.type === 'Income' ? item.amount : -item.amount))
  const pending = tasks.length - completed
  const money = (amount: number) => formatMoney(amount, profile.currency)
  const shortMoney = (amount: number) => formatShortMoney(amount, profile.currency)
  const chartTooltip = { contentStyle: { border: '1px solid #E6EBE7', borderRadius: 12, fontSize: 12 }, formatter: (value: number | string | readonly (number | string)[] | undefined) => money(Number(value) || 0) }
  const pieData = [
    { name: 'Pemasukan', value: income, color: '#3B9B69' },
    { name: 'Pengeluaran', value: expenses, color: '#e8b3a5' },
  ]
  const saveTask = async (task: Omit<Task, 'id'>) => {
    if (!user) { setActionError('Masuk untuk menyimpan tugas.'); return }
    setSavingTask(true)
    setActionError('')
    try {
      await persistTask(user.id, undefined, task)
      await refreshData()
      setQuickAdd(false)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Tugas tidak dapat disimpan.')
    } finally {
      setSavingTask(false)
    }
  }
  const completeTask = async (task: Task) => {
    if (!user) { setActionError('Masuk untuk memperbarui tugas.'); return }
    setActionError('')
    try {
      await persistTask(user.id, task.id, { ...task, status: 'Completed' })
      await refreshData()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Tugas tidak dapat diperbarui.')
    }
  }

  return (
    <div>
      <PageHeader title="Ringkasan" description={formatLocalized(new Date(), 'EEEE, d MMMM yyyy')} action={<div className="flex gap-2"><Button onClick={() => setQuickAdd(true)} variant="secondary"><Plus size={15} />Tambah tugas</Button><Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand/90" to="/transactions"><Plus size={15} />Transaksi</Link></div>} />
      {actionError && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-white px-4 py-3 text-xs text-danger">{actionError}</p>}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-brand p-5 text-white sm:flex-row sm:items-center sm:px-7 sm:py-6">
        <div><p className="text-sm text-white/70">{greeting()},</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{profile.name.split(' ')[0]} <span aria-hidden="true">✦</span></h2><p className="mt-1 text-xs text-white/65">Berikut ringkasan aktivitas Anda hari ini.</p></div>
        <div className="hidden items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 sm:flex"><span className="flex size-9 items-center justify-center rounded-lg bg-white/10"><CheckSquare2 size={17} /></span><div><p className="text-lg font-semibold">{completed}<span className="text-sm font-normal text-white/65">/{tasks.length}</span></p><p className="text-[10px] text-white/65">tugas selesai</p></div></div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard icon={Wallet} label="Saldo total" value={money(balance)} note="Selisih seluruh transaksi" tone="bg-soft text-brand" />
        <SummaryCard icon={ArrowDownRight} label="Pemasukan bulanan" value={money(income)} note="Bulan ini" tone="bg-soft text-accent" />
        <SummaryCard icon={ArrowUpRight} label="Pengeluaran bulanan" value={money(expenses)} note="Bulan ini" tone="bg-[#fbefed] text-danger" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={CheckSquare2} label="Total tugas" value={`${tasks.length}`} note="Dari seluruh daftar Anda" tone="bg-[#f3f0e8] text-[#92713a]" />
        <SummaryCard icon={CheckCircle2} label="Selesai" value={`${completed}`} note="Tugas yang telah dituntaskan" tone="bg-soft text-accent" />
        <SummaryCard icon={Clock3} label="Tertunda" value={`${pending}`} note="Masih dalam proses" tone="bg-[#eef1f8] text-[#586c9b]" />
        <SummaryCard icon={Activity} label="Tingkat penyelesaian" value={`${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%`} note="Dari seluruh tugas" tone="bg-[#f3f0e8] text-[#92713a]" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between"><div><h2 className="text-sm font-semibold text-ink">Arus kas</h2><p className="mt-1 text-xs text-muted">Pemasukan dan pengeluaran dari waktu ke waktu</p></div><span className="rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-medium text-muted">6 bulan terakhir</span></div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer height="100%" width="100%"><ComposedChart data={monthlyData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}><CartesianGrid stroke="#EDF0ED" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="month" tick={{ fill: '#78847C', fontSize: 10 }} tickLine={false} /><YAxis axisLine={false} tick={{ fill: '#78847C', fontSize: 10 }} tickFormatter={(value: number) => `${value / 1000000} jt`} tickLine={false} /><Tooltip {...chartTooltip} /><Bar dataKey="income" fill="#3B9B69" name="Pemasukan" radius={[4, 4, 0, 0]} /><Bar dataKey="expenses" fill="#d9e8dd" name="Pengeluaran" radius={[4, 4, 0, 0]} /><Line dataKey="income" dot={false} name="Tren pemasukan" stroke="#173D2B" strokeWidth={2} type="monotone" /></ComposedChart></ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="mb-2"><h2 className="text-sm font-semibold text-ink">Produktivitas mingguan</h2><p className="mt-1 text-xs text-muted">Tugas yang diselesaikan minggu ini</p></div>
          <div className="h-[210px]">
            <ResponsiveContainer height="100%" width="100%"><BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}><CartesianGrid stroke="#EDF0ED" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="day" tick={{ fill: '#78847C', fontSize: 10 }} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tick={{ fill: '#78847C', fontSize: 10 }} tickLine={false} /><Tooltip /><Bar dataKey="done" fill="#3B9B69" name="Selesai" radius={[5, 5, 0, 0]} /><Bar dataKey="planned" fill="#eaf1ec" name="Terjadwal" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="p-4 sm:p-5 xl:col-span-1">
          <div className="mb-4 flex items-start justify-between"><div><h2 className="text-sm font-semibold text-ink">Tugas hari ini</h2><p className="mt-1 text-xs text-muted">{todayTasks.length} tugas dalam daftar Anda</p></div><Link aria-label="Lihat semua tugas" className="rounded-lg p-1.5 text-muted hover:bg-canvas" to="/tasks"><ChevronRight size={17} /></Link></div>
          <div className="space-y-1">
            {todayTasks.slice(0, 4).map((task) => <button key={task.id} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-canvas" onClick={() => void completeTask(task)} type="button"><Circle className="shrink-0 text-line" size={16} /><span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{task.title}</span><span className={`size-1.5 rounded-full ${task.priority === 'High' ? 'bg-danger' : task.priority === 'Medium' ? 'bg-warning' : 'bg-accent'}`} /></button>)}
            {todayTasks.length === 0 && <p className="py-6 text-center text-xs text-muted">Tidak ada tugas mendesak hari ini. Nikmati waktu luang Anda.</p>}
          </div>
          <Link className="mt-2 flex items-center justify-center gap-1 border-t border-line pt-3 text-xs font-medium text-brand hover:text-accent" to="/tasks">Buka daftar tugas <ChevronRight size={14} /></Link>
        </Card>

        <Card className="p-4 sm:p-5 xl:col-span-1">
          <div className="mb-4 flex items-start justify-between"><div><h2 className="text-sm font-semibold text-ink">Transaksi terbaru</h2><p className="mt-1 text-xs text-muted">Aktivitas keuangan terkini</p></div><Link aria-label="Lihat transaksi" className="rounded-lg p-1.5 text-muted hover:bg-canvas" to="/transactions"><ChevronRight size={17} /></Link></div>
          <div className="space-y-3">
            {recent.slice(0, 4).map((item) => <div className="flex items-center gap-2.5" key={item.id}><TransactionIcon type={item.type} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-ink">{item.title}</p><p className="mt-0.5 text-[10px] text-muted">{categoryLabel(item.category)} · {formatDate(item.date, 'd MMM')}</p></div><p className={`text-xs font-semibold tabular-nums ${item.type === 'Income' ? 'text-accent' : 'text-ink'}`}>{item.type === 'Income' ? '+' : '−'}{money(item.amount)}</p></div>)}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 xl:col-span-1">
          <div className="mb-4 flex items-start justify-between"><div><h2 className="text-sm font-semibold text-ink">Ringkasan anggaran</h2><p className="mt-1 text-xs text-muted">Batas pengeluaran bulanan</p></div><Link aria-label="Lihat anggaran" className="rounded-lg p-1.5 text-muted hover:bg-canvas" to="/budgets"><ChevronRight size={17} /></Link></div>
          <div className="space-y-4">{topBudget.map((budget) => {
            const percent = Math.min(100, Math.round((budget.spent / budget.limit) * 100))
            return <div key={budget.id}><div className="mb-1.5 flex justify-between text-[11px]"><span className="font-medium text-ink">{categoryLabel(budget.category)}</span><span className="tabular-nums text-muted">{shortMoney(budget.spent)} <span className="text-line">/</span> {shortMoney(budget.limit)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-canvas"><div className={`h-full rounded-full ${percent > 90 ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${percent}%` }} /></div></div>
          })}</div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Card className="flex items-center gap-3 p-4 sm:p-5">
          <div className="relative h-24 w-24 shrink-0"><ResponsiveContainer height="100%" width="100%"><PieChart>{income + expenses > 0 && <Pie data={pieData} dataKey="value" innerRadius={30} outerRadius={42} paddingAngle={4}>{pieData.map((item) => <Cell fill={item.color} key={item.name} />)}</Pie>}</PieChart></ResponsiveContainer>{income + expenses === 0 && <span className="absolute inset-0 flex items-center justify-center text-[9px] text-muted">Belum ada data</span>}</div>
          <div className="min-w-0 flex-1"><div className="mb-3 flex items-center gap-2"><Wallet className="text-accent" size={16} /><h2 className="text-sm font-semibold text-ink">Sekilas bulan ini</h2></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs"><span><span className="mr-1.5 inline-block size-2 rounded-full bg-accent" />{transactionTypeLabel('Income')} <strong className="ml-1 tabular-nums">{shortMoney(income)}</strong></span><span><span className="mr-1.5 inline-block size-2 rounded-full bg-[#e8b3a5]" />Pengeluaran <strong className="ml-1 tabular-nums">{shortMoney(expenses)}</strong></span></div></div>
        </Card>
        <Card className="p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Target className="text-accent" size={16} /><h2 className="text-sm font-semibold text-ink">Target tabungan</h2></div><Link className="text-xs font-medium text-brand hover:text-accent" to="/savings">Lihat target</Link></div><div className="flex gap-3">{goals.slice(0, 3).map((goal) => <div className="min-w-0 flex-1" key={goal.id}><div className="mb-1.5 flex items-center justify-between text-[10px]"><span className="truncate font-medium text-ink">{goal.name}</span><span className="text-muted">{Math.round(goal.current / goal.target * 100)}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, goal.current / goal.target * 100)}%` }} /></div><p className="mt-1.5 truncate text-[10px] text-muted">{shortMoney(goal.current)} terkumpul</p></div>)}</div></Card>
        <Card className="p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Clock3 className="text-accent" size={16} /><h2 className="text-sm font-semibold text-ink">Tenggat mendatang</h2></div><Link className="text-xs font-medium text-brand hover:text-accent" to="/calendar">Kalender</Link></div><div className="space-y-2">{upcomingTasks.map((task) => <div className="flex items-center justify-between gap-2 rounded-lg bg-canvas px-3 py-2" key={task.id}><p className="truncate text-xs font-medium text-ink">{task.title}</p><span className="shrink-0 text-[10px] text-muted">{formatDate(task.dueDate, 'd MMM')}</span></div>)}{upcomingTasks.length === 0 && <p className="py-4 text-xs text-muted">Tidak ada tenggat dalam minggu ini.</p>}</div></Card>
      </div>
      {quickAdd && <TaskDialog error={actionError} onClose={() => { if (!savingTask) { setQuickAdd(false); setActionError('') } }} onSave={saveTask} submitting={savingTask} />}
      <span className="sr-only"><Check /></span>
    </div>
  )
}

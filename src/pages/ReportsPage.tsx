import { format, startOfMonth, subDays, subMonths } from 'date-fns'
import { Download, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Card, PageHeader } from '../components/ui'
import { useAppData } from '../contexts/AppDataContext'
import { formatLocalized, formatMoney, formatShortMoney } from '../lib/format'
import { categoryLabel, transactionTypeLabel } from '../lib/locale'
import { sumMoney } from '../lib/money'

const colors = ['#3B9B69', '#85bb98', '#b8d7c1', '#d8e9dc', '#e9a23b', '#a8b7ac']
export function ReportsPage() {
  const { transactions, budgets, profile } = useAppData()
  const [range, setRange] = useState('180')
  const cutoff = subDays(new Date(), Number(range))
  const cutoffDate = format(cutoff, 'yyyy-MM-dd')
  const filtered = transactions.filter((item) => item.date >= cutoffDate)
  const income = sumMoney(filtered.filter((item) => item.type === 'Income').map((item) => item.amount))
  const expenses = sumMoney(filtered.filter((item) => item.type === 'Expense').map((item) => item.amount))
  const categories = new Map<string, number>()
  filtered.filter((item) => item.type === 'Expense').forEach((item) => categories.set(item.category, sumMoney([categories.get(item.category) ?? 0, item.amount])))
  const categoryData = [...categories.entries()].map(([name, value]) => ({ name: categoryLabel(name), value })).sort((a, b) => b.value - a.value)
  const trend = Array.from({ length: 12 }, (_, index) => {
    const date = subMonths(startOfMonth(new Date()), 11 - index)
    const monthKey = format(date, 'yyyy-MM')
    const monthTransactions = filtered.filter((item) => item.date.startsWith(monthKey))
    return {
      monthKey,
      month: formatLocalized(date, 'MMM'),
      income: sumMoney(monthTransactions.filter((item) => item.type === 'Income').map((item) => item.amount)),
      expenses: sumMoney(monthTransactions.filter((item) => item.type === 'Expense').map((item) => item.amount)),
    }
  }).filter((item) => item.monthKey >= format(cutoff, 'yyyy-MM'))
  const money = (amount: number) => formatMoney(amount, profile.currency)
  const shortMoney = (amount: number) => formatShortMoney(amount, profile.currency)
  const budgetData = budgets.filter((budget) => budget.month >= format(cutoff, 'yyyy-MM')).map((budget) => ({
    category: categoryLabel(budget.category),
    budget: budget.limit,
    spent: sumMoney(transactions.filter((item) => item.type === 'Expense' && (budget.category === 'Overall' || item.category === budget.category) && item.date.startsWith(budget.month)).map((item) => item.amount)),
  }))
  const downloadReport = () => {
    const rows = [['Tanggal', 'Judul', 'Jenis', 'Kategori', 'Jumlah'], ...filtered.map((item) => [item.date, item.title, transactionTypeLabel(item.type), categoryLabel(item.category), String(item.amount)])]
    const csv = rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'dayflow-transaksi.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }
  return (
    <div>
      <PageHeader title="Laporan" description="Pahami pola keuangan Anda dengan lebih jelas." action={<Button onClick={downloadReport} variant="secondary"><Download size={15} />Ekspor CSV</Button>} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-muted"><TrendingUp className="text-accent" size={15} />Ringkasan keuangan Anda</div><select aria-label="Rentang tanggal laporan" className="rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-accent" onChange={(event) => setRange(event.target.value)} value={range}><option value="30">30 hari terakhir</option><option value="90">90 hari terakhir</option><option value="180">6 bulan terakhir</option><option value="365">1 tahun terakhir</option></select></div>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportStat label="Pemasukan" value={money(income)} color="text-accent" />
        <ReportStat label="Pengeluaran" value={money(expenses)} color="text-ink" />
        <ReportStat label="Tabungan bersih" value={money(sumMoney([income, -expenses]))} color="text-brand" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-4 sm:p-5"><h2 className="text-sm font-semibold text-ink">Pemasukan dan pengeluaran</h2><p className="mt-1 text-xs text-muted">Perbandingan bulanan · {profile.currency}</p><div className="mt-4 h-[260px]"><ResponsiveContainer height="100%" width="100%"><ComposedChart data={trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#EDF0ED" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="month" tick={{ fill: '#78847C', fontSize: 10 }} tickLine={false} /><YAxis axisLine={false} tick={{ fill: '#78847C', fontSize: 10 }} tickFormatter={(value: number) => `${value / 1000000} jt`} tickLine={false} /><Tooltip formatter={(value) => money(Number(value) || 0)} /><Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="income" fill="#3B9B69" name="Pemasukan" radius={[4, 4, 0, 0]} /><Bar dataKey="expenses" fill="#dbe9df" name="Pengeluaran" radius={[4, 4, 0, 0]} /></ComposedChart></ResponsiveContainer></div></Card>
        <Card className="p-4 sm:p-5"><h2 className="text-sm font-semibold text-ink">Pengeluaran per kategori</h2><p className="mt-1 text-xs text-muted">Ke mana uang Anda digunakan</p><div className="flex h-[200px] items-center justify-center"><ResponsiveContainer height="100%" width="100%"><PieChart><Pie data={categoryData} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={3}>{categoryData.map((item, index) => <Cell fill={colors[index % colors.length]} key={item.name} />)}</Pie><Tooltip formatter={(value) => money(Number(value) || 0)} /></PieChart></ResponsiveContainer></div><div className="space-y-2">{categoryData.slice(0, 5).map((item, index) => <div className="flex items-center justify-between text-xs" key={item.name}><span className="flex items-center gap-2 text-muted"><i className="size-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{item.name}</span><span className="font-medium tabular-nums text-ink">{money(item.value)}</span></div>)}{categoryData.length === 0 && <p className="text-center text-xs text-muted">Belum ada data pengeluaran pada periode ini.</p>}</div></Card>
      </div>
      <Card className="mt-5 p-4 sm:p-5"><div className="mb-4"><h2 className="text-sm font-semibold text-ink">Performa anggaran</h2><p className="mt-1 text-xs text-muted">Pengeluaran dibandingkan batas anggaran bulanan</p></div><div className="h-[220px]"><ResponsiveContainer height="100%" width="100%"><BarChart data={budgetData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}><CartesianGrid stroke="#EDF0ED" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="category" tick={{ fill: '#78847C', fontSize: 10 }} tickLine={false} /><YAxis axisLine={false} tick={{ fill: '#78847C', fontSize: 10 }} tickFormatter={(value: number) => shortMoney(value)} tickLine={false} /><Tooltip formatter={(value) => money(Number(value) || 0)} /><Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="budget" fill="#eaf1ec" name="Anggaran" radius={[4, 4, 0, 0]} /><Bar dataKey="spent" fill="#3B9B69" name="Terpakai" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
    </div>
  )
}

function ReportStat({ label, value, color }: { label: string; value: string; color: string }) {
  return <Card className="p-4"><p className="text-xs text-muted">{label}</p><p className={`mt-2 text-lg font-semibold tabular-nums ${color}`}>{value}</p></Card>
}

import {
  BarChart3, CalendarDays, LayoutDashboard, PiggyBank, Settings2,
  Target, Wallet, type LucideIcon, CheckSquare,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
}

export const navigation: NavigationItem[] = [
  { label: 'Ringkasan', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Tugas Saya', to: '/tasks', icon: CheckSquare },
  { label: 'Kalender', to: '/calendar', icon: CalendarDays },
  { label: 'Transaksi', to: '/transactions', icon: Wallet },
  { label: 'Anggaran', to: '/budgets', icon: PiggyBank },
  { label: 'Target Tabungan', to: '/savings', icon: Target },
  { label: 'Laporan', to: '/reports', icon: BarChart3 },
  { label: 'Pengaturan', to: '/settings', icon: Settings2 },
]

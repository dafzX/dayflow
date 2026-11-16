import type { TaskPriority, TaskStatus, TransactionType } from '../types'

const taskStatuses: Record<TaskStatus, string> = {
  'To Do': 'Belum dikerjakan',
  'In Progress': 'Sedang dikerjakan',
  Completed: 'Selesai',
}

const taskPriorities: Record<TaskPriority, string> = {
  Low: 'Rendah',
  Medium: 'Sedang',
  High: 'Tinggi',
}

const transactionTypes: Record<TransactionType, string> = {
  Income: 'Pemasukan',
  Expense: 'Pengeluaran',
}

const categories: Record<string, string> = {
  Work: 'Pekerjaan',
  Personal: 'Pribadi',
  Health: 'Kesehatan',
  Learning: 'Pembelajaran',
  Other: 'Lainnya',
  Housing: 'Tempat tinggal',
  Groceries: 'Belanja kebutuhan',
  Dining: 'Makan di luar',
  Transport: 'Transportasi',
  Utilities: 'Tagihan',
  Education: 'Pendidikan',
  Salary: 'Gaji',
  Freelance: 'Pekerjaan lepas',
  Uncategorized: 'Tanpa kategori',
  Overall: 'Keseluruhan',
}

const paymentMethods: Record<string, string> = {
  'Bank transfer': 'Transfer bank',
  'Debit card': 'Kartu debit',
  'Credit card': 'Kartu kredit',
  Cash: 'Tunai',
  'E-wallet': 'Dompet digital',
}

export const taskStatusLabel = (status: TaskStatus) => taskStatuses[status]
export const taskPriorityLabel = (priority: TaskPriority) => taskPriorities[priority]
export const transactionTypeLabel = (type: TransactionType) => transactionTypes[type]
export const categoryLabel = (category: string) => categories[category] ?? category
export const paymentMethodLabel = (method: string) => paymentMethods[method] ?? method

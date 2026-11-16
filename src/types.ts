export type TaskStatus = 'To Do' | 'In Progress' | 'Completed'
export type TaskPriority = 'Low' | 'Medium' | 'High'
export type TransactionType = 'Income' | 'Expense'

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  category: string
  completedAt?: string
}

export interface Transaction {
  id: string
  title: string
  type: TransactionType
  amount: number
  date: string
  category: string
  paymentMethod: string
  notes: string
}

export interface Budget {
  id: string
  category: string
  limit: number
  month: string
}

export interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  deadline: string
}

export interface Profile {
  name: string
  email: string
  currency: string
  theme: 'Light' | 'System'
}

export interface AppData {
  tasks: Task[]
  transactions: Transaction[]
  budgets: Budget[]
  goals: SavingsGoal[]
  profile: Profile
}

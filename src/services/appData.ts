import type { AppData, Profile } from '../types'
import { listFinanceData } from './finance'
import { listTasks } from './tasks'

export async function loadUserData(userId: string, profile: Profile): Promise<AppData> {
  const [tasks, finance] = await Promise.all([
    listTasks(userId),
    listFinanceData(userId),
  ])
  return {
    tasks,
    transactions: finance.transactions,
    budgets: finance.budgets,
    goals: finance.goals,
    profile,
  }
}

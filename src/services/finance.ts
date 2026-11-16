import { supabase } from '../lib/supabase'
import type { Budget, SavingsGoal, Transaction } from '../types'

export interface FinanceData {
  transactions: Transaction[]
  budgets: Budget[]
  goals: SavingsGoal[]
}

export async function listFinanceData(userId: string): Promise<FinanceData> {
  const [categoriesResult, transactionsResult, budgetsResult, goalsResult, contributionsResult] = await Promise.all([
    supabase.from('financial_categories').select('*').eq('user_id', userId),
    supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }),
    supabase.from('budgets').select('*').eq('user_id', userId).order('period_month', { ascending: false }),
    supabase.from('savings_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('savings_contributions').select('*').eq('user_id', userId),
  ])
  if (categoriesResult.error) throw new Error(`Kategori keuangan tidak dapat dimuat: ${categoriesResult.error.message}`)
  if (transactionsResult.error) throw new Error(`Transaksi tidak dapat dimuat: ${transactionsResult.error.message}`)
  if (budgetsResult.error) throw new Error(`Anggaran tidak dapat dimuat: ${budgetsResult.error.message}`)
  if (goalsResult.error) throw new Error(`Target tabungan tidak dapat dimuat: ${goalsResult.error.message}`)
  if (contributionsResult.error) throw new Error(`Kontribusi tabungan tidak dapat dimuat: ${contributionsResult.error.message}`)

  const categoriesById = new Map(categoriesResult.data.map((category) => [category.id, category.name]))
  const goalBalances = new Map<string, bigint>()
  for (const contribution of contributionsResult.data) {
    const cents = Math.round(Number(contribution.amount) * 100)
    if (!Number.isSafeInteger(cents)) throw new Error('Nilai kontribusi tabungan melebihi ketepatan jumlah yang didukung.')
    goalBalances.set(contribution.goal_id, (goalBalances.get(contribution.goal_id) ?? 0n) + BigInt(cents))
  }

  return {
    transactions: transactionsResult.data.map((transaction): Transaction => ({
      id: transaction.id,
      title: transaction.title,
      type: transaction.type === 'income' ? 'Income' : 'Expense',
      amount: Number(transaction.amount),
      date: transaction.transaction_date,
      category: transaction.category_id ? categoriesById.get(transaction.category_id) ?? 'Uncategorized' : 'Uncategorized',
      paymentMethod: transaction.payment_method ?? '',
      notes: transaction.notes ?? '',
    })),
    budgets: budgetsResult.data.map((budget): Budget => ({
      id: budget.id,
      category: budget.category_id ? categoriesById.get(budget.category_id) ?? budget.name : budget.name,
      limit: Number(budget.amount),
      month: budget.period_month.slice(0, 7),
    })),
    goals: goalsResult.data.map((goal): SavingsGoal => ({
      id: goal.id,
      name: goal.name,
      target: Number(goal.target_amount),
      current: Number(goalBalances.get(goal.id) ?? 0n) / 100,
      deadline: goal.deadline ?? '',
    })),
  }
}

async function findOrCreateFinancialCategory(userId: string, categoryName: string, type: 'income' | 'expense') {
  const name = categoryName.trim()
  if (!name || name === 'Uncategorized') return null
  const { data, error } = await supabase
    .from('financial_categories')
    .upsert({ user_id: userId, name, type }, { onConflict: 'user_id,name,type' })
    .select('id')
    .single()
  if (error) throw new Error(`Kategori keuangan tidak dapat disimpan: ${error.message}`)
  return data.id
}

export async function saveTransaction(userId: string, transactionId: string | undefined, transaction: Omit<Transaction, 'id'>) {
  const type: 'income' | 'expense' = transaction.type === 'Income' ? 'income' : 'expense'
  const categoryId = await findOrCreateFinancialCategory(userId, transaction.category, type)
  const values = {
    category_id: categoryId,
    title: transaction.title.trim(),
    amount: transaction.amount,
    type,
    transaction_date: transaction.date,
    payment_method: transaction.paymentMethod.trim() || null,
    notes: transaction.notes.trim() || null,
    updated_at: new Date().toISOString(),
  }
  const result = transactionId
    ? await supabase.from('transactions').update(values).eq('id', transactionId).eq('user_id', userId).select('id').maybeSingle()
    : await supabase.from('transactions').insert({ ...values, user_id: userId }).select('id').single()
  if (result.error) throw new Error(`Transaksi tidak dapat disimpan: ${result.error.message}`)
  if (!result.data) throw new Error('Transaksi tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya.')
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const { data, error } = await supabase.from('transactions').delete().eq('id', transactionId).eq('user_id', userId).select('id').maybeSingle()
  if (error) throw new Error(`Transaksi tidak dapat dihapus: ${error.message}`)
  if (!data) throw new Error('Transaksi tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.')
}

export async function saveBudget(userId: string, budgetId: string | undefined, category: string, amount: number, month: string) {
  const categoryId = category === 'Overall' ? null : await findOrCreateFinancialCategory(userId, category, 'expense')
  const values = {
    category_id: categoryId,
    name: category,
    amount,
    period_month: `${month}-01`,
    updated_at: new Date().toISOString(),
  }
  const result = budgetId
    ? await supabase.from('budgets').update(values).eq('id', budgetId).eq('user_id', userId).select('id').maybeSingle()
    : await supabase.from('budgets').insert({ ...values, user_id: userId }).select('id').single()
  if (result.error) throw new Error(`Anggaran tidak dapat disimpan: ${result.error.message}`)
  if (!result.data) throw new Error('Anggaran tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya.')
}

export async function deleteBudget(userId: string, budgetId: string) {
  const { data, error } = await supabase.from('budgets').delete().eq('id', budgetId).eq('user_id', userId).select('id').maybeSingle()
  if (error) throw new Error(`Anggaran tidak dapat dihapus: ${error.message}`)
  if (!data) throw new Error('Anggaran tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.')
}

export async function saveSavingsGoal(userId: string, goalId: string | undefined, goal: Omit<SavingsGoal, 'id'>) {
  const values = {
    name: goal.name.trim(),
    target_amount: goal.target,
    deadline: goal.deadline || null,
    updated_at: new Date().toISOString(),
  }
  if (goalId) {
    const { data, error } = await supabase.from('savings_goals').update(values).eq('id', goalId).eq('user_id', userId).select('id').maybeSingle()
    if (error) throw new Error(`Target tabungan tidak dapat disimpan: ${error.message}`)
    if (!data) throw new Error('Target tabungan tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya.')
    return
  }

  const { data: createdGoal, error } = await supabase.from('savings_goals').insert({ ...values, user_id: userId }).select('id').single()
  if (error) throw new Error(`Target tabungan tidak dapat dibuat: ${error.message}`)
  if (goal.current <= 0) return

  const { error: contributionError } = await supabase.from('savings_contributions').insert({
    user_id: userId,
    goal_id: createdGoal.id,
    amount: goal.current,
    notes: 'Initial savings',
  })
  if (contributionError) {
    const { error: rollbackError } = await supabase.from('savings_goals').delete().eq('id', createdGoal.id).eq('user_id', userId)
    if (rollbackError) {
      throw new Error(`Target berhasil dibuat, tetapi kontribusi awal gagal (${contributionError.message}) dan pembersihan data juga gagal (${rollbackError.message}).`)
    }
    throw new Error(`Tabungan awal tidak dapat dicatat: ${contributionError.message}`)
  }
}

export async function addSavingsContribution(userId: string, goalId: string, amount: number) {
  const { error } = await supabase.from('savings_contributions').insert({
    user_id: userId,
    goal_id: goalId,
    amount,
  })
  if (error) throw new Error(`Kontribusi tabungan tidak dapat ditambahkan: ${error.message}`)
}

export async function deleteSavingsGoal(userId: string, goalId: string) {
  const { data, error } = await supabase.from('savings_goals').delete().eq('id', goalId).eq('user_id', userId).select('id').maybeSingle()
  if (error) throw new Error(`Target tabungan tidak dapat dihapus: ${error.message}`)
  if (!data) throw new Error('Target tabungan tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.')
}

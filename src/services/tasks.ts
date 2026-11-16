import { supabase } from '../lib/supabase'
import type { Task, TaskPriority, TaskStatus } from '../types'

const priorityToDatabase: Record<TaskPriority, 'low' | 'medium' | 'high'> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

const statusToDatabase: Record<TaskStatus, 'todo' | 'in_progress' | 'completed'> = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  Completed: 'completed',
}

export async function listTasks(userId: string) {
  const [tasksResult, categoriesResult] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).order('due_date', { ascending: true }),
    supabase.from('task_categories').select('*').eq('user_id', userId),
  ])
  if (tasksResult.error) throw new Error(`Tugas tidak dapat dimuat: ${tasksResult.error.message}`)
  if (categoriesResult.error) throw new Error(`Kategori tugas tidak dapat dimuat: ${categoriesResult.error.message}`)

  const categoryNames = new Map(categoriesResult.data.map((category) => [category.id, category.name]))
  return tasksResult.data.map((task): Task => ({
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    dueDate: task.due_date?.slice(0, 10) ?? '',
    priority: task.priority === 'high' ? 'High' : task.priority === 'low' ? 'Low' : 'Medium',
    status: task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'To Do',
    category: task.category_id ? categoryNames.get(task.category_id) ?? 'Uncategorized' : 'Uncategorized',
    completedAt: task.completed_at?.slice(0, 10),
  }))
}

async function findOrCreateTaskCategory(userId: string, categoryName: string) {
  const name = categoryName.trim()
  if (!name || name === 'Uncategorized') return null
  const { data, error } = await supabase
    .from('task_categories')
    .upsert({ user_id: userId, name }, { onConflict: 'user_id,name' })
    .select('id')
    .single()
  if (error) throw new Error(`Kategori tugas tidak dapat disimpan: ${error.message}`)
  return data.id
}

export async function saveTask(userId: string, taskId: string | undefined, task: Omit<Task, 'id'>) {
  const categoryId = await findOrCreateTaskCategory(userId, task.category)
  const values = {
    category_id: categoryId,
    title: task.title.trim(),
    description: task.description.trim() || null,
    priority: priorityToDatabase[task.priority],
    status: statusToDatabase[task.status],
    due_date: task.dueDate ? `${task.dueDate}T00:00:00.000Z` : null,
    completed_at: task.status === 'Completed' ? task.completedAt ? `${task.completedAt}T00:00:00.000Z` : new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const result = taskId
    ? await supabase.from('tasks').update(values).eq('id', taskId).eq('user_id', userId).select('id').maybeSingle()
    : await supabase.from('tasks').insert({ ...values, user_id: userId }).select('id').single()
  if (result.error) throw new Error(`Tugas tidak dapat disimpan: ${result.error.message}`)
  if (!result.data) throw new Error('Tugas tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya.')
}

export async function deleteTask(userId: string, taskId: string) {
  const { data, error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId).select('id').maybeSingle()
  if (error) throw new Error(`Tugas tidak dapat dihapus: ${error.message}`)
  if (!data) throw new Error('Tugas tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.')
}

type Table<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type TimestampFields = {
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        { id: string; full_name: string | null; email: string | null; avatar_url: string | null; currency: string } & TimestampFields,
        { id: string; full_name?: string | null; email?: string | null; avatar_url?: string | null; currency?: string; created_at?: string; updated_at?: string },
        { full_name?: string | null; email?: string | null; avatar_url?: string | null; currency?: string; updated_at?: string }
      >
      task_categories: Table<
        { id: string; user_id: string; name: string; color: string; created_at: string },
        { id?: string; user_id: string; name: string; color?: string; created_at?: string },
        { name?: string; color?: string }
      >
      tasks: Table<
        { id: string; user_id: string; category_id: string | null; title: string; description: string | null; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'completed'; due_date: string | null; completed_at: string | null } & TimestampFields,
        { id?: string; user_id: string; category_id?: string | null; title: string; description?: string | null; priority?: 'low' | 'medium' | 'high'; status?: 'todo' | 'in_progress' | 'completed'; due_date?: string | null; completed_at?: string | null; created_at?: string; updated_at?: string },
        { category_id?: string | null; title?: string; description?: string | null; priority?: 'low' | 'medium' | 'high'; status?: 'todo' | 'in_progress' | 'completed'; due_date?: string | null; completed_at?: string | null; updated_at?: string }
      >
      financial_categories: Table<
        { id: string; user_id: string; name: string; type: 'income' | 'expense'; icon: string | null; color: string; created_at: string },
        { id?: string; user_id: string; name: string; type: 'income' | 'expense'; icon?: string | null; color?: string; created_at?: string },
        { name?: string; type?: 'income' | 'expense'; icon?: string | null; color?: string }
      >
      transactions: Table<
        { id: string; user_id: string; category_id: string | null; title: string; amount: number; type: 'income' | 'expense'; transaction_date: string; payment_method: string | null; notes: string | null } & TimestampFields,
        { id?: string; user_id: string; category_id?: string | null; title: string; amount: number; type: 'income' | 'expense'; transaction_date?: string; payment_method?: string | null; notes?: string | null; created_at?: string; updated_at?: string },
        { category_id?: string | null; title?: string; amount?: number; type?: 'income' | 'expense'; transaction_date?: string; payment_method?: string | null; notes?: string | null; updated_at?: string }
      >
      budgets: Table<
        { id: string; user_id: string; category_id: string | null; name: string; amount: number; period_month: string } & TimestampFields,
        { id?: string; user_id: string; category_id?: string | null; name: string; amount: number; period_month: string; created_at?: string; updated_at?: string },
        { category_id?: string | null; name?: string; amount?: number; period_month?: string; updated_at?: string }
      >
      savings_goals: Table<
        { id: string; user_id: string; name: string; description: string | null; target_amount: number; deadline: string | null; status: 'active' | 'completed' | 'paused' } & TimestampFields,
        { id?: string; user_id: string; name: string; description?: string | null; target_amount: number; deadline?: string | null; status?: 'active' | 'completed' | 'paused'; created_at?: string; updated_at?: string },
        { name?: string; description?: string | null; target_amount?: number; deadline?: string | null; status?: 'active' | 'completed' | 'paused'; updated_at?: string }
      >
      savings_contributions: Table<
        { id: string; goal_id: string; user_id: string; amount: number; contribution_date: string; notes: string | null; created_at: string },
        { id?: string; goal_id: string; user_id: string; amount: number; contribution_date?: string; notes?: string | null; created_at?: string },
        { goal_id?: string; amount?: number; contribution_date?: string; notes?: string | null }
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type GoalCategory = 'fitness' | 'business' | 'financial' | 'personal'
export type GoalStatus = 'active' | 'completed' | 'paused'
export type TodoPriority = 'most_important' | 'important' | 'least_important'
export type TodoCategory = 'personal' | 'business' | 'fitness' | 'financial'

// Alias for backward compat
export type TaskPriority = TodoPriority

export interface Goal {
  id: string
  title: string
  category: GoalCategory
  target_date: string | null
  progress: number
  status: GoalStatus
  notes: string | null
  created_at: string
}

export interface Milestone {
  id: string
  goal_id: string
  title: string
  completed: boolean
  created_at: string
}

export interface Todo {
  id: string
  goal_id: string | null
  title: string
  priority: TodoPriority
  deadline: string | null
  category: TodoCategory
  completed: boolean
  streak: number
  created_at: string
}

// Alias for backward compat
export type Task = Todo

export interface DailyBrief {
  id: string
  date: string
  notes: string | null
  created_at: string
}

export interface Integration {
  id: string
  name: string
  connected: boolean
  last_synced: string | null
}

export interface MetricCard {
  label: string
  value: string
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: string
}

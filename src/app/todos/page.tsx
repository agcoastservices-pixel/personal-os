'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn, priorityConfig } from '@/lib/utils'
import { Todo, TodoPriority, TodoCategory } from '@/types'
import { isPast, isToday, format } from 'date-fns'

const PRIORITY_ORDER: TodoPriority[] = ['most_important', 'important', 'least_important']

const CATEGORIES: { value: TodoCategory; label: string }[] = [
  { value: 'business', label: 'Business' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'financial', label: 'Financial' },
  { value: 'personal', label: 'Personal' },
]

function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false
  const d = new Date(deadline)
  return isPast(d) && !isToday(d)
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return ''
  const d = new Date(deadline)
  if (isToday(d)) return 'Today'
  return format(d, 'MMM d')
}

const seed: Todo[] = []

function sortTodos(todos: Todo[]): Todo[] {
  const overdue = todos.filter(t => !t.completed && isOverdue(t.deadline))
  const pending = todos.filter(t => !t.completed && !isOverdue(t.deadline))
  const done = todos.filter(t => t.completed)

  const byPriority = (a: Todo, b: Todo) => {
    const pa = PRIORITY_ORDER.indexOf(a.priority)
    const pb = PRIORITY_ORDER.indexOf(b.priority)
    if (pa !== pb) return pa - pb
    // then by deadline (earliest first)
    if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    return 0
  }

  return [
    ...overdue.sort(byPriority),
    ...pending.sort(byPriority),
    ...done,
  ]
}

type CategoryFilter = 'all' | TodoCategory

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>(seed)
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all')
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<TodoPriority>('important')
  const [newDeadline, setNewDeadline] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newCategory, setNewCategory] = useState<TodoCategory>('personal')

  const toggle = (id: string) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))

  const addTodo = () => {
    if (!newTitle.trim()) return
    let deadline: string | null = null
    if (newDeadline) {
      const dt = newTime ? `${newDeadline}T${newTime}` : `${newDeadline}T23:59`
      deadline = new Date(dt).toISOString()
    }
    const todo: Todo = {
      id: Date.now().toString(),
      goal_id: null,
      title: newTitle.trim(),
      priority: newPriority,
      deadline,
      category: newCategory,
      completed: false,
      streak: 0,
      created_at: new Date().toISOString(),
    }
    setTodos(prev => [...prev, todo])
    setNewTitle('')
    setNewDeadline('')
    setNewTime('')
    setAdding(false)
  }

  const deleteTodo = (id: string) =>
    setTodos(prev => prev.filter(t => t.id !== id))

  const filtered = catFilter === 'all'
    ? todos
    : todos.filter(t => t.category === catFilter)

  const sorted = sortTodos(filtered)

  const completedCount = todos.filter(t => t.completed).length
  const total = todos.length

  return (
    <div className="px-4 pt-5 pb-2 md:px-8 md:pt-8 max-w-[780px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">To-Do List</h1>
          <p className="text-sm text-white/30 mt-0.5">{completedCount} of {total} done</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ background: '#3d91ff' }}
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full progress-bar transition-all duration-500"
          style={{ width: `${(completedCount / Math.max(total, 1)) * 100}%` }}
        />
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'var(--surface-2)', border: '1px solid rgba(61,145,255,0.3)' }}>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="What do you need to do?"
            autoFocus
            className="w-full bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none mb-4"
          />

          {/* Priority selector */}
          <div className="flex gap-2 mb-3">
            {PRIORITY_ORDER.map(p => {
              const cfg = priorityConfig[p]
              return (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all',
                    newPriority === p ? `${cfg.bg} ${cfg.text}` : 'text-white/30 bg-white/[0.04]'
                  )}
                >
                  <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                  {cfg.label}
                </button>
              )
            })}
          </div>

          {/* Category selector */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setNewCategory(c.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all',
                  newCategory === c.value
                    ? 'bg-white/[0.12] text-white'
                    : 'text-white/30 bg-white/[0.04]'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Date + time */}
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
              className="flex-1 bg-white/[0.06] border rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', colorScheme: 'dark' }}
            />
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="w-28 bg-white/[0.06] border rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', colorScheme: 'dark' }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addTodo}
              disabled={!newTitle.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-30"
              style={{ background: '#3d91ff' }}
            >
              Add Todo
            </button>
            <button
              onClick={() => { setAdding(false); setNewTitle('') }}
              className="px-4 py-2.5 rounded-xl text-sm text-white/40"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 mb-4 scrollbar-none">
        {(['all', ...CATEGORIES.map(c => c.value)] as CategoryFilter[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all',
              catFilter === cat
                ? 'bg-white/[0.12] text-white'
                : 'text-white/30 bg-white/[0.04]'
            )}
          >
            {cat === 'all' ? 'All' : CATEGORIES.find(c => c.value === cat)?.label ?? cat}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="space-y-2">
        {sorted.map(todo => {
          const p = priorityConfig[todo.priority]
          const overdue = isOverdue(todo.deadline)
          return (
            <div
              key={todo.id}
              className={cn(
                'rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all',
                overdue && !todo.completed
                  ? 'border border-w-red/25 bg-red-500/5'
                  : ''
              )}
              style={!(overdue && !todo.completed)
                ? { background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }
                : {}}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(todo.id)}
                className={cn(
                  'w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all',
                  todo.completed
                    ? 'bg-w-blue border-w-blue'
                    : overdue
                      ? 'border-w-red/50'
                      : 'border-white/20'
                )}
              >
                {todo.completed && (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm leading-snug',
                  todo.completed
                    ? 'line-through text-white/25'
                    : overdue ? 'text-white/90' : 'text-white/80'
                )}>
                  {todo.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {todo.deadline && (
                    <span className={cn(
                      'text-[10px] font-medium',
                      overdue && !todo.completed ? 'text-w-red' : 'text-white/25'
                    )}>
                      {overdue && !todo.completed ? 'Overdue · ' : ''}{formatDeadline(todo.deadline)}
                    </span>
                  )}
                  <span className="text-[10px] text-white/20 capitalize">
                    {CATEGORIES.find(c => c.value === todo.category)?.label}
                  </span>
                </div>
              </div>

              {/* Priority dot */}
              <div className={cn('w-2 h-2 rounded-full shrink-0', p.dot)} />

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="w-6 h-6 flex items-center justify-center text-white/15 hover:text-white/40 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div className="text-center py-16 text-white/20">
            <p className="text-sm">All clear</p>
          </div>
        )}
      </div>
    </div>
  )
}

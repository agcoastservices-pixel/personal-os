'use client'

import { useState } from 'react'
import { Plus, Target, ChevronRight, Flame } from 'lucide-react'
import Link from 'next/link'
import { cn, categoryColors, formatDate } from '@/lib/utils'
import { Goal, GoalCategory } from '@/types'
import GoalModal from '@/components/goals/GoalModal'

const mockGoals: Goal[] = []

const categories: { value: GoalCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'business', label: 'Business' },
  { value: 'financial', label: 'Financial' },
  { value: 'personal', label: 'Personal' },
]

export default function GoalsPage() {
  const [filter, setFilter] = useState<GoalCategory | 'all'>('all')
  const [goals, setGoals] = useState(mockGoals)
  const [showModal, setShowModal] = useState(false)

  const filtered = filter === 'all' ? goals : goals.filter(g => g.category === filter)
  const grouped = categories.slice(1).reduce((acc, cat) => {
    const items = filtered.filter(g => g.category === cat.value)
    if (items.length) acc[cat.value as GoalCategory] = items
    return acc
  }, {} as Record<GoalCategory, Goal[]>)

  const handleCreate = (goal: Omit<Goal, 'id' | 'created_at'>) => {
    const newGoal: Goal = { ...goal, id: Date.now().toString(), created_at: new Date().toISOString() }
    setGoals(prev => [newGoal, ...prev])
    setShowModal(false)
  }

  return (
    <div className="min-h-screen px-4 pt-5 pb-4 md:px-8 md:pt-8 max-w-[900px] md:mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-zinc-100">Goals</h1>
          </div>
          <p className="text-sm text-zinc-500">
            {goals.filter(g => g.status === 'active').length} active · {goals.filter(g => g.status === 'completed').length} completed
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 mb-8 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === cat.value
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Goals by category */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, categoryGoals]) => {
          const colors = categoryColors[category as GoalCategory]
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                <h2 className={cn('text-xs font-semibold uppercase tracking-wider', colors.text)}>
                  {category}
                </h2>
                <span className="text-xs text-zinc-600">({categoryGoals.length})</span>
              </div>

              <div className="space-y-2">
                {categoryGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <Target className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No goals in this category yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <GoalModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}

function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block group bg-surface-2 border border-zinc-800/60 hover:border-zinc-700/60 rounded-xl p-4 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Progress ring */}
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#27272a" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - goal.progress / 100)}`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-zinc-300">
            {goal.progress}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors truncate">
              {goal.title}
            </h3>
            {goal.status === 'paused' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 shrink-0">
                paused
              </span>
            )}
          </div>

          {goal.notes && (
            <p className="text-xs text-zinc-600 truncate mb-2">{goal.notes}</p>
          )}

          <div className="flex items-center gap-3">
            {goal.target_date && (
              <span className="text-[11px] text-zinc-600">
                Target: {formatDate(goal.target_date)}
              </span>
            )}
            {goal.progress >= 80 && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <Flame className="w-3 h-3" /> On track
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0 mt-0.5" />
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full progress-bar rounded-full transition-all duration-500"
          style={{ width: `${goal.progress}%` }}
        />
      </div>
    </Link>
  )
}

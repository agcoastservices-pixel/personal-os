'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Check,
  Pencil,
  Trash2,
  Flag,
  Calendar,
  StickyNote,
} from 'lucide-react'
import Link from 'next/link'
import { cn, categoryColors, formatDate } from '@/lib/utils'
import { Goal, Milestone, Task } from '@/types'
import GoalModal from '@/components/goals/GoalModal'

// Goals, milestones, and tasks — all empty until populated from DB or user input
const mockGoals: Record<string, Goal> = {}
const mockMilestones: Record<string, Milestone[]> = {}
const mockTasks: Record<string, Task[]> = {}

export default function GoalDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [goal, setGoal] = useState<Goal | null>(mockGoals[id] ?? null)
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones[id] ?? [])
  const [tasks] = useState<Task[]>(mockTasks[id] ?? [])
  const [showEditModal, setShowEditModal] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const [addingMilestone, setAddingMilestone] = useState(false)

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Goal not found</p>
          <Link href="/goals" className="text-blue-400 text-sm">← Back to Goals</Link>
        </div>
      </div>
    )
  }

  const colors = categoryColors[goal.category]
  const completedMilestones = milestones.filter(m => m.completed).length

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m))
  }

  const addMilestone = () => {
    if (!newMilestone.trim()) return
    const milestone: Milestone = {
      id: Date.now().toString(),
      goal_id: goal.id,
      title: newMilestone.trim(),
      completed: false,
      created_at: new Date().toISOString(),
    }
    setMilestones(prev => [...prev, milestone])
    setNewMilestone('')
    setAddingMilestone(false)
  }

  const handleEdit = (updated: Omit<Goal, 'id' | 'created_at'>) => {
    setGoal(prev => prev ? { ...prev, ...updated } : prev)
    setShowEditModal(false)
  }

  return (
    <div className="min-h-screen p-8 max-w-[800px] mx-auto">
      {/* Back nav */}
      <Link
        href="/goals"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Goals
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md', colors.bg, colors.text)}>
              {goal.category}
            </span>
            {goal.status === 'paused' && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-500 font-medium">
                paused
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">{goal.title}</h1>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-zinc-200 transition-all"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100 tabular-nums">{goal.progress}%</div>
          <div className="text-xs text-zinc-500 mt-0.5">Progress</div>
        </div>
        <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100 tabular-nums">
            {completedMilestones}/{milestones.length}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">Milestones</div>
        </div>
        <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100 tabular-nums">
            {tasks.filter(t => t.completed).length}/{tasks.length}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">Tasks today</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Overall progress</span>
          <span>{goal.progress}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full progress-bar rounded-full transition-all duration-700"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-300">Milestones</h2>
            </div>
            <button
              onClick={() => setAddingMilestone(true)}
              className="text-zinc-500 hover:text-blue-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {milestones.map(milestone => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 group"
              >
                <button
                  onClick={() => toggleMilestone(milestone.id)}
                  className={cn(
                    'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all',
                    milestone.completed
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-zinc-700 hover:border-zinc-500'
                  )}
                >
                  {milestone.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <span className={cn(
                  'text-sm flex-1',
                  milestone.completed ? 'line-through text-zinc-600' : 'text-zinc-300'
                )}>
                  {milestone.title}
                </span>
                <button className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {addingMilestone && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addMilestone(); if (e.key === 'Escape') setAddingMilestone(false) }}
                  placeholder="Milestone title..."
                  autoFocus
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-600/60"
                />
                <button onClick={addMilestone} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Add</button>
              </div>
            )}

            {milestones.length === 0 && !addingMilestone && (
              <p className="text-xs text-zinc-600 py-2">No milestones yet</p>
            )}
          </div>
        </div>

        {/* Tasks & Info */}
        <div className="space-y-4">
          {/* Today's tasks */}
          <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-300">Today&apos;s Tasks</h2>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                      task.completed ? 'bg-blue-600 border-blue-600' : 'border-zinc-700'
                    )}>
                      {task.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className={cn('text-sm flex-1', task.completed ? 'line-through text-zinc-600' : 'text-zinc-300')}>
                      {task.title}
                    </span>
                    {task.streak > 0 && (
                      <span className="text-[10px] text-amber-500 font-medium tabular-nums">
                        {task.streak}d
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">No tasks linked to this goal</p>
            )}
          </div>

          {/* Notes & target */}
          <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-300">Details</h2>
            </div>
            {goal.target_date && (
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-zinc-500">Target date</span>
                <span className="text-zinc-300">{formatDate(goal.target_date)}</span>
              </div>
            )}
            {goal.notes && (
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">{goal.notes}</p>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <GoalModal
          onClose={() => setShowEditModal(false)}
          onCreate={handleEdit}
          initialData={goal}
        />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { cn, priorityConfig } from '@/lib/utils'
import { Todo } from '@/types'
import { Check } from 'lucide-react'

interface TaskRowProps {
  task: Todo
  onToggle?: (id: string, completed: boolean) => void
}

export default function TaskRow({ task, onToggle }: TaskRowProps) {
  const [completed, setCompleted] = useState(task.completed)

  const toggle = () => {
    const next = !completed
    setCompleted(next)
    onToggle?.(task.id, next)
  }

  const p = priorityConfig[task.priority]

  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        onClick={toggle}
        className={cn(
          'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-150',
          completed
            ? 'bg-w-blue border-w-blue'
            : 'border-white/20'
        )}
      >
        {completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <span className={cn(
        'flex-1 text-sm transition-all duration-150 leading-snug',
        completed ? 'line-through text-white/25' : 'text-white/75'
      )}>
        {task.title}
      </span>

      <div className={cn('w-2 h-2 rounded-full shrink-0', p.dot)} />
    </div>
  )
}

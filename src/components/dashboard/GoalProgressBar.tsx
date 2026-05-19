import { cn, categoryColors } from '@/lib/utils'
import { Goal } from '@/types'
import Link from 'next/link'

interface GoalProgressBarProps {
  goal: Goal
}

export default function GoalProgressBar({ goal }: GoalProgressBarProps) {
  const colors = categoryColors[goal.category]

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block group py-3 hover:bg-zinc-800/30 -mx-1 px-1 rounded-lg transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
          <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
            {goal.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', colors.bg, colors.text)}>
            {goal.category}
          </span>
          <span className="text-xs tabular-nums text-zinc-500">{goal.progress}%</span>
        </div>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full progress-bar rounded-full transition-all duration-500"
          style={{ width: `${goal.progress}%` }}
        />
      </div>
    </Link>
  )
}

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ReactNode
  accentColor?: string
  description?: string
}

export default function MetricCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  accentColor = 'text-blue-400',
  description,
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-700/60 transition-colors">
      <div className="flex items-start justify-between">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-800', accentColor)}>
          {icon}
        </div>
        {trend && trendValue && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              trend === 'up' && 'text-emerald-400 bg-emerald-500/10',
              trend === 'down' && 'text-red-400 bg-red-500/10',
              trend === 'neutral' && 'text-zinc-400 bg-zinc-800'
            )}
          >
            <TrendIcon className="w-3 h-3" />
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</span>
          {unit && <span className="text-sm text-zinc-500">{unit}</span>}
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        {description && <p className="text-[11px] text-zinc-600 mt-1">{description}</p>}
      </div>
    </div>
  )
}

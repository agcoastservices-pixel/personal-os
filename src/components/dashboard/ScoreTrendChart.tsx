'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'

interface Props {
  data: { date: string; score: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-0.5">{label}</p>
      <p className="text-zinc-100 font-semibold">{payload[0].value} <span className="text-zinc-500 font-normal">/ 100</span></p>
    </div>
  )
}

export default function ScoreTrendChart({ data, label }: Props) {
  const avg = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length)
  const recent = data.slice(-7)
  const recentAvg = Math.round(recent.reduce((s, d) => s + d.score, 0) / recent.length)
  const trend = recentAvg - avg

  const thinned = data.filter((_, i) => i % 3 === 0 || i === data.length - 1)

  return (
    <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">Score Trend</h2>
          <p className="text-[11px] text-zinc-600">{label ?? `${data.length}-day history`}</p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-[11px] text-zinc-600">30-day avg</p>
            <p className="text-sm font-bold text-zinc-300 tabular-nums">{avg}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-600">7-day trend</p>
            <p className={`text-sm font-bold tabular-nums ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={thinned} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: '#52525b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[20, 100]}
            tick={{ fill: '#52525b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
          <ReferenceLine y={avg} stroke="#3f3f46" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#scoreGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1d4ed8', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

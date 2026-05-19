'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { BodyMetric } from '@/lib/performance-data'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-zinc-100 font-semibold tabular-nums">{p.value}{p.name === 'Body Fat' ? '%' : ' lb'}</span>
        </div>
      ))}
    </div>
  )
}

export default function BodyCompositionChart({ data }: { data: BodyMetric[] }) {
  const thinned = data.filter((_, i) => i % 4 === 0 || i === data.length - 1)

  return (
    <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">Body Composition</h2>
          <p className="text-[11px] text-zinc-600">60-day trend</p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-zinc-500">Weight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-zinc-500">Body Fat %</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={thinned} margin={{ top: 5, right: 0, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis yAxisId="weight" domain={['dataMin - 3', 'dataMax + 3']} tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} />
          <YAxis yAxisId="bf" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} unit="%" />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
          <ReferenceLine yAxisId="weight" y={185} stroke="#10b981" strokeDasharray="4 3" label={{ value: 'Goal 185', fill: '#10b981', fontSize: 10, position: 'right' }} />
          <Area yAxisId="weight" type="monotone" dataKey="weight" name="Weight" stroke="#3b82f6" strokeWidth={2} fill="url(#weightGrad)" dot={false} activeDot={{ r: 3 }} />
          <Line yAxisId="bf" type="monotone" dataKey="bodyFat" name="Body Fat" stroke="#f59e0b" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} strokeDasharray="4 2" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

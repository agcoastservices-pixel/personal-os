'use client'

import { useState, useEffect, useRef } from 'react'
import { Briefcase, Play, Square, TrendingUp, Users, DollarSign, Clock, Target } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import { mockBusinessHistory, filterByDateRange, aggregateWeekly, aggregateMonthly } from '@/lib/business-data'
import { useTimeRange } from '@/contexts/TimeRangeContext'
import { getPresetDates } from '@/lib/time-range'
import TimeRangePicker from '@/components/shared/TimeRangePicker'
import { cn } from '@/lib/utils'

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-zinc-100 font-semibold">
            {p.name.includes('Revenue') || p.name.includes('Spend') ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function MetricInput({ label, value, onChange, prefix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <label className="block text-xs text-zinc-500 mb-2">{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-zinc-500 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent text-xl font-bold text-zinc-100 focus:outline-none placeholder:text-zinc-700"
          placeholder="0"
        />
      </div>
    </div>
  )
}

function EmptyChart({ height = 140 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <p className="text-xs text-zinc-600">No data yet — log daily metrics above</p>
    </div>
  )
}

export default function BusinessPage() {
  const allData = mockBusinessHistory()

  const { range } = useTimeRange()
  const { start, end } = getPresetDates(range.preset, new Date(), range.customStart, range.customEnd)
  const filteredData = filterByDateRange(allData, start, end)

  type ChartPoint = { date: string; revenue: number; leads: number; adSpend: number }
  const chartData: ChartPoint[] =
    range.granularity === 'monthly' ? aggregateMonthly(filteredData) :
    range.granularity === 'weekly'  ? aggregateWeekly(filteredData)  :
    filteredData

  const periodRevenue = filteredData.reduce((s, d) => s + d.revenue, 0)
  const periodLeads   = filteredData.reduce((s, d) => s + d.leads, 0)
  const periodSpend   = filteredData.reduce((s, d) => s + d.adSpend, 0)
  const avgDailyRev   = filteredData.length > 0 ? Math.round(periodRevenue / filteredData.length) : 0
  const periodCpl     = periodLeads > 0 ? Math.round(periodSpend / periodLeads) : 0

  const revenueLabel = range.granularity === 'monthly' ? 'Monthly Revenue' : range.granularity === 'weekly' ? 'Weekly Revenue' : 'Daily Revenue'

  const [revenue, setRevenue]   = useState('')
  const [leads, setLeads]       = useState('')
  const [adSpend, setAdSpend]   = useState('')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds]     = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isTimerRunning])

  const hoursWorked = timerSeconds / 3600

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const hasChartData = chartData.length > 0

  return (
    <div className="min-h-screen px-4 pt-5 pb-4 md:px-8 md:pt-8 max-w-[1100px] md:mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 md:mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-zinc-100">Business</h1>
          </div>
          <p className="text-sm text-zinc-500">HVAC — daily metrics &amp; trends</p>
        </div>

        {/* Work timer */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shrink-0">
          <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="text-sm font-mono text-zinc-200 tabular-nums">{formatTimer(timerSeconds)}</span>
          <button
            onClick={() => setIsTimerRunning(r => !r)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
              isTimerRunning
                ? 'bg-red-600/15 text-red-400 border border-red-600/30'
                : 'bg-emerald-600/15 text-emerald-400 border border-emerald-600/30'
            )}
          >
            {isTimerRunning
              ? <><Square className="w-3 h-3" /><span className="hidden sm:inline ml-1">Stop</span></>
              : <><Play className="w-3 h-3" /><span className="hidden sm:inline ml-1">Start</span></>}
          </button>
        </div>
      </div>

      {/* Time range picker */}
      <div className="rounded-2xl p-4 mb-5 md:mb-6"
        style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">Time Range</p>
        <TimeRangePicker />
      </div>

      {/* Today's inputs */}
      <div className="mb-5 md:mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Log Today</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricInput label="Revenue ($)" value={revenue} onChange={setRevenue} />
          <MetricInput label="Leads" value={leads} onChange={setLeads} />
          <MetricInput label="Ad Spend ($)" value={adSpend} onChange={setAdSpend} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-2">Hours Worked</p>
            <p className="text-xl font-bold text-zinc-100">
              {hoursWorked > 0 ? hoursWorked.toFixed(1) : '—'}
              {hoursWorked > 0 && <span className="text-sm text-zinc-500 ml-1">h</span>}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">from timer</p>
          </div>
        </div>
      </div>

      {/* Calculated KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 md:mb-8">
        {[
          { label: 'CPL (Period)',    value: periodCpl > 0   ? `$${periodCpl}`                    : '—', icon: Target,    color: 'text-purple-400', sub: 'spend ÷ leads' },
          { label: 'Avg Daily Rev',  value: avgDailyRev > 0  ? `$${avgDailyRev.toLocaleString()}` : '—', icon: Clock,     color: 'text-blue-400',   sub: 'per day' },
          { label: 'Period Revenue', value: periodRevenue > 0 ? `$${periodRevenue.toLocaleString()}` : '—', icon: TrendingUp, color: 'text-emerald-400', sub: 'total in range' },
          { label: 'Total Leads',    value: periodLeads > 0  ? periodLeads.toString()             : '—', icon: Users,    color: 'text-amber-400',  sub: 'in period' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
            <div className={cn('w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mb-3', kpi.color)}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{kpi.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{kpi.label}</p>
            <p className="text-[11px] text-zinc-700 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-300">Trends</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue chart */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-300">{revenueLabel}</h3>
            {avgDailyRev > 0 && (
              <span className="ml-auto text-xs text-zinc-500">avg ${avgDailyRev.toLocaleString()}/day</span>
            )}
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#3f3f46' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Leads + Spend chart */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-300">Leads &amp; Ad Spend</h3>
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis yAxisId="leads" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} />
                <YAxis yAxisId="spend" orientation="right" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} tickFormatter={v => `$${v}`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar yAxisId="leads" dataKey="leads" name="Leads" fill="#3b82f6" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                <Bar yAxisId="spend" dataKey="adSpend" name="Ad Spend" fill="#8b5cf6" fillOpacity={0.5} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>
    </div>
  )
}

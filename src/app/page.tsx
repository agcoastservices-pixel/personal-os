'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ArrowRight, Droplets, UtensilsCrossed, TrendingUp, Activity, Landmark, Calendar, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import DailyScoreGauge from '@/components/dashboard/DailyScoreGauge'
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart'
import GoalProgressBar from '@/components/dashboard/GoalProgressBar'
import TimeRangePicker from '@/components/shared/TimeRangePicker'
import { getGreeting } from '@/lib/utils'
import { calculateDailyScore, emptyTodayInputs, mockScoreHistory, DailyScoreInputs } from '@/lib/scoring'
import { useTimeRange } from '@/contexts/TimeRangeContext'
import { getPresetDates, labelForPreset } from '@/lib/time-range'
import { Todo, Goal } from '@/types'
import { priorityConfig, cn } from '@/lib/utils'

export default function DashboardPage() {
  const today = new Date()
  const greeting = getGreeting()
  const [todos, setTodos] = useState<Todo[]>([])
  const [goals] = useState<Goal[]>([])
  const [scoreInputs, setScoreInputs] = useState<DailyScoreInputs>(emptyTodayInputs)

  const { range } = useTimeRange()
  const allScoreHistory = mockScoreHistory()
  const { start, end } = getPresetDates(range.preset, new Date(), range.customStart, range.customEnd)
  const daysInRange = Math.max(7, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
  const scoreHistory = allScoreHistory.slice(-daysInRange)
  const rangeLabel = labelForPreset(range.preset, range.customStart, range.customEnd)

  const scoreData = calculateDailyScore(scoreInputs)
  const pendingCount = todos.filter(t => !t.completed).length

  const toggleTodo = (id: string) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))

  const setBonus = (key: 'waterGallon' | 'macrosTracked', val: boolean) =>
    setScoreInputs(prev => ({ ...prev, [key]: val }))

  const topTodos = todos
    .filter(t => !t.completed && t.priority === 'most_important')
    .slice(0, 3)

  return (
    <div className="px-4 pt-5 pb-2 md:px-8 md:pt-8 max-w-[780px]">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25 mb-0.5">
          {format(today, 'EEEE, MMM d')}
        </p>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {greeting}, Alec
        </h1>
        {pendingCount > 0 ? (
          <p className="text-sm text-white/35 mt-0.5">
            {pendingCount} todo{pendingCount !== 1 ? 's' : ''} remaining
          </p>
        ) : (
          <p className="text-sm text-white/20 mt-0.5">No tasks yet today</p>
        )}
      </div>

      {/* Daily Score card */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">Daily Score</p>
          {scoreData.drags.length > 0 && (
            <span className="text-[10px] text-w-red font-medium">
              {scoreData.drags.length} drag{scoreData.drags.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <DailyScoreGauge scoreData={scoreData} />

        {/* Bonus toggles */}
        <div className="mt-3 space-y-2">
          <BonusToggle
            active={scoreInputs.waterGallon}
            onToggle={v => setBonus('waterGallon', v)}
            icon={<Droplets className="w-4 h-4" />}
            label="Drank a gallon of water"
            points={5}
          />
          <BonusToggle
            active={scoreInputs.macrosTracked}
            onToggle={v => setBonus('macrosTracked', v)}
            icon={<UtensilsCrossed className="w-4 h-4" />}
            label="Tracked macros in MyNetDiary"
            points={5}
          />
        </div>
      </div>

      {/* Quick metrics row — show empty shells; real data from integrations */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 mb-4 scrollbar-none">
        {[
          { label: 'Recovery',  value: null, icon: <Activity  className="w-4 h-4" />, color: 'text-w-green', sub: 'WHOOP' },
          { label: 'Revenue',   value: null, icon: <TrendingUp className="w-4 h-4" />, color: 'text-w-blue',  sub: 'Today' },
          { label: 'Balance',   value: null, icon: <Landmark  className="w-4 h-4" />, color: 'text-w-amber', sub: 'Bank' },
          { label: 'Meetings',  value: null, icon: <Calendar  className="w-4 h-4" />, color: 'text-purple-400', sub: 'Today' },
        ].map(m => (
          <div key={m.label} className="shrink-0 rounded-xl px-4 py-3 min-w-[110px]"
            style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={cn('mb-1.5', m.color)}>{m.icon}</div>
            <p className="text-lg font-bold text-white/20 tabular-nums leading-none mb-0.5">—</p>
            <p className="text-[10px] text-white/30">{m.label}</p>
            <p className="text-[9px] text-white/20">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Top priorities */}
      {topTodos.length > 0 && (
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">Top Priorities</p>
            <Link href="/todos" className="text-[10px] text-white/25 hover:text-white/50 flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {topTodos.map((todo, i) => (
              <div key={todo.id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: 'rgba(255,71,87,0.15)', color: '#ff4757' }}>
                  {i + 1}
                </span>
                <span className="text-sm text-white/80 flex-1 leading-snug">{todo.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* To-Do List */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">To-Do List</p>
          <Link href="/todos" className="text-[10px] text-white/25 flex items-center gap-0.5">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {todos.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-white/20 mb-3">No todos yet</p>
            <Link href="/todos"
              className="inline-flex items-center gap-1.5 text-xs text-w-blue/70 hover:text-w-blue transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add your first task
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {todos.slice(0, 5).map(todo => {
              const p = priorityConfig[todo.priority]
              return (
                <button
                  key={todo.id}
                  onClick={() => toggleTodo(todo.id)}
                  className="w-full flex items-center gap-3 py-2.5 text-left active:opacity-70 transition-opacity"
                >
                  <div className={cn(
                    'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                    todo.completed
                      ? 'border-w-blue bg-w-blue'
                      : 'border-white/20'
                  )}>
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={cn(
                    'flex-1 text-sm leading-snug',
                    todo.completed ? 'line-through text-white/25' : 'text-white/80'
                  )}>
                    {todo.title}
                  </span>
                  <div className={cn('w-2 h-2 rounded-full shrink-0', p.dot)} />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Goals */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">Goals</p>
          <Link href="/goals" className="text-[10px] text-white/25 flex items-center gap-0.5">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {goals.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-white/20 mb-3">No goals yet</p>
            <Link href="/goals"
              className="inline-flex items-center gap-1.5 text-xs text-w-blue/70 hover:text-w-blue transition-colors">
              <Plus className="w-3.5 h-3.5" /> Set your first goal
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {goals.map(goal => (
              <GoalProgressBar key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      {/* Time range */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">Time Range</p>
        <TimeRangePicker />
      </div>

      {/* Score trend */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">Score Trend</p>
        {scoreHistory.length > 0 ? (
          <ScoreTrendChart data={scoreHistory} label={rangeLabel} />
        ) : (
          <div className="h-[80px] flex items-center justify-center">
            <p className="text-sm text-white/20">No score history yet</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {[
          { label: 'Finance',      href: '/finance',      sub: 'Revenue & expenses' },
          { label: 'Calendar',     href: '/calendar',     sub: 'Schedule & todos' },
          { label: 'Insights',     href: '/insights',     sub: 'Patterns & trends' },
          { label: 'Integrations', href: '/integrations', sub: 'Connect your apps' },
        ].map(link => (
          <Link key={link.href} href={link.href}
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p className="text-sm font-medium text-white/70">{link.label}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{link.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function BonusToggle({
  active, onToggle, icon, label, points
}: {
  active: boolean
  onToggle: (v: boolean) => void
  icon: React.ReactNode
  label: string
  points: number
}) {
  return (
    <button
      onClick={() => onToggle(!active)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
        active ? 'bg-w-green/10 border border-w-green/20' : ''
      )}
      style={active ? {} : { border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className={cn('shrink-0', active ? 'text-w-green' : 'text-white/25')}>
        {icon}
      </div>
      <span className={cn('flex-1 text-sm text-left leading-snug', active ? 'text-white/80' : 'text-white/35')}>
        {label}
      </span>
      <span className={cn('text-[10px] font-bold shrink-0', active ? 'text-w-green' : 'text-white/20')}>
        +{points}
      </span>
      {/* Toggle pill */}
      <div className={cn(
        'w-9 h-5 rounded-full relative shrink-0 transition-colors',
        active ? 'bg-w-green' : 'bg-white/10'
      )}>
        <div className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
          active ? 'left-[18px]' : 'left-0.5'
        )} />
      </div>
    </button>
  )
}

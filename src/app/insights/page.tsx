'use client'

import { useState } from 'react'
import { Lightbulb, RefreshCw, TrendingUp, TrendingDown, Zap, Brain, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type InsightCategory = 'recovery' | 'training' | 'business' | 'habits'

interface Insight {
  id: string
  category: InsightCategory
  insight_text: string
  confidence_pct: number
  days_observed: number
  recommended_action: string
  trend: 'positive' | 'negative' | 'neutral'
}

const mockInsights: Insight[] = []

const categoryConfig: Record<InsightCategory, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  recovery: { label: 'Recovery', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Zap },
  training: { label: 'Training', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: TrendingUp },
  business: { label: 'Business', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: TrendingUp },
  habits: { label: 'Habits', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Brain },
}

function ConfidencePill({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'text-emerald-400 bg-emerald-500/10' : pct >= 70 ? 'text-blue-400 bg-blue-500/10' : 'text-amber-400 bg-amber-500/10'
  return (
    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', color)}>
      {pct}% confidence
    </span>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const config = categoryConfig[insight.category]
  const Icon = config.icon
  const TrendIcon = insight.trend === 'positive' ? TrendingUp : insight.trend === 'negative' ? TrendingDown : Zap

  return (
    <div className={cn('border rounded-2xl p-5 transition-all hover:border-opacity-60', config.bg)}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5', config.bg)}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('text-[11px] font-semibold uppercase tracking-wider', config.color)}>
              {config.label}
            </span>
            <ConfidencePill pct={insight.confidence_pct} />
            <span className="text-[11px] text-zinc-600">{insight.days_observed} days observed</span>
            <div className={cn(
              'ml-auto flex items-center gap-1 text-[11px] font-medium',
              insight.trend === 'positive' ? 'text-emerald-400' : insight.trend === 'negative' ? 'text-red-400' : 'text-zinc-400'
            )}>
              <TrendIcon className="w-3 h-3" />
              {insight.trend === 'positive' ? 'Working for you' : insight.trend === 'negative' ? 'Costing you' : 'Neutral'}
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-200 leading-relaxed mb-4">{insight.insight_text}</p>

      <div className="bg-black/20 rounded-xl p-3.5 border border-white/5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Recommended Action</span>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{insight.recommended_action}</p>
      </div>
    </div>
  )
}

export default function InsightsPage() {
  const [insights, setInsights] = useState(mockInsights)
  const [filter, setFilter] = useState<InsightCategory | 'all'>('all')
  const [generating, setGenerating] = useState(false)
  const [lastGenerated] = useState('No data yet — connect integrations to generate insights')

  const filtered = filter === 'all' ? insights : insights.filter(i => i.category === filter)

  const regenerate = async () => {
    setGenerating(true)
    try {
      // Example correlations payload — would be built from real Supabase data
      const correlations = [
        { pattern: 'sleep_hours < 6.5 → training_completed = false', frequency: '72%', sample_size: 78 },
        { pattern: 'post_training_day → close_rate_increase', frequency: '81%', sample_size: 54 },
        { pattern: 'screen_time > 2h → tasks_completed_decrease_34pct', frequency: '76%', sample_size: 67 },
        { pattern: 'protein > 180g → hrv_increase_14pct', frequency: '79%', sample_size: 60 },
      ]
      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correlations }),
      })
      const data = await res.json()
      if (data.insights?.length) {
        const newInsights = data.insights.map((ins: Omit<Insight, 'id' | 'confidence_pct' | 'days_observed' | 'trend'> & { confidence_pct?: number; days_observed?: number; trend?: string }, i: number) => ({
          ...ins,
          id: Date.now().toString() + i,
          confidence_pct: ins.confidence_pct ?? 75,
          days_observed: ins.days_observed ?? 90,
          trend: ins.trend ?? 'neutral',
        }))
        setInsights(newInsights)
      }
    } catch (e) {
      console.error('Failed to regenerate:', e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen px-4 pt-5 pb-4 md:px-8 md:pt-8 max-w-[900px] md:mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-zinc-100">Insights</h1>
          </div>
          <p className="text-sm text-zinc-500">
            Pattern recognition across 90 days of data · {lastGenerated}
          </p>
        </div>
        <button
          onClick={regenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', generating && 'animate-spin')} />
          {generating ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {(Object.entries(categoryConfig) as [InsightCategory, typeof categoryConfig[InsightCategory]][]).map(([key, cfg]) => {
          const count = insights.filter(i => i.category === key).length
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                filter === key ? cfg.bg : 'bg-surface-2 border-zinc-800/60 hover:border-zinc-700/60'
              )}
            >
              <p className={cn('text-lg font-bold tabular-nums', cfg.color)}>{count}</p>
              <p className="text-xs text-zinc-500">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Insight cards */}
      <div className="space-y-4">
        {filtered.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <p className="text-center text-xs text-zinc-700 mt-8">
        Patterns identified by Claude AI · Add ANTHROPIC_API_KEY to enable live regeneration
      </p>
    </div>
  )
}

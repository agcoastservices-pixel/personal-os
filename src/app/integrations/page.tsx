'use client'

import { useState } from 'react'
import { Plug, X, CheckCircle2, Circle, ExternalLink, RefreshCw, Utensils, Scale, Smartphone, Activity, CalendarDays, BarChart2, Wrench, Building2, Search, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  connected: boolean
  last_synced: string | null
  Icon: LucideIcon
  color: string
  syncDescription: string
  setupUrl?: string
}

const integrations: Integration[] = [
  {
    id: 'apple-health',
    name: 'Apple Health',
    description: 'Weight, body fat, HRV, sleep, steps, active calories, and workouts',
    category: 'Health',
    connected: false,
    last_synced: null,
    Icon: Heart,
    color: 'text-red-400',
    syncDescription: 'Pulls daily weight, body fat %, resting HRV, sleep stages, step count, active calories, and logged workouts from Apple Health. Because Apple Health is iOS-only, sync works via an iOS Shortcut that runs each morning and pushes data to your OS endpoint — no third-party service required. Setup takes about 2 minutes.',
  },
  {
    id: 'mynetdiary',
    name: 'MyNetDiary',
    description: 'Daily macros — protein, carbs, fat, and calories',
    category: 'Nutrition',
    connected: false,
    last_synced: null,
    Icon: Utensils,
    color: 'text-green-400',
    syncDescription: 'Pulls daily macro totals (protein, carbs, fat, calories) and meal logs from MyNetDiary. Powers the Nutrition sub-score in your Daily Score and the macros-tracked bonus (+5 pts). Surfaces protein and calorie patterns in Insights.',
  },
  {
    id: 'vesync',
    name: 'VeSync Scale',
    description: 'Daily weight and body fat % from your Etekcity smart scale',
    category: 'Health',
    connected: false,
    last_synced: null,
    Icon: Scale,
    color: 'text-indigo-400',
    syncDescription: 'Auto-syncs morning weigh-ins (weight + body fat %) via the VeSync / Etekcity API to the Performance page. Eliminates manual logging and keeps your body composition chart accurate.',
  },
  {
    id: 'screen-time',
    name: 'Screen Time',
    description: 'Daily iPhone screen time — manual or Apple API',
    category: 'Habits',
    connected: false,
    last_synced: null,
    Icon: Smartphone,
    color: 'text-orange-400',
    syncDescription: 'Logs daily total screen time in hours. Used in the Daily Score (Screen Time sub-score) and powers the screen time / task completion correlation in Insights. Can be entered manually or synced via Apple Screen Time API.',
  },
  {
    id: 'whoop',
    name: 'WHOOP',
    description: 'Recovery, strain, and sleep metrics from your WHOOP band',
    category: 'Health',
    connected: false,
    last_synced: null,
    Icon: Activity,
    color: 'text-emerald-400',
    syncDescription: 'Syncs daily recovery score, HRV, sleep performance, and strain. Data appears on your dashboard each morning.',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Your schedule and meetings for the day',
    category: 'Productivity',
    connected: true,
    last_synced: '2 min ago',
    Icon: CalendarDays,
    color: 'text-blue-400',
    syncDescription: 'Pulls today\'s events, meeting count, and next event. Voice agent can reference your schedule in conversations.',
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    description: 'Facebook & Instagram ad spend, ROAS, and performance',
    category: 'Marketing',
    connected: false,
    last_synced: null,
    Icon: BarChart2,
    color: 'text-blue-500',
    syncDescription: 'Syncs daily spend, reach, clicks, conversions, and ROAS. Surfaces anomalies and budget pacing alerts on the dashboard.',
  },
  {
    id: 'housecall-pro',
    name: 'Housecall Pro',
    description: 'Revenue, jobs, and customer data from your field service business',
    category: 'Business',
    connected: false,
    last_synced: null,
    Icon: Wrench,
    color: 'text-amber-400',
    syncDescription: 'Tracks daily revenue, jobs completed, open estimates, and technician utilization. Feeds your revenue metric card.',
  },
  {
    id: 'plaid',
    name: 'Plaid / Bank',
    description: 'Real-time bank balance and transaction data',
    category: 'Finance',
    connected: false,
    last_synced: null,
    Icon: Building2,
    color: 'text-green-400',
    syncDescription: 'Connects to your checking/savings accounts via Plaid. Shows live balance and flags large transactions. No write access — read-only.',
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Search and display campaign performance',
    category: 'Marketing',
    connected: false,
    last_synced: null,
    Icon: Search,
    color: 'text-yellow-400',
    syncDescription: 'Pulls spend, clicks, conversions, and quality scores for your search campaigns. Voice agent can summarize performance on request.',
  },
]

const categories = ['All', 'Health', 'Nutrition', 'Habits', 'Productivity', 'Marketing', 'Business', 'Finance'] as const

export default function IntegrationsPage() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Integration | null>(null)

  const filtered = filter === 'All' ? integrations : integrations.filter(i => i.category === filter)
  const connectedCount = integrations.filter(i => i.connected).length

  return (
    <div className="min-h-screen px-4 pt-5 pb-4 md:px-8 md:pt-8 max-w-[900px] md:mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Plug className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold text-zinc-100">Integrations</h1>
        </div>
        <p className="text-sm text-zinc-500">
          {connectedCount} of {integrations.length} connected
        </p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 mb-8 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === cat
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-zinc-500 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(integration => (
          <button
            key={integration.id}
            onClick={() => setSelected(integration)}
            className="group text-left bg-surface-2 border border-zinc-800/60 hover:border-zinc-700/60 rounded-xl p-5 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', 'bg-white/[0.06]')}>
                <integration.Icon className={cn('w-4 h-4', integration.color)} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors">
                    {integration.name}
                  </h3>
                  <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                    {integration.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{integration.description}</p>

                {integration.last_synced && (
                  <p className="text-[11px] text-zinc-600 mt-2 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5" /> Synced {integration.last_synced}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                {integration.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-700" />
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className={cn(
              'mt-4 flex items-center gap-1.5 text-[11px] font-medium',
              integration.connected ? 'text-emerald-400' : 'text-zinc-600'
            )}>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                integration.connected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'
              )} />
              {integration.connected ? 'Connected' : 'Not connected'}
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <IntegrationModal integration={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function IntegrationModal({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-2 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', 'bg-white/[0.06]')}>
              <integration.Icon className={cn('w-5 h-5', integration.color)} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">{integration.name}</h2>
              <span className="text-xs text-zinc-500">{integration.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status badge */}
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-5',
          integration.connected
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
        )}>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            integration.connected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
          )} />
          {integration.connected ? 'Connected' : 'Not connected'}
          {integration.last_synced && ` · Last synced ${integration.last_synced}`}
        </div>

        {/* What it syncs */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">What this syncs</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{integration.syncDescription}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {integration.connected ? (
            <>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm text-zinc-300 font-medium transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Now
                </button>
                <button className="flex-1 py-2.5 rounded-xl border border-red-900/40 text-sm text-red-500 hover:bg-red-500/10 font-medium transition-colors">
                  Disconnect
                </button>
              </div>
              <p className="text-[11px] text-zinc-700 text-center">Live connections coming soon — this is UI scaffolding</p>
            </>
          ) : (
            <>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm text-white font-medium transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Connect {integration.name}
              </button>
              <p className="text-[11px] text-zinc-700 text-center">Live connections coming soon — this is UI scaffolding</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

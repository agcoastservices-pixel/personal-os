'use client'

import { useState } from 'react'
import { Trophy, Plus, TrendingUp, TrendingDown, Minus, Scale, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PersonalRecord, initialPRs, mockBodyMetrics,
  initialBodyMeasurements, BodyMeasurements, formatFeetInches,
} from '@/lib/performance-data'
import BodyCompositionChart from '@/components/performance/BodyCompositionChart'
import PREditModal from '@/components/performance/PREditModal'
import LogBodyMetricModal from '@/components/performance/LogBodyMetricModal'

const categoryOrder = ['jump', 'strength', 'gymnastics'] as const
const categoryLabels: Record<string, string> = {
  jump: 'Jump & Explosiveness',
  strength: 'Strength Lifts',
  gymnastics: 'Gymnastics / Bodyweight',
}

function formatValue(pr: PersonalRecord): string {
  if (pr.value === null) return '—'
  if (pr.unit === 'bodyweight') return 'BW'
  if (pr.unit === '+lb') return `+${pr.value} lb`
  if (pr.unit === 'inches') return `${pr.value}"`
  if (pr.reps > 1) return `${pr.value} × ${pr.reps}`
  return `${pr.value} lb`
}

function Delta({ pr }: { pr: PersonalRecord }) {
  if (!pr.value || !pr.previousValue) return null
  const sameReps = !pr.previousReps || pr.reps === pr.previousReps
  const delta = Math.round((pr.value - pr.previousValue) * 100) / 100
  const positive = delta > 0
  const Icon = positive ? TrendingUp : delta < 0 ? TrendingDown : Minus

  if (!sameReps) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-medium text-zinc-500">
        {pr.previousValue} × {pr.previousReps} → {pr.value} × {pr.reps}
      </span>
    )
  }

  return (
    <span className={cn(
      'flex items-center gap-0.5 text-[11px] font-medium',
      positive ? 'text-emerald-400' : 'text-red-400'
    )}>
      <Icon className="w-3 h-3" />
      {positive ? '+' : ''}{pr.unit === 'inches' ? `${delta}"` : `${delta} ${pr.reps > 1 ? `× ${pr.reps}` : pr.unit}`}
    </span>
  )
}

function PRCard({ pr, onEdit, isNew }: { pr: PersonalRecord; onEdit: (pr: PersonalRecord) => void; isNew?: boolean }) {
  const isRepPR = pr.reps > 1
  return (
    <button
      onClick={() => onEdit(pr)}
      className={cn(
        'group relative text-left w-full bg-zinc-900 border rounded-xl p-4 transition-all hover:border-zinc-600',
        isNew ? 'border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.15)]' : 'border-zinc-800/80',
        !pr.value && 'opacity-50'
      )}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          NEW PR
        </div>
      )}
      {isRepPR && pr.value && (
        <div className="absolute top-2 right-2 text-[9px] font-bold text-zinc-600 uppercase tracking-wide">
          Top Set
        </div>
      )}

      <p className="text-[11px] text-zinc-500 mb-1 leading-snug">{pr.exercise}</p>
      <p className={cn(
        'text-xl font-black tabular-nums mb-1 transition-colors',
        pr.value ? (isNew ? 'text-emerald-400' : 'text-zinc-100') : 'text-zinc-700'
      )}>
        {formatValue(pr)}
      </p>

      <div className="flex items-center justify-between">
        <Delta pr={pr} />
        {pr.dateAchieved && (
          <span className="text-[10px] text-zinc-700">
            {new Date(pr.dateAchieved).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
          </span>
        )}
      </div>

      {pr.notes && (
        <p className="text-[11px] text-zinc-600 mt-1.5">{pr.notes}</p>
      )}

      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 group-hover:ring-white/10 transition-all pointer-events-none" />
    </button>
  )
}

// Editable body measurement field
function MeasurementField({
  label, value, onSave,
}: {
  label: string
  value: string
  onSave: (inches: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')

  if (editing) {
    return (
      <div className="bg-surface-2 border border-blue-600/40 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 mb-2">{label} <span className="text-zinc-700">(inches)</span></p>
        <input
          type="number"
          step="0.5"
          defaultValue=""
          autoFocus
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. 74"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 text-sm text-center focus:outline-none mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-500"
          >
            <X className="w-3 h-3 inline" />
          </button>
          <button
            onClick={() => { if (input) { onSave(parseFloat(input)); setEditing(false) } }}
            className="flex-1 py-1.5 rounded-lg bg-blue-600 text-xs text-white font-medium"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-surface-2 border border-zinc-800/60 rounded-xl p-4 text-center relative">
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      <button
        onClick={() => setEditing(true)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-400"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  )
}

export default function PerformancePage() {
  const [prs, setPRs] = useState<PersonalRecord[]>(initialPRs)
  const [newPRId, setNewPRId] = useState<string | null>(null)
  const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null)
  const [bodyMetrics] = useState(mockBodyMetrics())
  const [showLogWeight, setShowLogWeight] = useState(false)
  const [measurements, setMeasurements] = useState<BodyMeasurements>(initialBodyMeasurements)

  const grouped = categoryOrder.reduce((acc, cat) => {
    acc[cat] = prs.filter(p => p.category === cat)
    return acc
  }, {} as Record<string, PersonalRecord[]>)

  const handleSavePR = (updated: PersonalRecord) => {
    setPRs(prev => prev.map(p => p.id === updated.id ? updated : p))
    const prev = prs.find(p => p.id === updated.id)
    if (updated.value && prev?.value && updated.value > prev.value && updated.reps >= (prev.reps ?? 1)) {
      setNewPRId(updated.id)
      setTimeout(() => setNewPRId(null), 5000)
    }
    setEditingPR(null)
  }

  const latest = bodyMetrics[bodyMetrics.length - 1]
  const weekAgo = bodyMetrics[bodyMetrics.length - 8]
  const weightDelta = latest && weekAgo ? Math.round((latest.weight - weekAgo.weight) * 10) / 10 : 0

  return (
    <div className="min-h-screen px-4 pt-5 pb-4 md:px-8 md:pt-8 max-w-[1100px] md:mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-zinc-100">Performance</h1>
          </div>
          <p className="text-sm text-zinc-500">Personal records &amp; body composition</p>
        </div>
        <button
          onClick={() => setShowLogWeight(true)}
          className="flex items-center gap-2 px-3 py-2 md:px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
        >
          <Scale className="w-4 h-4" />
          <span className="hidden sm:inline">Log Today</span>
        </button>
      </div>

      {/* Body stats row */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5 md:mb-8">
          {/* Dynamic — from scale */}
          <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-zinc-100">{latest.weight}<span className="text-sm text-zinc-500 ml-1">lb</span></p>
            <p className="text-xs text-zinc-500 mt-0.5">Weight</p>
            <p className={cn('text-[11px] mt-1 font-medium', weightDelta <= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {weightDelta > 0 ? '+' : ''}{weightDelta} lb / wk
            </p>
          </div>
          <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-zinc-100">{latest.bodyFat}<span className="text-sm text-zinc-500 ml-1">%</span></p>
            <p className="text-xs text-zinc-500 mt-0.5">Body Fat</p>
            <p className="text-[11px] text-zinc-600 mt-1">Goal: 12%</p>
          </div>
          <div className="bg-surface-2 border border-zinc-800/60 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-zinc-100">
              {Math.round(latest.weight * (1 - latest.bodyFat / 100))}
              <span className="text-sm text-zinc-500 ml-1">lb</span>
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Lean Mass</p>
          </div>

          {/* Static — editable */}
          <MeasurementField
            label="Height"
            value={formatFeetInches(measurements.heightInches)}
            onSave={v => setMeasurements(m => ({ ...m, heightInches: v }))}
          />
          <MeasurementField
            label="Standing Reach"
            value={formatFeetInches(measurements.standingReachInches)}
            onSave={v => setMeasurements(m => ({ ...m, standingReachInches: v }))}
          />
        </div>
      )}

      {/* Body composition chart */}
      <div className="mb-10">
        <BodyCompositionChart data={bodyMetrics} />
      </div>

      {/* PR Board */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-bold text-zinc-100">PR Board</h2>
        <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
          {prs.filter(p => p.value !== null).length} / {prs.length} set
        </span>
      </div>

      <div className="space-y-8">
        {categoryOrder.map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{categoryLabels[cat]}</h3>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {grouped[cat].map(pr => (
                <PRCard
                  key={pr.id}
                  pr={pr}
                  onEdit={setEditingPR}
                  isNew={pr.id === newPRId}
                />
              ))}
              <button
                onClick={() => {/* future: add custom exercise */}}
                className="flex items-center justify-center gap-2 text-zinc-700 border border-dashed border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:text-zinc-500 transition-all text-xs"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingPR && (
        <PREditModal
          pr={editingPR}
          onClose={() => setEditingPR(null)}
          onSave={handleSavePR}
        />
      )}
      {showLogWeight && (
        <LogBodyMetricModal onClose={() => setShowLogWeight(false)} />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { PersonalRecord } from '@/lib/performance-data'

interface Props {
  pr: PersonalRecord
  onClose: () => void
  onSave: (pr: PersonalRecord) => void
}

export default function PREditModal({ pr, onClose, onSave }: Props) {
  const [value, setValue] = useState(pr.value?.toString() ?? '')
  const [reps, setReps] = useState(pr.reps?.toString() ?? '1')
  const [date, setDate] = useState(pr.dateAchieved?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState(pr.notes ?? '')

  const isLbUnit = pr.unit === 'lb' || pr.unit === '+lb'
  const repsNum = parseInt(reps) || 1

  const handleSave = () => {
    const numVal = value ? parseFloat(value) : null
    onSave({
      ...pr,
      previousValue: pr.value,
      previousReps: pr.reps,
      value: numVal,
      reps: repsNum,
      dateAchieved: date || null,
      notes: notes || undefined,
    })
  }

  const unitLabel = pr.unit === 'bodyweight' ? 'Bodyweight only' : pr.unit === '+lb' ? '+lb added' : pr.unit

  const previewLabel = () => {
    if (!value) return null
    if (pr.unit === 'inches') return `${value}"`
    if (pr.unit === '+lb') return `+${value} lb`
    if (pr.unit === 'bodyweight') return 'BW'
    return repsNum > 1 ? `${value} × ${repsNum}` : `${value} lb`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-2 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">{pr.exercise}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isLbUnit && repsNum > 1 ? 'Top set / rep PR' : 'Personal record'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {pr.unit !== 'bodyweight' && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                Weight <span className="text-zinc-600">({unitLabel})</span>
              </label>
              <input
                type="number"
                step="2.5"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={pr.unit === 'inches' ? 'e.g. 34.5' : 'e.g. 185'}
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-600/60 transition-colors"
              />
            </div>
          )}

          {/* Reps field — only for lb-based lifts */}
          {isLbUnit && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                Reps <span className="text-zinc-600">(1 = 1RM)</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10].map(r => (
                  <button
                    key={r}
                    onClick={() => setReps(r.toString())}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      repsNum === r
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {r === 1 ? '1RM' : r}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="30"
                value={reps}
                onChange={e => setReps(e.target.value)}
                placeholder="Custom"
                className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-600/60 placeholder:text-zinc-700"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Date Achieved</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-600/60 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Notes <span className="text-zinc-700">(optional)</span></label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Context, conditions, etc."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-600/60 placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Preview */}
        {previewLabel() && (
          <div className="mt-4 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
            <span className="text-xs text-zinc-500">Preview: </span>
            <span className="text-sm font-bold text-zinc-100">{previewLabel()}</span>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-400 hover:text-zinc-200 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function LogBodyMetricModal({ onClose }: Props) {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const handleSave = () => {
    // Will write to Supabase body_metrics table
    console.log('Log body metric', { weight, bodyFat, date })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-2 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-100">Log Body Metrics</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-600/60 [color-scheme:dark]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Weight (lb)</label>
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="e.g. 195.4" autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-600/60 placeholder:text-zinc-700" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Body Fat (%)</label>
              <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)}
                placeholder="e.g. 17.5"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-600/60 placeholder:text-zinc-700" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-400 hover:text-zinc-200 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!weight}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm text-white font-medium transition-all">
            Log
          </button>
        </div>
      </div>
    </div>
  )
}

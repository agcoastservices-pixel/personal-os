'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTimeRange } from '@/contexts/TimeRangeContext'
import { Preset, Granularity } from '@/lib/time-range'

const PRESETS: { value: Preset; label: string }[] = [
  { value: '7D',  label: '7D' },
  { value: '30D', label: '30D' },
  { value: '90D', label: '90D' },
  { value: 'MTD', label: 'MTD' },
  { value: 'YTD', label: 'YTD' },
  { value: 'custom', label: 'Custom' },
]

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'daily',   label: 'Day' },
  { value: 'weekly',  label: 'Week' },
  { value: 'monthly', label: 'Month' },
]

interface Props {
  showGranularity?: boolean
  className?: string
}

export default function TimeRangePicker({ showGranularity = true, className }: Props) {
  const { range, setPreset, setGranularity, setCustom } = useTimeRange()
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState(range.customStart)
  const [customEnd, setCustomEnd] = useState(range.customEnd)

  const handlePreset = (p: Preset) => {
    setPreset(p)
    setShowCustom(p === 'custom')
  }

  const applyCustom = () => {
    if (customStart && customEnd) {
      setCustom(customStart, customEnd)
      setShowCustom(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
          {/* Preset chips */}
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => handlePreset(p.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                range.preset === p.value
                  ? 'bg-w-blue text-white'
                  : 'bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.09]'
              )}
            >
              {p.label}
            </button>
          ))}

          {/* Separator */}
          {showGranularity && (
            <>
              <div className="w-px h-4 bg-white/[0.08] mx-1 shrink-0" />
              {/* Granularity chips */}
              {GRANULARITIES.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGranularity(g.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                    range.granularity === g.value
                      ? 'bg-white/[0.12] text-white'
                      : 'bg-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.07]'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Custom date inputs */}
      {(showCustom || range.preset === 'custom') && (
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-w-blue/50 [color-scheme:dark]"
          />
          <span className="text-xs text-white/30">→</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-w-blue/50 [color-scheme:dark]"
          />
          <button
            onClick={applyCustom}
            disabled={!customStart || !customEnd}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-w-blue text-white disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}

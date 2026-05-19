'use client'
import React, { createContext, useContext, useState } from 'react'
import { Preset, Granularity, TimeRangeState, DEFAULT_RANGE, defaultGranularity } from '@/lib/time-range'

interface Ctx {
  range: TimeRangeState
  setPreset: (p: Preset) => void
  setGranularity: (g: Granularity) => void
  setCustom: (start: string, end: string) => void
}

const TimeRangeCtx = createContext<Ctx>({
  range: DEFAULT_RANGE,
  setPreset: () => {},
  setGranularity: () => {},
  setCustom: () => {},
})

export function TimeRangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<TimeRangeState>(DEFAULT_RANGE)

  const setPreset = (p: Preset) =>
    setRange(r => ({ ...r, preset: p, granularity: defaultGranularity(p) }))

  const setGranularity = (g: Granularity) =>
    setRange(r => ({ ...r, granularity: g }))

  const setCustom = (start: string, end: string) =>
    setRange(r => ({ ...r, preset: 'custom', customStart: start, customEnd: end, granularity: 'daily' }))

  return <TimeRangeCtx.Provider value={{ range, setPreset, setGranularity, setCustom }}>{children}</TimeRangeCtx.Provider>
}

export function useTimeRange() { return useContext(TimeRangeCtx) }

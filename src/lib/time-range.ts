import { startOfMonth, startOfYear, subDays } from 'date-fns'

export type Preset = '7D' | '30D' | '90D' | 'MTD' | 'YTD' | 'custom'
export type Granularity = 'daily' | 'weekly' | 'monthly'

export interface TimeRangeState {
  preset: Preset
  granularity: Granularity
  customStart: string   // 'YYYY-MM-DD'
  customEnd: string
}

export const DEFAULT_RANGE: TimeRangeState = {
  preset: '30D',
  granularity: 'daily',
  customStart: '',
  customEnd: '',
}

export function defaultGranularity(preset: Preset): Granularity {
  if (preset === '7D' || preset === 'MTD') return 'daily'
  if (preset === '30D') return 'daily'
  if (preset === '90D') return 'weekly'
  if (preset === 'YTD') return 'monthly'
  return 'daily'
}

export function getPresetDates(preset: Preset, today: Date, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const end = new Date(today)
  end.setHours(23, 59, 59, 999)

  switch (preset) {
    case '7D':   return { start: subDays(today, 6), end }
    case '30D':  return { start: subDays(today, 29), end }
    case '90D':  return { start: subDays(today, 89), end }
    case 'MTD':  return { start: startOfMonth(today), end }
    case 'YTD':  return { start: startOfYear(today), end }
    case 'custom': {
      const s = customStart ? new Date(customStart) : subDays(today, 29)
      const e = customEnd   ? new Date(customEnd)   : today
      return { start: s, end: e }
    }
    default: return { start: subDays(today, 29), end }
  }
}

export function labelForPreset(preset: Preset, customStart: string, customEnd: string): string {
  if (preset === 'custom' && customStart && customEnd) return `${customStart} → ${customEnd}`
  const map: Record<Preset, string> = { '7D': 'Last 7 Days', '30D': 'Last 30 Days', '90D': 'Last 90 Days', MTD: 'Month to Date', YTD: 'Year to Date', custom: 'Custom' }
  return map[preset]
}

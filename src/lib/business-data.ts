export interface DayMetric {
  date: string
  revenue: number
  leads: number
  adSpend: number
  hoursWorked: number
  rawDate: Date
}

export interface AggregatedMetric {
  date: string
  revenue: number
  leads: number
  adSpend: number
  days: number
}

// No mock data — returns empty array; populated from Housecall Pro or manual entry
export function mockBusinessHistory(): DayMetric[] {
  return []
}

export function filterByDateRange(data: DayMetric[], start: Date, end: Date): DayMetric[] {
  const s = start.getTime()
  const e = end.getTime()
  return data.filter(d => {
    const t = d.rawDate.getTime()
    return t >= s && t <= e
  })
}

export function aggregateWeekly(data: DayMetric[]): AggregatedMetric[] {
  const buckets = new Map<string, { revenue: number; leads: number; adSpend: number; days: number; startDate: Date }>()
  for (const d of data) {
    const day = d.rawDate
    const monday = new Date(day)
    monday.setDate(day.getDate() - ((day.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const key = monday.toISOString()
    if (!buckets.has(key)) buckets.set(key, { revenue: 0, leads: 0, adSpend: 0, days: 0, startDate: monday })
    const b = buckets.get(key)!
    b.revenue += d.revenue
    b.leads += d.leads
    b.adSpend += d.adSpend
    b.days += 1
  }
  return Array.from(buckets.values())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .map(b => ({
      date: b.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: b.revenue,
      leads: b.leads,
      adSpend: b.adSpend,
      days: b.days,
    }))
}

export function aggregateMonthly(data: DayMetric[]): AggregatedMetric[] {
  const buckets = new Map<string, { revenue: number; leads: number; adSpend: number; days: number; year: number; month: number }>()
  for (const d of data) {
    const key = `${d.rawDate.getFullYear()}-${d.rawDate.getMonth()}`
    if (!buckets.has(key)) buckets.set(key, { revenue: 0, leads: 0, adSpend: 0, days: 0, year: d.rawDate.getFullYear(), month: d.rawDate.getMonth() })
    const b = buckets.get(key)!
    b.revenue += d.revenue
    b.leads += d.leads
    b.adSpend += d.adSpend
    b.days += 1
  }
  return Array.from(buckets.values())
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map(b => ({
      date: new Date(b.year, b.month, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: b.revenue,
      leads: b.leads,
      adSpend: b.adSpend,
      days: b.days,
    }))
}

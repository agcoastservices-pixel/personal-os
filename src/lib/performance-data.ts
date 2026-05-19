export type PRUnit = 'lb' | 'inches' | 'bodyweight' | '+lb'

export interface PersonalRecord {
  id: string
  exercise: string
  value: number | null
  unit: PRUnit
  reps: number              // 1 = 1RM, >1 = rep PR (top set)
  dateAchieved: string | null
  previousValue: number | null
  previousReps?: number
  category: 'jump' | 'strength' | 'gymnastics'
  notes?: string
}

export interface BodyMeasurements {
  heightInches: number       // stored as inches, displayed as ft/in
  standingReachInches: number
}

// These are static body measurements the user enters once; no defaults
export const initialBodyMeasurements: BodyMeasurements = {
  heightInches: 0,
  standingReachInches: 0,
}

export function formatFeetInches(totalInches: number): string {
  if (!totalInches) return '—'
  const ft = Math.floor(totalInches / 12)
  const inches = Math.round((totalInches % 12) * 10) / 10
  return `${ft}'${inches}"`
}

// Exercise list — all values start as null (no data until manually entered)
export const initialPRs: PersonalRecord[] = [
  // Jump / Explosive
  { id: 'vert-standing',  exercise: 'Standing Vert',        value: null, unit: 'inches',     reps: 1, dateAchieved: null, previousValue: null, category: 'jump' },
  { id: 'vert-approach',  exercise: 'Approach Vert',        value: null, unit: 'inches',     reps: 1, dateAchieved: null, previousValue: null, category: 'jump' },
  // Strength
  { id: 'power-clean',    exercise: 'Power Clean',          value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'bench-press',    exercise: 'Bench Press',          value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'front-squat',    exercise: 'Front Squat',          value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'back-squat',     exercise: 'Back Squat',           value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'deadlift',       exercise: 'Conv. Deadlift',       value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'weighted-pullup',exercise: 'Weighted Pull-up',     value: null, unit: '+lb',        reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'trap-jump-squat',exercise: 'Trap Bar Jump Squat',  value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'leg-extension',  exercise: 'Leg Extension',        value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  // Gymnastics / Bodyweight
  { id: 'muscle-up',      exercise: 'Muscle Up',            value: null, unit: 'bodyweight', reps: 1, dateAchieved: null, previousValue: null, category: 'gymnastics' },
  // TBD
  { id: 'shoulder-press-machine', exercise: 'Shoulder Press Machine', value: null, unit: 'lb', reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'rdl',            exercise: 'RDL',                  value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
  { id: 'seated-calf-raise', exercise: 'Seated Calf Raise', value: null, unit: 'lb',         reps: 1, dateAchieved: null, previousValue: null, category: 'strength' },
]

export interface BodyMetric {
  date: string
  weight: number
  bodyFat: number
}

// No mock data — returns empty array; populated from DB or manual log
export function mockBodyMetrics(): BodyMetric[] {
  return []
}

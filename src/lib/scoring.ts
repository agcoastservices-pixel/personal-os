export interface DailyScoreInputs {
  recoveryHRV: number
  sleepScore: number
  sleepHours: number
  nutritionPct: number
  trainingCompleted: boolean
  trainingQuality: number   // 0–10 (effort quality)
  screenTimeHours: number
  leadsToday: number
  revenueToday: number
  tasksCompleted: number
  tasksTotal: number
  waterGallon: boolean      // +5 bonus
  macrosTracked: boolean    // +5 bonus
}

export interface SubScore {
  key: string
  label: string
  score: number
  weight: number
  contribution: number
  status: 'great' | 'ok' | 'drag'
}

export interface DailyScore {
  total: number
  subScores: SubScore[]
  drags: SubScore[]
  bonusPoints: number
}

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v))
}

export const emptyTodayInputs: DailyScoreInputs = {
  recoveryHRV: 0,
  sleepScore: 0,
  sleepHours: 0,
  nutritionPct: 0,
  trainingCompleted: false,
  trainingQuality: 0,
  screenTimeHours: 0,
  leadsToday: 0,
  revenueToday: 0,
  tasksCompleted: 0,
  tasksTotal: 0,
  waterGallon: false,
  macrosTracked: false,
}

export function calculateDailyScore(inputs: DailyScoreInputs): DailyScore {
  // If no data has been entered at all, return a blank state
  const hasAnyData =
    inputs.recoveryHRV > 0 || inputs.sleepHours > 0 || inputs.nutritionPct > 0 ||
    inputs.trainingCompleted || inputs.leadsToday > 0 || inputs.revenueToday > 0 ||
    inputs.tasksTotal > 0

  if (!hasAnyData) {
    const subScores: SubScore[] = [
      { key: 'recovery',  label: 'Recovery',    score: 0, weight: 0.25, contribution: 0, status: 'ok' },
      { key: 'nutrition', label: 'Nutrition',   score: 0, weight: 0.20, contribution: 0, status: 'ok' },
      { key: 'training',  label: 'Training',    score: 0, weight: 0.20, contribution: 0, status: 'ok' },
      { key: 'business',  label: 'Business',    score: 0, weight: 0.15, contribution: 0, status: 'ok' },
      { key: 'sleep',     label: 'Sleep',       score: 0, weight: 0.10, contribution: 0, status: 'ok' },
      { key: 'screen',    label: 'Screen Time', score: 0, weight: 0.10, contribution: 0, status: 'ok' },
    ]
    return { total: 0, subScores, drags: [], bonusPoints: 0 }
  }

  const recovery = clamp((inputs.recoveryHRV * 0.6) + (inputs.sleepScore * 0.4))
  const sleep = clamp(Math.min(inputs.sleepHours / 9, 1) * 100)
  const nutritionScore = clamp(inputs.nutritionPct)

  let trainingScore = 0
  if (inputs.trainingCompleted) {
    trainingScore = clamp(50 + (inputs.trainingQuality / 10) * 50)
  }

  const screenScore = inputs.screenTimeHours > 0
    ? clamp(Math.max(0, 1 - inputs.screenTimeHours / 6) * 100)
    : 0

  const leadsScore = clamp((inputs.leadsToday / 5) * 100)
  const revenueScore = clamp((inputs.revenueToday / 1000) * 100)
  const taskScore = inputs.tasksTotal > 0
    ? clamp((inputs.tasksCompleted / inputs.tasksTotal) * 100)
    : 0
  const businessScore = clamp((leadsScore * 0.35) + (revenueScore * 0.35) + (taskScore * 0.3))

  const subScores: SubScore[] = [
    { key: 'recovery',  label: 'Recovery',    score: recovery,       weight: 0.25, contribution: 0, status: 'ok' },
    { key: 'nutrition', label: 'Nutrition',   score: nutritionScore, weight: 0.20, contribution: 0, status: 'ok' },
    { key: 'training',  label: 'Training',    score: trainingScore,  weight: 0.20, contribution: 0, status: 'ok' },
    { key: 'business',  label: 'Business',    score: businessScore,  weight: 0.15, contribution: 0, status: 'ok' },
    { key: 'sleep',     label: 'Sleep',       score: sleep,          weight: 0.10, contribution: 0, status: 'ok' },
    { key: 'screen',    label: 'Screen Time', score: screenScore,    weight: 0.10, contribution: 0, status: 'ok' },
  ]

  let total = 0
  for (const s of subScores) {
    s.contribution = s.score * s.weight
    total += s.contribution
    s.status = s.score >= 70 ? 'great' : s.score >= 45 ? 'ok' : 'drag'
  }

  const bonusPoints = (inputs.waterGallon ? 5 : 0) + (inputs.macrosTracked ? 5 : 0)
  const drags = subScores.filter(s => s.status === 'drag').sort((a, b) => a.score - b.score)
  return { total: Math.round(clamp(total + bonusPoints)), subScores, drags, bonusPoints }
}

// No mock history — returns empty array; populate from DB when ready
export function mockScoreHistory(): { date: string; score: number }[] {
  return []
}

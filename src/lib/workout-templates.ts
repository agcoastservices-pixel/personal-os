export type WorkoutType = 'upper' | 'explosive' | 'lower' | 'custom'

export interface ExerciseTemplate {
  name: string
  sets: number
  reps: string      // e.g. "3-6" or "2"
  weight?: string   // e.g. "145lb" or "BW"
  notes?: string
}

export interface WorkoutTemplate {
  type: WorkoutType
  label: string
  color: string
  exercises: ExerciseTemplate[]
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    type: 'upper',
    label: 'Upper',
    color: 'text-blue-400',
    exercises: [
      { name: 'Muscle Up', sets: 3, reps: '1', weight: 'BW', notes: 'Quality reps only' },
      { name: 'Bench Press', sets: 3, reps: '2' },
      { name: 'Pull-up', sets: 3, reps: '2-4', weight: 'BW+' },
      { name: 'Dip', sets: 3, reps: '2-4', weight: 'BW+' },
      { name: 'Shoulder Press Machine', sets: 2, reps: '3-6' },
      { name: 'Chest Supported Row', sets: 2, reps: '3-6' },
      { name: 'Bicep Curl EZ Bar / Cable', sets: 2, reps: '3-6' },
      { name: 'Tricep Pushdown Straight Bar', sets: 2, reps: '3-6' },
    ],
  },
  {
    type: 'explosive',
    label: 'Explosive',
    color: 'text-orange-400',
    exercises: [
      { name: 'Trap Bar Jump Squat', sets: 3, reps: '2', weight: '145lb', notes: 'Superset with squat jump' },
      { name: 'Squat Jump', sets: 3, reps: '2', weight: 'BW', notes: 'Superset with TBJS' },
      { name: 'Power Clean', sets: 3, reps: '2' },
      { name: 'Depth Jump', sets: 3, reps: '3', notes: '24" box' },
      { name: 'Seated Jump', sets: 3, reps: '3', weight: 'BW' },
      { name: 'Standing Max Vert', sets: 1, reps: '3', weight: 'BW', notes: 'Log height in inches' },
    ],
  },
  {
    type: 'lower',
    label: 'Lower',
    color: 'text-emerald-400',
    exercises: [
      { name: 'Front Squat', sets: 4, reps: '4', weight: '185lb', notes: 'Velocity threshold 0.5 m/s' },
      { name: 'Overspeed CMJ', sets: 4, reps: '3', weight: 'BW' },
      { name: 'Nordic Curl', sets: 3, reps: '4-6' },
      { name: 'Leg Extension', sets: 3, reps: '3', weight: '260lb' },
      { name: 'Seated Calf Raise', sets: 3, reps: '3-6' },
      { name: 'Cossack Squat', sets: 5, reps: '3', weight: 'BW' },
      { name: 'Copenhagen Plank', sets: 3, reps: '8s', weight: 'BW' },
    ],
  },
]

export interface LoggedSet {
  id: string
  exercise: string
  setNumber: number
  weight: string
  reps: number
  rir?: number
  isTopSet?: boolean
}

export interface WorkoutSession {
  id: string
  type: WorkoutType
  startTime: Date
  endTime?: Date
  sets: LoggedSet[]
  notes: string
}

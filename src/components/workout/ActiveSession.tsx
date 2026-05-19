'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Trophy, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  WorkoutSession,
  LoggedSet,
  workoutTemplates,
  ExerciseTemplate,
} from '@/lib/workout-templates'
import { initialPRs } from '@/lib/performance-data'

interface Props {
  session: WorkoutSession
  elapsed: number
  formatElapsed: (s: number) => string
  onFinish: (session: WorkoutSession) => void
  onUpdateSession: (session: WorkoutSession) => void
}

interface SetInputState {
  weight: string
  reps: string
  rir: string
}

function newPRCheck(exercise: string, weight: number): boolean {
  const pr = initialPRs.find(p => p.exercise.toLowerCase() === exercise.toLowerCase())
  if (!pr || !pr.value) return false
  return weight > pr.value
}

function ExerciseCard({
  template,
  sets,
  onLogSet,
}: {
  template: ExerciseTemplate
  sets: LoggedSet[]
  onLogSet: (set: Omit<LoggedSet, 'id'>) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [input, setInput] = useState<SetInputState>({ weight: template.weight && template.weight !== 'BW' && template.weight !== 'BW+' ? template.weight.replace('lb', '') : '', reps: '', rir: '' })
  const [newPR, setNewPR] = useState(false)

  const exerciseSets = sets.filter(s => s.exercise === template.name)
  const setsDone = exerciseSets.length
  const setsTarget = template.sets

  const logSet = () => {
    const repsNum = parseInt(input.reps) || 1
    const weightStr = input.weight || template.weight || 'BW'
    const weightNum = parseFloat(input.weight) || 0
    const isTopSet = weightNum > 0 && exerciseSets.every(s => parseFloat(s.weight) <= weightNum)
    const isPR = weightNum > 0 && newPRCheck(template.name, weightNum)
    if (isPR) setNewPR(true)

    onLogSet({
      exercise: template.name,
      setNumber: setsDone + 1,
      weight: weightStr,
      reps: repsNum,
      rir: input.rir ? parseFloat(input.rir) : undefined,
      isTopSet,
    })
    setInput(prev => ({ ...prev, reps: '', rir: '' }))
  }

  return (
    <div className={cn(
      'bg-zinc-900 border rounded-xl overflow-hidden transition-all',
      newPR ? 'border-emerald-500/50' : setsDone >= setsTarget ? 'border-zinc-700/50' : 'border-zinc-800'
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className={cn('w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
          setsDone >= setsTarget ? 'bg-blue-600 border-blue-600' : 'border-zinc-700'
        )}>
          {setsDone >= setsTarget && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="flex-1 text-left text-sm font-medium text-zinc-200">{template.name}</span>
        {newPR && <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">NEW PR</span>}
        <span className="text-xs text-zinc-600 tabular-nums">{setsDone}/{setsTarget}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-600" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Target */}
          <p className="text-xs text-zinc-600 mb-3">
            Target: {template.sets} × {template.reps}
            {template.weight && ` @ ${template.weight}`}
            {template.notes && <span className="text-zinc-700"> · {template.notes}</span>}
          </p>

          {/* Logged sets */}
          {exerciseSets.length > 0 && (
            <div className="mb-3 space-y-1">
              {exerciseSets.map((s, i) => (
                <div key={s.id} className={cn('flex items-center gap-3 text-xs py-1', s.isTopSet && 'text-blue-400')}>
                  <span className="text-zinc-700 w-4">{i + 1}</span>
                  <span className="text-zinc-300 font-medium">{s.weight}</span>
                  <span className="text-zinc-500">× {s.reps}</span>
                  {s.rir !== undefined && <span className="text-zinc-600">RIR {s.rir}</span>}
                  {s.isTopSet && <span className="text-blue-500 text-[10px] font-bold">TOP</span>}
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          {setsDone < setsTarget + 2 && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input.weight}
                onChange={e => setInput(p => ({ ...p, weight: e.target.value }))}
                placeholder="Wt"
                className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-600/60 text-center"
              />
              <input
                type="number"
                value={input.reps}
                onChange={e => setInput(p => ({ ...p, reps: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && input.reps && logSet()}
                placeholder="Reps"
                className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-600/60 text-center"
              />
              <input
                type="number"
                value={input.rir}
                onChange={e => setInput(p => ({ ...p, rir: e.target.value }))}
                placeholder="RIR"
                min="0" max="10" step="1"
                className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-600/60 text-center"
              />
              <button
                onClick={logSet}
                disabled={!input.reps}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg text-xs font-medium disabled:opacity-30 hover:bg-blue-600/30 transition-colors"
              >
                <Plus className="w-3 h-3" /> Log
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ActiveSession({ session, elapsed, formatElapsed, onFinish, onUpdateSession }: Props) {
  const template = workoutTemplates.find(t => t.type === session.type)
  const exercises = template?.exercises ?? []

  const logSet = (set: Omit<LoggedSet, 'id'>) => {
    const newSet: LoggedSet = { ...set, id: Date.now().toString() }
    onUpdateSession({ ...session, sets: [...session.sets, newSet] })
  }

  const setsDone = session.sets.length
  const newPRs = session.sets.filter(s => s.isTopSet)

  const finishSession = () => {
    onFinish({ ...session, endTime: new Date() })
  }

  return (
    <div className="min-h-screen flex flex-col max-w-[700px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className={cn('text-lg font-bold', template?.color ?? 'text-zinc-100')}>
                {template?.label ?? 'Custom'} Session
              </h1>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{formatElapsed(elapsed)}
                </span>
                <span>{setsDone} sets logged</span>
                {newPRs.length > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Trophy className="w-3 h-3" />{newPRs.length} top set{newPRs.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={finishSession}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Finish
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (exercises.filter(ex => session.sets.some(s => s.exercise === ex.name)).length / exercises.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {exercises.map(ex => (
          <ExerciseCard
            key={ex.name}
            template={ex}
            sets={session.sets}
            onLogSet={logSet}
          />
        ))}

        {session.type === 'custom' && (
          <button className="w-full py-3 border border-dashed border-zinc-800 rounded-xl text-sm text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        )}
      </div>
    </div>
  )
}

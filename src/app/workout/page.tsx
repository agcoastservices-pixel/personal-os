'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dumbbell, Play, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { workoutTemplates, WorkoutSession, WorkoutType } from '@/lib/workout-templates'
import ActiveSession from '@/components/workout/ActiveSession'

const pastSessions: { date: string; type: WorkoutType; duration: string; topSets: string[] }[] = [
  { date: 'May 16', type: 'upper', duration: '52 min', topSets: ['Bench Press 230lb × 2', 'Pull-up +50lb × 3'] },
  { date: 'May 14', type: 'lower', duration: '58 min', topSets: ['Front Squat 185lb × 4', 'Deadlift 315lb × 2'] },
  { date: 'May 12', type: 'explosive', duration: '44 min', topSets: ['Power Clean 185lb × 2', 'Vert 33.5"'] },
  { date: 'May 10', type: 'upper', duration: '55 min', topSets: ['Bench Press 225lb × 2', 'Dip +90lb × 4'] },
  { date: 'May 8', type: 'lower', duration: '61 min', topSets: ['Front Squat 185lb × 4', 'Nordic Curl × 5'] },
]

export default function WorkoutPage() {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  const startSession = useCallback((type: WorkoutType) => {
    setActiveSession({
      id: Date.now().toString(),
      type,
      startTime: new Date(),
      sets: [],
      notes: '',
    })
    setElapsed(0)
  }, [])

  const finishSession = useCallback((session: WorkoutSession) => {
    // Will save to Supabase workouts + workout_sets tables
    console.log('Session complete', session)
    setActiveSession(null)
    setElapsed(0)
  }, [])

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (activeSession) {
    return (
      <ActiveSession
        session={activeSession}
        elapsed={elapsed}
        formatElapsed={formatElapsed}
        onFinish={finishSession}
        onUpdateSession={setActiveSession}
      />
    )
  }

  return (
    <div className="min-h-screen px-4 pt-5 pb-4 md:px-8 md:pt-8 max-w-[900px] md:mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Dumbbell className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-zinc-100">Workout</h1>
      </div>
      <p className="text-sm text-zinc-500 mb-8">Log a session from a template or start custom</p>

      {/* Template cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {workoutTemplates.map(template => (
          <button
            key={template.type}
            onClick={() => startSession(template.type)}
            className="group text-left bg-surface-2 border border-zinc-800/60 hover:border-zinc-700 rounded-xl p-5 transition-all hover:bg-zinc-800/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity', template.color)}>
                <Play className="w-3 h-3" /> Start
              </div>
            </div>
            <h3 className={cn('text-base font-bold mb-1', template.color)}>{template.label}</h3>
            <p className="text-xs text-zinc-600 mb-3">{template.exercises.length} exercises</p>
            <div className="space-y-1">
              {template.exercises.slice(0, 4).map(ex => (
                <p key={ex.name} className="text-xs text-zinc-500 truncate">· {ex.name}</p>
              ))}
              {template.exercises.length > 4 && (
                <p className="text-xs text-zinc-700">+{template.exercises.length - 4} more</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Start custom */}
      <button
        onClick={() => startSession('custom')}
        className="w-full mb-10 flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-800 rounded-xl text-sm text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-all"
      >
        <Play className="w-4 h-4" /> Start Custom Session
      </button>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Recent Sessions</h2>
        <div className="space-y-2">
          {pastSessions.map((session, i) => {
            const template = workoutTemplates.find(t => t.type === session.type)
            return (
              <div key={i} className="bg-surface-2 border border-zinc-800/60 rounded-xl px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-sm font-semibold', template?.color ?? 'text-zinc-300')}>
                      {template?.label ?? 'Custom'}
                    </span>
                    <span className="text-xs text-zinc-600">{session.date}</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-600">
                      <Clock className="w-3 h-3" />{session.duration}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {session.topSets.map(s => (
                      <span key={s} className="text-[11px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

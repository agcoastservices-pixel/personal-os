'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, addMonths, subMonths,
} from 'date-fns'
import { cn, priorityConfig } from '@/lib/utils'
import { Todo } from '@/types'

// Todos and workouts — empty until populated from DB or user input
const mockTodos: Todo[] = []
const mockWorkouts: { date: Date; type: string; label: string }[] = []

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getEventsForDay(day: Date) {
  const dayTodos = mockTodos.filter(t => t.deadline && isSameDay(new Date(t.deadline), day))
  const dayWorkouts = mockWorkouts.filter(w => isSameDay(w.date, day))
  return { todos: dayTodos, workouts: dayWorkouts }
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())

  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start, end })
  const startPad = getDay(start) // 0=Sun

  const selectedEvents = getEventsForDay(selectedDay)

  return (
    <div className="px-4 pt-5 pb-2 md:px-8 md:pt-8 max-w-[780px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">Calendar</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 active:text-white/80"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white/70 px-2 min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 active:text-white/80"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-white/20 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 mb-5">
        {/* Padding cells */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map(day => {
          const { todos: dayTodos, workouts: dayWorkouts } = getEventsForDay(day)
          const hasEvent = dayTodos.length > 0 || dayWorkouts.length > 0
          const isSelected = isSameDay(day, selectedDay)
          const todayDay = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'relative flex flex-col items-center py-1.5 rounded-xl transition-all',
                isSelected
                  ? 'bg-w-blue'
                  : todayDay
                    ? 'bg-white/[0.08]'
                    : 'active:bg-white/[0.06]'
              )}
            >
              <span className={cn(
                'text-[13px] font-semibold leading-none',
                isSelected ? 'text-white' : todayDay ? 'text-w-blue' : 'text-white/60'
              )}>
                {format(day, 'd')}
              </span>
              {/* Event dots */}
              {hasEvent && (
                <div className="flex gap-0.5 mt-1">
                  {dayTodos.slice(0, 2).map((t, i) => (
                    <div
                      key={i}
                      className={cn('w-1 h-1 rounded-full', priorityConfig[t.priority].dot)}
                    />
                  ))}
                  {dayWorkouts.length > 0 && (
                    <div className="w-1 h-1 rounded-full bg-w-blue" />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day events */}
      <div className="rounded-2xl p-4"
        style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
          {isToday(selectedDay) ? 'Today' : format(selectedDay, 'EEEE, MMM d')}
        </p>

        {selectedEvents.todos.length === 0 && selectedEvents.workouts.length === 0 && (
          <p className="text-sm text-white/25 py-2">Nothing scheduled</p>
        )}

        {/* Workouts */}
        {selectedEvents.workouts.map((w, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-2 h-2 rounded-full bg-w-blue shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-white/80">{w.label} Workout</p>
              <p className="text-[10px] text-white/25 mt-0.5">Workout session</p>
            </div>
          </div>
        ))}

        {/* Todos */}
        {selectedEvents.todos.map(todo => {
          const p = priorityConfig[todo.priority]
          return (
            <div key={todo.id} className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className={cn('w-2 h-2 rounded-full shrink-0', p.dot)} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm leading-snug',
                  todo.completed ? 'line-through text-white/30' : 'text-white/80'
                )}>
                  {todo.title}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5 capitalize">
                  {p.label} · {todo.category}
                </p>
              </div>
              {todo.completed && (
                <svg className="w-4 h-4 text-w-green shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

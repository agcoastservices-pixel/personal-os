import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { GoalCategory, TodoPriority } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'MMM d, yyyy')
}

export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d')
}

export function isOverdue(dateStr: string): boolean {
  return isPast(new Date(dateStr)) && !isToday(new Date(dateStr))
}

export const categoryColors: Record<GoalCategory, { bg: string; text: string; border: string; dot: string }> = {
  fitness: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  business: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
  },
  financial: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  personal: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-400',
  },
}

export const priorityConfig: Record<TodoPriority, { text: string; bg: string; dot: string; label: string }> = {
  most_important: { text: 'text-red-400',   bg: 'bg-red-500/10',    dot: 'bg-red-500',     label: 'Most Important' },
  important:      { text: 'text-amber-400', bg: 'bg-amber-500/10',  dot: 'bg-amber-500',   label: 'Important' },
  least_important:{ text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', label: 'Least Important' },
}

// Backward compat alias
export const priorityColors = priorityConfig

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

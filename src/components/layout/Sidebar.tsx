'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  Plug,
  CheckSquare,
  Dumbbell,
  Trophy,
  Lightbulb,
  Briefcase,
  CreditCard,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/',             label: 'Home',         icon: LayoutDashboard },
      { href: '/todos',        label: 'To-Do List',   icon: CheckSquare },
      { href: '/calendar',     label: 'Calendar',     icon: Calendar },
      { href: '/goals',        label: 'Goals',        icon: Target },
    ],
  },
  {
    label: 'Performance',
    items: [
      { href: '/performance',  label: 'Performance',  icon: Trophy },
      { href: '/workout',      label: 'Workout',      icon: Dumbbell },
      { href: '/business',     label: 'Business',     icon: Briefcase },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/finance',      label: 'Finance',      icon: CreditCard },
    ],
  },
  {
    label: 'More',
    items: [
      { href: '/insights',     label: 'Insights',     icon: Lightbulb },
      { href: '/integrations', label: 'Integrations', icon: Plug },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 bottom-0 w-[220px] flex-col"
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 40,
      }}
    >
      {/* Brand */}
      <div
        className="h-14 flex items-center px-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-sm font-bold tracking-widest text-white/70 uppercase">OS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20">
              {group.label}
            </p>
            <div className="space-y-px">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-100',
                      active
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                    )}
                  >
                    <Icon
                      className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-w-blue' : 'text-white/30')}
                      strokeWidth={active ? 2 : 1.75}
                    />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div
        className="px-4 py-4 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white/60">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/70 truncate">Alec</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-w-green shrink-0" />
        </div>
      </div>
    </aside>
  )
}

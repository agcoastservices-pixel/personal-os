'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, Dumbbell, Briefcase, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/',            label: 'Home',        icon: LayoutDashboard },
  { href: '/performance', label: 'Performance', icon: Trophy },
  { href: '/workout',     label: 'Workouts',    icon: Dumbbell },
  { href: '/business',    label: 'Business',    icon: Briefcase },
  { href: '/goals',       label: 'Goals',       icon: Target },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(10,10,12,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex max-w-[480px] mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors',
                active ? 'text-w-blue' : 'text-white/25 active:text-white/50'
              )}
            >
              <Icon
                className="w-[22px] h-[22px] shrink-0"
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className={cn(
                'text-[9px] font-semibold uppercase tracking-[0.1em]',
                active ? 'text-w-blue' : 'text-white/20'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

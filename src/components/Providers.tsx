'use client'
import { TimeRangeProvider } from '@/contexts/TimeRangeContext'
export default function Providers({ children }: { children: React.ReactNode }) {
  return <TimeRangeProvider>{children}</TimeRangeProvider>
}

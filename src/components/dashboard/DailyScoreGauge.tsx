'use client'

import { DailyScore, SubScore } from '@/lib/scoring'

interface Props {
  scoreData: DailyScore
}

function scoreColor(score: number) {
  if (score >= 80) return '#00c896'
  if (score >= 65) return '#3d91ff'
  if (score >= 45) return '#f5a623'
  return '#ff4757'
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'OK'
  if (score >= 40) return 'Low'
  return 'Poor'
}

function GaugeRing({ score, size = 144 }: { score: number; size?: number }) {
  const r = size * 0.386      // radius proportional to size
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const arcLen = circumference * 0.75
  const fillLen = score > 0 ? arcLen * (Math.min(score, 100) / 100) : 0
  const color = score > 0 ? scoreColor(score) : 'rgba(255,255,255,0.1)'
  const strokeW = Math.round(size * 0.063)   // ~9px at 144

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={strokeW}
        strokeDasharray={`${arcLen} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
      />
      {/* Fill */}
      {score > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeDasharray={`${fillLen} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{
            transition: 'stroke-dasharray 0.9s ease',
            filter: `drop-shadow(0 0 6px ${color}55)`,
          }}
        />
      )}
      {/* Score number */}
      <text
        x={cx} y={cy + 7}
        textAnchor="middle"
        fill={score > 0 ? '#f4f4f5' : 'rgba(255,255,255,0.2)'}
        fontSize={Math.round(size * 0.236)}
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1"
      >
        {score > 0 ? score : '—'}
      </text>
      {/* Status label */}
      {score > 0 && (
        <text
          x={cx} y={cy + size * 0.155}
          textAnchor="middle"
          fill={color}
          fontSize={Math.round(size * 0.063)}
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="2"
        >
          {scoreLabel(score).toUpperCase()}
        </text>
      )}
    </svg>
  )
}

function SubScoreRow({ sub, hasData }: { sub: SubScore; hasData: boolean }) {
  const color =
    !hasData ? 'rgba(255,255,255,0.12)' :
    sub.status === 'great' ? '#00c896' :
    sub.status === 'ok'    ? '#3d91ff' : '#ff4757'

  return (
    <div className="flex items-center gap-3 py-[4px]">
      <span className="text-[11px] text-white/35 w-[76px] shrink-0 truncate">{sub.label}</span>
      <div className="flex-1 h-[3px] rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: hasData ? `${sub.score}%` : '0%', background: color }}
        />
      </div>
      <span className="text-[11px] font-semibold tabular-nums w-6 text-right" style={{ color }}>
        {hasData ? Math.round(sub.score) : '—'}
      </span>
    </div>
  )
}

export default function DailyScoreGauge({ scoreData }: Props) {
  const { total, subScores, drags, bonusPoints } = scoreData
  const hasData = total > 0 || subScores.some(s => s.score > 0)

  return (
    <div>
      {/* Gauge + sub-scores */}
      <div className="flex items-center gap-4 mb-3">
        {/* Responsive gauge: smaller on mobile */}
        <div className="shrink-0 hidden sm:block">
          <GaugeRing score={total} size={144} />
        </div>
        <div className="shrink-0 sm:hidden">
          <GaugeRing score={total} size={112} />
        </div>
        <div className="flex-1 min-w-0 space-y-0">
          {subScores.map(sub => (
            <SubScoreRow key={sub.key} sub={sub} hasData={hasData} />
          ))}
        </div>
      </div>

      {!hasData && (
        <p className="text-[11px] text-white/20 text-center pb-1">
          Log today&apos;s data to see your score
        </p>
      )}

      {/* Bonus strip */}
      {bonusPoints > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-2"
          style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-w-green" />
          <span className="text-[11px] text-w-green font-medium">+{bonusPoints} bonus pts today</span>
        </div>
      )}

      {/* Drags */}
      {drags.length > 0 && hasData && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,71,87,0.07)', border: '1px solid rgba(255,71,87,0.15)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-w-red shrink-0" />
          <span className="text-[11px] text-w-red font-medium">
            {drags.map(d => d.label).join(', ')} dragging score
          </span>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { formatTime } from '../engine/scoring'
import { useCountUp } from '../hooks/useCountUp'

// Wraps a number with a count-up animation and a spring pop whenever the
// underlying value changes (positive change only; snaps instantly downward).
function AnimatedNumber({
  value,
  className,
  format,
}: {
  value: number
  className?: string
  format?: (n: number) => string
}) {
  const displayed = useCountUp(value)
  const [popKey, setPopKey] = useState(0)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value !== prevRef.current) {
      if (value > prevRef.current) setPopKey(k => k + 1)
      prevRef.current = value
    }
  }, [value])

  const text = format ? format(displayed) : displayed.toLocaleString()

  return (
    // key forces the span to remount, replaying the CSS animation
    <span key={popKey} className={`inline-block animate-score-pop ${className ?? ''}`}>
      {text}
    </span>
  )
}

export function ScoreBar() {
  const levelNum     = useGameStore(s => s.levelNum)
  const levelStreak  = useGameStore(s => s.levelStreak)
  const totalScore   = useGameStore(s => s.totalScore)
  const mistakeCount = useGameStore(s => s.mistakeCount)
  const hintsUsed    = useGameStore(s => s.hintsUsed)
  const bestTimes    = useGameStore(s => s.bestTimes)

  const bestTime = bestTimes[String(levelNum)]
  const mistakesLabel = hintsUsed
    ? `${mistakeCount} / ${hintsUsed}💡`
    : String(mistakeCount)

  return (
    <div className="w-full max-w-[640px] flex items-center justify-between mt-3 px-4 py-2.5 bg-surface rounded-2xl">
      <ScoreItem value={levelNum} label="Level" />

      {/* Streak — pops on increase */}
      <div className="flex flex-col items-center gap-0.5">
        <AnimatedNumber
          value={levelStreak}
          className="text-[1.1rem] font-black text-acc font-game"
        />
        <span className="text-[0.58rem] font-bold text-tm uppercase tracking-[0.8px]">Streak</span>
      </div>

      {/* Total score — counts up */}
      <div className="flex flex-col items-center gap-0.5">
        <AnimatedNumber
          value={totalScore}
          className="text-[1.4rem] font-black font-game bg-linear-to-r from-acc to-acc2 bg-clip-text text-transparent"
        />
        <span className="text-[0.58rem] font-bold text-tm uppercase tracking-[0.8px]">Score</span>
      </div>

      <ScoreItem value={bestTime !== undefined ? formatTime(bestTime) : '—'} label="Best" />
      <ScoreItem value={mistakesLabel} label="Errors" />
    </div>
  )
}

function ScoreItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[1.1rem] font-black text-acc font-game">{value}</span>
      <span className="text-[0.58rem] font-bold text-tm uppercase tracking-[0.8px]">{label}</span>
    </div>
  )
}

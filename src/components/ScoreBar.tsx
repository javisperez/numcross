import { useEffect, useRef, useState } from 'react'
import { Flame, Star } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { useCountUp } from '../hooks/useCountUp'

function AnimatedNumber({
  value,
  className,
}: {
  value: number
  className?: string
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

  return (
    <span key={popKey} className={`inline-block animate-score-pop ${className ?? ''}`}>
      {displayed.toLocaleString()}
    </span>
  )
}

export function ScoreBar() {
  const levelStreak = useGameStore(s => s.levelStreak)
  const totalScore  = useGameStore(s => s.totalScore)

  return (
    <div className="w-full max-w-160 flex items-center justify-center gap-8 mt-3 px-4 py-2.5 bg-surface rounded-2xl">
      <div className="flex items-center gap-1.5">
        <Flame size={13} strokeWidth={2} className="text-acc" />
        <AnimatedNumber value={levelStreak} className="text-[1rem] font-black text-acc font-game" />
        <span className="text-[0.58rem] font-bold text-tm uppercase tracking-[0.8px]">Streak</span>
      </div>

      <div className="w-px h-5 bg-[#2e3650]" />

      <div className="flex items-center gap-1.5">
        <Star size={13} strokeWidth={2} className="text-acc" />
        <AnimatedNumber value={totalScore} className="text-[1rem] font-black font-game bg-linear-to-r from-acc to-acc2 bg-clip-text text-transparent" />
        <span className="text-[0.58rem] font-bold text-tm uppercase tracking-[0.8px]">Score</span>
      </div>
    </div>
  )
}

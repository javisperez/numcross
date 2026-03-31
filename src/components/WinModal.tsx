import { CheckCircle, Star, Zap, Flame, X, Lightbulb, Trophy, ArrowRight } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { formatTime } from '../engine/scoring'
import type { ScoreBreakdown } from '../engine/types'

function ScoreRow({
  variant,
  icon,
  label,
  value,
  sign = '',
  index = 0,
}: {
  variant: 'base' | 'gain' | 'penalty' | 'total'
  icon: React.ReactNode
  label: string
  value: number
  sign?: string
  index?: number
}) {
  const styles: Record<string, string> = {
    base:    'text-tl',
    gain:    'text-ok',
    penalty: 'text-bad',
    total:   'text-acc font-black text-[0.82rem] border-t border-[#2e3650] mt-1 pt-1.5',
  }

  return (
    <div
      className={`flex justify-between items-center text-[0.74rem] py-1 animate-stagger-in ${styles[variant]}`}
      style={{ animationDelay: `${0.18 + index * 0.08}s` }}
    >
      <span className="flex items-center gap-1.5 text-tm" style={{ color: 'inherit' }}>
        {icon}
        <span style={{ color: 'inherit' }}>{label}</span>
      </span>
      <span className="font-extrabold tabular-nums">{sign}{value.toLocaleString()}</span>
    </div>
  )
}

function ScoreBreakdownView({ bd, mistakeCount, hintsUsed }: {
  bd: ScoreBreakdown
  mistakeCount: number
  hintsUsed: number
}) {
  let i = 0
  return (
    <div className="w-full flex flex-col mb-4 text-left">
      <ScoreRow variant="base"    icon={<Star size={12} strokeWidth={2} />}     label="Base"                                              value={bd.base}      index={i++} />
      <ScoreRow variant="gain"    icon={<Zap  size={12} strokeWidth={2} />}     label="Speed"                                             value={bd.timeBonus} sign="+" index={i++} />
      {bd.streakBonus > 0 && (
        <ScoreRow variant="gain"  icon={<Flame size={12} strokeWidth={2} />}    label={`Streak ×${(1 + bd.streakPct / 100).toFixed(2)}`}  value={bd.streakBonus} sign="+" index={i++} />
      )}
      {bd.mistakePen > 0 && (
        <ScoreRow variant="penalty" icon={<X size={12} strokeWidth={2.5} />}    label={`Mistakes ×${mistakeCount}`}                       value={bd.mistakePen} sign="−" index={i++} />
      )}
      {bd.hintPen > 0 && (
        <ScoreRow variant="penalty" icon={<Lightbulb size={12} strokeWidth={2} />} label={`Hints ×${hintsUsed}`}                         value={bd.hintPen}    sign="−" index={i++} />
      )}
      <ScoreRow variant="total"   icon={<Trophy size={12} strokeWidth={2} />}   label="Total"                                             value={bd.total} sign="+" index={i++} />
    </div>
  )
}

export function WinModal() {
  const winModal             = useGameStore(s => s.winModal)
  const nextLevel            = useGameStore(s => s.nextLevel)
  const levelData            = useGameStore(s => s.levelData)
  const timerSec             = useGameStore(s => s.timerSec)
  const lastBreakdown        = useGameStore(s => s.lastBreakdown)
  const mistakeCount         = useGameStore(s => s.mistakeCount)
  const hintsUsed            = useGameStore(s => s.hintsUsed)
  const hintsPool            = useGameStore(s => s.hintsPool)
  const hintsEarnedThisLevel = useGameStore(s => s.hintsEarnedThisLevel)

  if (!winModal || !levelData || !lastBreakdown) return null

  return (
    <div
      className="fixed inset-0 bg-black/75 animate-fade-in flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) nextLevel() }}
    >
      <div className="bg-surface border border-[#2e3650] rounded-3xl px-6 pt-6 pb-6 text-center shadow-[0_24px_64px_rgba(0,0,0,0.55)] animate-slide-up max-w-xs w-[90%]">

        {/* Header */}
        <div
          className="flex items-center justify-center gap-2 mb-0.5 animate-stagger-in"
          style={{ animationDelay: '0.1s' }}
        >
          <CheckCircle size={20} strokeWidth={2.5} className="text-ok" />
          <h2 className="text-[1.4rem] font-black text-acc font-game leading-none">Solved!</h2>
        </div>

        <p
          className="text-[0.72rem] text-tm mb-4 animate-stagger-in tabular-nums"
          style={{ animationDelay: '0.14s' }}
        >
          {formatTime(timerSec)} · {levelData.difficulty} · {levelData.eqCount} eq
        </p>

        <ScoreBreakdownView
          bd={lastBreakdown}
          mistakeCount={mistakeCount}
          hintsUsed={hintsUsed}
        />

        {hintsEarnedThisLevel > 0 && (
          <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-1.5 rounded-xl bg-[rgba(255,200,60,0.08)] border border-[rgba(255,200,60,0.15)] animate-stagger-in text-[0.72rem] text-acc font-bold">
            <Lightbulb size={13} strokeWidth={2} />
            <span>
              {hintsEarnedThisLevel === 1 ? 'Hint unlocked' : `${hintsEarnedThisLevel} hints unlocked`}
              <span className="text-tm font-normal ml-1">· {hintsPool} available</span>
            </span>
          </div>
        )}

        <button
          onClick={nextLevel}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-acc to-acc2 text-td py-3 rounded-[22px] border-none font-game text-[0.9rem] font-extrabold cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98] shadow-[0_4px_16px_rgba(255,200,60,0.2)]"
        >
          Next Level
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

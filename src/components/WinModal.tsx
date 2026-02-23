import { useGameStore } from '../store/useGameStore'
import { formatTime } from '../engine/scoring'
import type { ScoreBreakdown } from '../engine/types'

function ScoreRow({
  variant,
  label,
  value,
  sign = '',
  index = 0,
}: {
  variant: 'base' | 'gain' | 'penalty' | 'total'
  label: string
  value: number
  sign?: string
  index?: number
}) {
  const styles: Record<string, string> = {
    base:    'bg-[rgba(255,200,60,0.1)] text-tl',
    gain:    'bg-[rgba(157,224,160,0.1)] text-ok',
    penalty: 'bg-[rgba(232,138,138,0.1)] text-bad',
    total:   'bg-[rgba(255,159,69,0.15)] text-acc font-black text-[0.85rem] mt-1',
  }

  return (
    <div
      className={`flex justify-between items-center text-[0.75rem] px-2 py-1 rounded-lg animate-stagger-in ${styles[variant]}`}
      style={{ animationDelay: `${0.18 + index * 0.09}s` }}
    >
      <span>{label}</span>
      <span className="font-extrabold">{sign}{value.toLocaleString()}</span>
    </div>
  )
}

function ScoreBreakdownView({ bd, mistakeCount, hintsUsed }: {
  bd: ScoreBreakdown
  mistakeCount: number
  hintsUsed: number
}) {
  // Increment index only for rows that actually render so stagger is tight.
  let i = 0
  return (
    <div className="w-full flex flex-col gap-1 mb-5 text-left">
      <ScoreRow variant="base"    label="⭐ Base score"    value={bd.base}      index={i++} />
      <ScoreRow variant="gain"    label="⚡ Speed bonus"   value={bd.timeBonus} sign="+" index={i++} />
      {bd.streakBonus > 0 && (
        <ScoreRow
          variant="gain"
          label={`🔥 Streak ×${(1 + bd.streakPct / 100).toFixed(2)} (${bd.streakPct}%)`}
          value={bd.streakBonus}
          sign="+"
          index={i++}
        />
      )}
      {bd.mistakePen > 0 && (
        <ScoreRow variant="penalty" label={`❌ Mistakes ×${mistakeCount}`} value={bd.mistakePen} sign="−" index={i++} />
      )}
      {bd.hintPen > 0 && (
        <ScoreRow variant="penalty" label={`💡 Hints ×${hintsUsed}`}       value={bd.hintPen}    sign="−" index={i++} />
      )}
      <ScoreRow variant="total" label="🏆 Total earned" value={bd.total} sign="+" index={i++} />
    </div>
  )
}

export function WinModal() {
  const winModal      = useGameStore(s => s.winModal)
  const nextLevel     = useGameStore(s => s.nextLevel)
  const levelData     = useGameStore(s => s.levelData)
  const timerSec      = useGameStore(s => s.timerSec)
  const lastBreakdown = useGameStore(s => s.lastBreakdown)
  const mistakeCount  = useGameStore(s => s.mistakeCount)
  const hintsUsed     = useGameStore(s => s.hintsUsed)

  if (!winModal || !levelData || !lastBreakdown) return null

  return (
    <div
      className="fixed inset-0 bg-black/75 animate-fade-in flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) nextLevel() }}
    >
      {/* Card — slides up from below into the centered position */}
      <div className="bg-surface border border-[#2e3650] rounded-3xl px-7 pt-7 pb-8 text-center shadow-[0_24px_64px_rgba(0,0,0,0.55)] animate-slide-up max-w-xs w-[90%]">

          {/* Emoji — delayed tada so it fires after the card settles */}
          <div
            className="text-5xl mb-2 animate-tada inline-block"
            style={{ animationDelay: '0.2s' }}
          >
            🎉
          </div>

          <h2
            className="text-[1.7rem] font-black text-acc font-game mb-1 animate-stagger-in"
            style={{ animationDelay: '0.12s' }}
          >
            Solved!
          </h2>

          <p
            className="text-[0.8rem] text-tm mb-1 animate-stagger-in"
            style={{ animationDelay: '0.15s' }}
          >
            Solved in {formatTime(timerSec)}
          </p>
          <p
            className="text-[0.72rem] text-[#445] italic mb-5 animate-stagger-in"
            style={{ animationDelay: '0.17s' }}
          >
            {levelData.name} · {levelData.eqCount} equations · {levelData.difficulty}
          </p>

          <ScoreBreakdownView
            bd={lastBreakdown}
            mistakeCount={mistakeCount}
            hintsUsed={hintsUsed}
          />

          <button
            onClick={nextLevel}
            className="w-full bg-gradient-to-r from-acc to-acc2 text-td py-3.5 rounded-[26px] border-none font-game text-[1rem] font-extrabold cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98] shadow-[0_4px_16px_rgba(255,200,60,0.25)]"
          >
            Next Level →
          </button>
      </div>
    </div>
  )
}

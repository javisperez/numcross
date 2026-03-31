import { Undo2, Eraser, Lightbulb, CheckCircle } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'

export function ActionBar() {
  const undoMove      = useGameStore(s => s.undoMove)
  const clearSelected = useGameStore(s => s.clearSelected)
  const useHint       = useGameStore(s => s.useHint)
  const checkSolution = useGameStore(s => s.checkSolution)
  const hintsPool     = useGameStore(s => s.hintsPool)

  const iconBtn = `
    flex flex-col items-center gap-1 px-6 py-2.5 rounded-2xl border-none
    font-game text-[0.58rem] font-bold uppercase tracking-wide
    cursor-pointer transition-transform hover:scale-[1.04] active:scale-[0.97]
    bg-surface text-tm
  `

  return (
    <div className="flex gap-3 mt-4 w-full max-w-160 justify-center">
      <button onClick={undoMove} className={iconBtn} aria-label="Undo last move">
        <Undo2 size={17} strokeWidth={2} />
        Undo
      </button>

      <button onClick={clearSelected} className={iconBtn} aria-label="Clear selected cell">
        <Eraser size={17} strokeWidth={2} />
        Clear
      </button>

      <button
        onClick={useHint}
        disabled={hintsPool <= 0}
        className={`${iconBtn} relative ${hintsPool <= 0 ? 'opacity-30 cursor-not-allowed' : 'text-acc'}`}
        aria-label={`Use hint (${hintsPool} remaining)`}
      >
        <Lightbulb size={17} strokeWidth={2} />
        Hint
        <span className="absolute -top-1 -right-1 bg-acc text-td text-[0.5rem] font-black rounded-full w-4 h-4 flex items-center justify-center pointer-events-none leading-none">
          {hintsPool}
        </span>
      </button>

      <button
        onClick={checkSolution}
        className="flex flex-col items-center gap-1 px-6 py-2.5 rounded-2xl border-none font-game text-[0.58rem] font-bold uppercase tracking-wide cursor-pointer transition-transform hover:scale-[1.04] active:scale-[0.97] bg-linear-to-r from-acc to-acc2 text-td shadow-[0_3px_10px_rgba(255,200,60,0.2)]"
        aria-label="Check solution"
      >
        <CheckCircle size={17} strokeWidth={2} />
        Check
      </button>
    </div>
  )
}

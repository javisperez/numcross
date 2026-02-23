import { useGameStore } from '../store/useGameStore'
import { maxHintsForDifficulty } from '../engine/scoring'

export function ActionBar() {
  const undoMove      = useGameStore(s => s.undoMove)
  const clearSelected = useGameStore(s => s.clearSelected)
  const useHint       = useGameStore(s => s.useHint)
  const checkSolution = useGameStore(s => s.checkSolution)
  const levelData     = useGameStore(s => s.levelData)
  const hintsUsed     = useGameStore(s => s.hintsUsed)

  const maxHints  = levelData ? maxHintsForDifficulty(levelData.difficulty) : 0
  const hintsLeft = maxHints - hintsUsed
  const showHint  = maxHints > 0

  const clearBtn = `
    px-6 py-3 rounded-[26px] border-none font-game text-[0.88rem] font-extrabold
    cursor-pointer transition-transform hover:scale-[1.04] active:scale-[0.97]
    bg-surface text-tl
  `
  const checkBtn = `
    px-6 py-3 rounded-[26px] border-none font-game text-[0.88rem] font-extrabold
    cursor-pointer transition-transform hover:scale-[1.04] active:scale-[0.97]
    bg-gradient-to-r from-acc to-acc2 text-td shadow-[0_4px_14px_rgba(255,200,60,0.22)]
  `

  return (
    <div className="flex gap-2.5 mt-4 flex-wrap justify-center">
      <button onClick={undoMove} className={clearBtn} aria-label="Undo last move">
        ↩ Undo
      </button>

      <button onClick={clearSelected} className={clearBtn} aria-label="Clear selected cell">
        Clear
      </button>

      {showHint && (
        <button
          onClick={useHint}
          disabled={hintsLeft <= 0}
          className={`${clearBtn} relative ${hintsLeft <= 0 ? 'opacity-35 cursor-not-allowed' : ''}`}
          aria-label={`Use hint (${hintsLeft} remaining)`}
        >
          💡 Hint
          <span className="absolute -top-1.5 -right-1.5 bg-acc2 text-td text-[0.55rem] font-black rounded-[10px] px-1.5 py-px pointer-events-none">
            {hintsLeft}
          </span>
        </button>
      )}

      <button onClick={checkSolution} className={checkBtn} aria-label="Check solution">
        Check ✓
      </button>
    </div>
  )
}

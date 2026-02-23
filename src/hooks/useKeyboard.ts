import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

export function useKeyboard() {
  const clearSelected  = useGameStore(s => s.clearSelected)
  const undoMove       = useGameStore(s => s.undoMove)
  const checkSolution  = useGameStore(s => s.checkSolution)
  const selectCell     = useGameStore(s => s.selectCell)
  const selRC          = useGameStore(s => s.selRC)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')                           { if (selRC) selectCell(selRC.r, selRC.c) }
      if (e.key === 'Backspace' || e.key === 'Delete')  clearSelected()
      if (e.key === 'Enter')                            checkSolution()
      if ((e.ctrlKey || e.metaKey) && e.key === 'z')   { e.preventDefault(); undoMove() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clearSelected, undoMove, checkSolution, selectCell, selRC])
}

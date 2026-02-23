import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

/** Starts the per-level timer; cleans up when winModal opens or component unmounts */
export function useTimer() {
  const tickTimer = useGameStore(s => s.tickTimer)
  const winModal  = useGameStore(s => s.winModal)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (winModal) {
      if (ref.current) clearInterval(ref.current)
      return
    }
    ref.current = setInterval(tickTimer, 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [winModal, tickTimer])
}

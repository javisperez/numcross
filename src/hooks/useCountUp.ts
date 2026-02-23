import { useState, useEffect, useRef } from 'react'

/**
 * Animates a number from its previous value to `target` using an ease-out
 * cubic curve. If the value decreases (e.g. streak reset) it snaps
 * immediately — no countdown animation.
 */
export function useCountUp(target: number, durationMs = 850): number {
  const [displayed, setDisplayed] = useState(target)
  const fromRef = useRef(target)
  const rafRef  = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    const diff = target - from

    // Snap instantly when value goes down — avoids weird countdown effects.
    if (diff <= 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setDisplayed(target)
      fromRef.current = target
      return
    }

    const begin = performance.now()

    function tick(now: number) {
      const t      = Math.min((now - begin) / durationMs, 1)
      const eased  = 1 - (1 - t) ** 3          // ease-out cubic
      setDisplayed(Math.round(from + diff * eased))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, durationMs])

  return displayed
}

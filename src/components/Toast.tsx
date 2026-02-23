import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

export function Toast() {
  const toast        = useGameStore(s => s.toast)
  const dismissToast = useGameStore(s => s.dismissToast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(dismissToast, 1900)
    return () => clearTimeout(t)
  }, [toast, dismissToast])

  return (
    <div
      className={`
        fixed top-[66px] left-1/2 -translate-x-1/2
        bg-surface text-tl border border-[#2e3650]
        px-5 py-2 rounded-[20px] font-bold text-[0.82rem]
        pointer-events-none z-[100] whitespace-nowrap
        transition-all duration-200
        ${toast
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2'
        }
      `}
      aria-live="polite"
    >
      {toast ?? ''}
    </div>
  )
}

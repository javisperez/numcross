import { RotateCcw } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { formatTime } from '../engine/scoring'

interface Props {
  onGoHome: () => void
}

export function Header({ onGoHome }: Props) {
  const levelNum = useGameStore(s => s.levelNum)
  const timerSec = useGameStore(s => s.timerSec)
  const initLevel = useGameStore(s => s.initLevel)

  return (
    <header className="w-full max-w-160 flex items-center justify-between pb-2 mb-2 border-b border-[#2e3650]">
      <div className="text-sm font-extrabold text-tm font-game min-w-[60px]">
        Level <em className="not-italic text-acc text-[0.95rem]">{levelNum}</em>
      </div>

      <button
        onClick={onGoHome}
        className="bg-transparent border-none cursor-pointer p-0 active:scale-95 transition-transform"
        aria-label="Home"
      >
        <h1 className="text-xl font-black tracking-[3px] bg-linear-to-r from-acc to-acc2 bg-clip-text text-transparent font-game leading-none">
          NUMCROSS
        </h1>
      </button>

      <div className="flex items-center gap-2 min-w-[60px] justify-end">
        <span className="text-[0.9rem] font-extrabold text-acc font-game tabular-nums">
          {formatTime(timerSec)}
        </span>
        <button
          onClick={() => initLevel()}
          className="w-8 h-8 rounded-full bg-surface text-tm flex items-center justify-center hover:bg-[#2e3650] active:scale-90 transition-all border-none cursor-pointer"
          aria-label="Reset level"
          title="Reset level"
        >
          <RotateCcw size={14} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  )
}

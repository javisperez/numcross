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
    <header className="w-full max-w-160 flex items-center justify-between pb-2 mb-2 border-b border-tm">
      <div className="text-sm font-extrabold text-tm font-game">
        Level <em className="not-italic text-acc text-[0.95rem]">{levelNum}</em>
      </div>

      <button
        onClick={onGoHome}
        className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-0 active:scale-95 transition-transform"
        aria-label="Home"
        title="Home"
      >
        <h1 className="text-2xl font-black tracking-[3px] bg-linear-to-r from-acc to-acc2 bg-clip-text text-transparent font-game leading-none">
          NUMCROSS
        </h1>
      </button>

      <div className="flex items-center gap-2">
        <span className="text-[0.95rem] font-extrabold text-acc min-w-12 text-right font-game">
          {formatTime(timerSec)}
        </span>
        <button
          onClick={() => initLevel()}
          className="w-9 h-9 rounded-full bg-surface text-tl flex items-center justify-center hover:bg-[#2e3650] active:scale-90 transition-all text-base border-none cursor-pointer"
          aria-label="Reset level"
          title="Reset level"
        >
          ↺
        </button>
      </div>
    </header>
  )
}

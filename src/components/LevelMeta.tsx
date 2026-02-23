import { useGameStore } from '../store/useGameStore'
import { getDiff } from '../engine/difficulty'

export function LevelMeta() {
  const levelNum  = useGameStore(s => s.levelNum)
  const levelData = useGameStore(s => s.levelData)
  const diff = getDiff(levelNum)

  const progress = Math.min(0.98, (levelNum - 1) / 24)
  const isHard = diff.label === 'Hard' || diff.label === 'Expert'
  const eqCount = levelData?.eqCount ?? 0

  return (
    <div className="w-full max-w-160">
      {/* Info row */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-[0.75rem] font-extrabold text-tm font-game">
          Level <em className="not-italic text-acc text-[0.95rem]">{levelNum}</em>
        </div>
        <div className="text-[0.75rem] text-tm font-game">
          {diff.label} • {eqCount} equations
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${isHard ? 'bg-orange-500' : 'bg-green-500'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}

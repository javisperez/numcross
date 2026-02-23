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
      </div>
    </div>
  )
}

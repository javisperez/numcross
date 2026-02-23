import { useGameStore } from '../store/useGameStore'

export function TileBank() {
  const levelData = useGameStore(s => s.levelData)
  const tileUsed  = useGameStore(s => s.tileUsed)
  const placeTile = useGameStore(s => s.placeTile)

  if (!levelData) return null

  return (
    <div className="w-full max-w-[640px]">
      <h2 className="text-[0.62rem] font-extrabold text-[#4a5568] tracking-[1.5px] uppercase text-center mb-2">
        Available Numbers
      </h2>
      <div className="flex flex-wrap gap-[7px] justify-center">
        {levelData.tiles.map((num, i) => {
          const used = tileUsed[i] !== null
          return (
            <button
              key={i}
              onClick={() => placeTile(i)}
              disabled={used}
              className={`
                w-[52px] h-[52px] rounded-[10px] text-[1.1rem] font-black
                flex items-center justify-center border-2 border-transparent
                transition-all duration-[120ms] font-game
                ${used
                  ? 'opacity-40 bg-[#adc8ad] text-[#5a8a5a] cursor-default'
                  : 'bg-[#e8f8e8] text-[#1e6e1e] cursor-pointer hover:scale-110 hover:border-acc active:scale-95'
                }
              `}
              aria-label={`Place tile ${num}${used ? ' (used)' : ''}`}
            >
              {num}
            </button>
          )
        })}
      </div>
    </div>
  )
}

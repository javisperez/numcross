import { useGameStore } from '../store/useGameStore'
import type { Cell } from '../engine/types'

const MAX_CELL = 52
const GAP      = 4

/**
 * Compute the largest square cell size that still fits all `cols` columns
 * within the current viewport without horizontal scrolling.
 *
 * 32 px = App px-2 (8×2) + Grid p-1 (4×2) + a couple px breathing room.
 */
function cellSizeFor(cols: number): number {
  const available = Math.min(640, window.innerWidth) - 32
  const fit = Math.floor((available - (cols - 1) * GAP) / cols)
  return Math.max(22, Math.min(MAX_CELL, fit))
}

function GameCell({
  cell,
  row,
  col,
  isSelected,
  size,
}: {
  cell: Cell
  row: number
  col: number
  isSelected: boolean
  size: number
}) {
  const selectCell = useGameStore(s => s.selectCell)

  if (!cell) {
    return <div style={{ width: size, height: size }} />
  }

  if (cell.t === 'F') {
    const isNum    = typeof cell.v === 'number'
    // Font scales with cell size: ~42% for numbers, ~38% for symbols.
    const fontSize = Math.max(10, Math.round(size * (isNum ? 0.42 : 0.38)))
    return (
      <div
        style={{ width: size, height: size, fontSize }}
        className={`
          flex items-center justify-center rounded-[10px] font-extrabold select-none shrink-0
          ${isNum
            // Fixed number: cream background.
            ? 'bg-cell-fixed text-td'
            // Operator / equals: give a faint background so they look grounded
            // in the grid instead of floating as bare text characters.
            : 'bg-white/5 text-tl'}
        `}
      >
        {cell.v}
      </div>
    )
  }

  // Blank cell
  const isFilled = cell.val !== null
  const isOk     = cell.status === 'ok'
  const isBad    = cell.status === 'bad'
  const fontSize = Math.max(11, Math.round(size * 0.42))

  let bg = 'bg-cell-blank hover:bg-[#7a6040]'
  let textColor = 'text-td'

  if (isSelected) {
    bg = 'bg-sel scale-[1.07] shadow-[0_0_0_3px_rgba(255,200,60,0.3)]'
    textColor = 'text-td'
  } else if (isOk) {
    bg = 'bg-ok'
  } else if (isBad) {
    bg = 'bg-bad animate-jolt'
  } else if (isFilled) {
    bg        = 'bg-cell-user'
    textColor = 'text-white'
  }

  return (
    <div
      style={{ width: size, height: size, fontSize }}
      className={`
        flex items-center justify-center rounded-[10px] font-extrabold
        cursor-pointer select-none flex-shrink-0 transition-all duration-[120ms]
        ${bg} ${textColor}
      `}
      onClick={() => selectCell(row, col)}
      role="button"
      aria-label={`Cell ${row},${col}${isFilled ? ` value ${cell.val}` : ' empty'}`}
      aria-pressed={isSelected}
    >
      {isFilled ? cell.val : ''}
    </div>
  )
}

export function Grid() {
  const levelData = useGameStore(s => s.levelData)
  const liveGrid  = useGameStore(s => s.liveGrid)
  const selRC     = useGameStore(s => s.selRC)

  if (!levelData) return null

  const size = cellSizeFor(levelData.cols)

  return (
    // No overflow-x-auto — cells shrink to fit instead of scrolling.
    <div className="w-full max-w-[640px] flex justify-center mb-4 p-1">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${levelData.cols}, ${size}px)`,
          gap: GAP,
        }}
      >
        {Array.from({ length: levelData.rows }, (_, r) =>
          Array.from({ length: levelData.cols }, (_, c) => (
            <GameCell
              key={`${r},${c}`}
              cell={liveGrid[r]?.[c] ?? null}
              row={r}
              col={c}
              isSelected={selRC?.r === r && selRC?.c === c}
              size={size}
            />
          ))
        )}
      </div>
    </div>
  )
}

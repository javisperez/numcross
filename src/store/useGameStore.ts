import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateLevel } from '../engine/difficulty'
import { validateGrid } from '../engine/checker'
import { computeScoreBreakdown, maxHintsForDifficulty } from '../engine/scoring'
import type { LevelData, Cell, UndoEntry, ScoreBreakdown } from '../engine/types'

function nextSeed(seed: number): number {
  return (((seed * 1664525 + 1013904223) & 0x7fffffff) % 99991) + 1
}

interface GameState {
  // Level
  levelNum: number
  levelSeed: number
  levelData: LevelData | null
  liveGrid: Cell[][]
  tileUsed: (string | null)[]   // null = free, "r,c" = placed at that cell

  // Interaction
  selRC: { r: number; c: number } | null

  // Timer
  timerSec: number

  // Score / meta
  totalScore: number
  levelStreak: number
  bestStreak: number
  mistakeCount: number
  hintsUsed: number
  undoStack: UndoEntry[]
  bestTimes: Record<string, number>
  perfectLevels: number

  // UI state
  toast: string | null
  winModal: boolean
  lastBreakdown: ScoreBreakdown | null
}

interface GameActions {
  restoreLevel: () => void
  initLevel: () => void
  resetGame: () => void
  tickTimer: () => void
  selectCell: (r: number, c: number) => void
  placeTile: (tileIdx: number) => void
  clearSelected: () => void
  undoMove: () => void
  useHint: () => void
  checkSolution: () => void
  nextLevel: () => void
  changeLevel: (dir: number) => void
  dismissToast: () => void
  closeWinModal: () => void
}

type GameStore = GameState & GameActions

const INITIAL_SEED = 42

// Bump this whenever the stored data format changes in a breaking way.
// On mismatch, migrate() keeps safe state (level number, scores, records)
// and discards fragile state (in-progress puzzle grid) so the user lands
// on a clean puzzle instead of corrupt data.
const STORE_VERSION = 1

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────────────────────────────────
      levelNum:      1,
      levelSeed:     INITIAL_SEED,
      levelData:     null,
      liveGrid:      [],
      tileUsed:      [],
      selRC:         null,
      timerSec:      0,
      totalScore:    0,
      levelStreak:   0,
      bestStreak:    0,
      mistakeCount:  0,
      hintsUsed:     0,
      undoStack:     [],
      bestTimes:     {},
      perfectLevels: 0,
      toast:         null,
      winModal:      false,
      lastBreakdown: null,

      // ── Actions ─────────────────────────────────────────────────────────────

      // Called on app boot. If a saved in-progress puzzle exists and its
      // grid structure still matches what the engine generates (same levelNum +
      // levelSeed), the user's progress is restored. Otherwise a fresh level
      // is generated. This is the safe fallback for any silent data corruption.
      restoreLevel: () => {
        const { levelNum, levelSeed, liveGrid } = get()
        const levelData = generateLevel(levelNum, levelSeed)
        if (!levelData) { get().initLevel(); return }

        // No saved progress (fresh install or post-migration reset)
        if (liveGrid.length === 0) { get().initLevel(); return }

        // Validate that the saved grid dimensions still match what the engine
        // produces. A mismatch means the algorithm changed without a version
        // bump, so we fall back to a clean init rather than show corrupt state.
        const dimensionsOk =
          liveGrid.length === levelData.grid.length &&
          liveGrid.every((row, r) => row.length === levelData.grid[r].length)

        if (!dimensionsOk) { get().initLevel(); return }

        // Structure looks valid – restore levelData and keep saved progress.
        set({ levelData })
      },

      // Wipes all progress and starts a fresh game from level 1.
      resetGame: () => {
        set({
          levelNum:      1,
          levelSeed:     INITIAL_SEED,
          levelData:     null,
          liveGrid:      [],
          tileUsed:      [],
          selRC:         null,
          timerSec:      0,
          totalScore:    0,
          levelStreak:   0,
          bestStreak:    0,
          mistakeCount:  0,
          hintsUsed:     0,
          undoStack:     [],
          bestTimes:     {},
          perfectLevels: 0,
          toast:         null,
          winModal:      false,
          lastBreakdown: null,
        })
        get().initLevel()
      },

      initLevel: () => {
        const { levelNum, levelSeed } = get()
        const levelData = generateLevel(levelNum, levelSeed)
        if (!levelData) return

        set({
          levelData,
          liveGrid:      levelData.grid.map(row => row.map(c => c ? { ...c } : null)),
          tileUsed:      levelData.tiles.map(() => null),
          selRC:         null,
          timerSec:      0,
          mistakeCount:  0,
          hintsUsed:     0,
          undoStack:     [],
          winModal:      false,
          lastBreakdown: null,
        })
      },

      tickTimer: () => set(s => ({ timerSec: s.timerSec + 1 })),

      selectCell: (r, c) => {
        const { liveGrid, selRC } = get()
        const cell = liveGrid[r]?.[c]
        if (!cell || cell.t !== 'B') return
        const same = selRC?.r === r && selRC?.c === c
        set({ selRC: same ? null : { r, c } })
      },

      placeTile: (tileIdx) => {
        const { selRC, liveGrid, tileUsed, levelData, undoStack } = get()
        if (!levelData || tileUsed[tileIdx] !== null) return
        if (!selRC) { set({ toast: 'Tap a cell first' }); return }

        const { r, c } = selRC
        const cell = liveGrid[r][c]
        if (!cell || cell.t !== 'B') return

        const prevVal = cell.val
        const prevTileIdx = prevVal !== null ? tileUsed.indexOf(`${r},${c}`) : -1

        // Build updated state immutably
        const newGrid = liveGrid.map(row => row.map(cl => cl ? { ...cl } : null))
        const newUsed = [...tileUsed]

        // Free previous tile if cell already had a value
        if (prevVal !== null) {
          const prev = newUsed.indexOf(`${r},${c}`)
          if (prev >= 0) newUsed[prev] = null
        }

        const target = newGrid[r][c] as Extract<Cell, { t: 'B' }>
        target.val = levelData.tiles[tileIdx]
        delete (target as { status?: string }).status
        newUsed[tileIdx] = `${r},${c}`

        const newUndo: UndoEntry[] = [...undoStack, { r, c, prevVal, prevTileIdx }].slice(-50)

        set({ liveGrid: newGrid, tileUsed: newUsed, undoStack: newUndo, selRC: null })
      },

      clearSelected: () => {
        const { selRC, liveGrid, tileUsed, undoStack } = get()
        if (!selRC) return
        const { r, c } = selRC
        const cell = liveGrid[r][c]
        if (!cell || cell.t !== 'B' || cell.val === null) return

        const prevTileIdx = tileUsed.indexOf(`${r},${c}`)
        const newGrid = liveGrid.map(row => row.map(cl => cl ? { ...cl } : null))
        const newUsed = [...tileUsed]

        if (prevTileIdx >= 0) newUsed[prevTileIdx] = null
        const target = newGrid[r][c] as Extract<Cell, { t: 'B' }>
        const prevVal = target.val
        target.val = null
        delete (target as { status?: string }).status

        const newUndo: UndoEntry[] = [...undoStack, { r, c, prevVal, prevTileIdx }].slice(-50)

        set({ liveGrid: newGrid, tileUsed: newUsed, undoStack: newUndo, selRC: null })
      },

      undoMove: () => {
        const { undoStack, liveGrid, tileUsed } = get()
        if (!undoStack.length) { set({ toast: 'Nothing to undo' }); return }

        const { r, c, prevVal, prevTileIdx } = undoStack[undoStack.length - 1]
        const newGrid = liveGrid.map(row => row.map(cl => cl ? { ...cl } : null))
        const newUsed = [...tileUsed]

        // Free current occupant
        const cur = newUsed.indexOf(`${r},${c}`)
        if (cur >= 0) newUsed[cur] = null

        const target = newGrid[r][c] as Extract<Cell, { t: 'B' }>
        target.val = prevVal
        delete (target as { status?: string }).status
        if (prevVal !== null && prevTileIdx >= 0) newUsed[prevTileIdx] = `${r},${c}`

        set({
          liveGrid: newGrid,
          tileUsed: newUsed,
          undoStack: undoStack.slice(0, -1),
          selRC: null,
        })
      },

      useHint: () => {
        const { levelData, liveGrid, tileUsed, hintsUsed, undoStack } = get()
        if (!levelData) return

        const max = maxHintsForDifficulty(levelData.difficulty)
        if (hintsUsed >= max) { set({ toast: 'No hints left!' }); return }

        const empties: { r: number; c: number; ans: number }[] = []
        liveGrid.forEach((row, r) => row.forEach((cell, c) => {
          if (cell && cell.t === 'B' && cell.val === null) empties.push({ r, c, ans: cell.ans })
        }))
        if (!empties.length) { set({ toast: 'No empty cells left' }); return }

        const target = empties[Math.floor(Math.random() * empties.length)]
        const tileIdx = levelData.tiles.findIndex((v, i) => v === target.ans && tileUsed[i] === null)
        if (tileIdx === -1) { set({ toast: 'Tile already placed' }); return }

        const newGrid = liveGrid.map(row => row.map(cl => cl ? { ...cl } : null))
        const newUsed = [...tileUsed]
        const cell = newGrid[target.r][target.c] as Extract<Cell, { t: 'B' }>
        cell.val = target.ans
        newUsed[tileIdx] = `${target.r},${target.c}`

        const newUndo: UndoEntry[] = [...undoStack, { r: target.r, c: target.c, prevVal: null, prevTileIdx: -1 }].slice(-50)

        set({ liveGrid: newGrid, tileUsed: newUsed, hintsUsed: hintsUsed + 1, undoStack: newUndo, selRC: null })
      },

      checkSolution: () => {
        const { levelData, liveGrid, timerSec, mistakeCount, hintsUsed, levelStreak, totalScore, bestTimes, levelNum, bestStreak, perfectLevels } = get()
        if (!levelData) return

        const wrong = validateGrid(liveGrid, levelData)
        if (wrong === null) { set({ toast: 'Fill all cells first' }); return }

        // Mark cells
        const newGrid = liveGrid.map((row, r) =>
          row.map((cell, c) => {
            if (!cell || cell.t !== 'B') return cell
            return { ...cell, status: wrong.has(`${r},${c}`) ? 'bad' as const : 'ok' as const }
          })
        )

        if (wrong.size === 0) {
          // ✅ Solved!
          const bd = computeScoreBreakdown(levelNum, timerSec, mistakeCount, hintsUsed, levelStreak)
          const key = String(levelNum)
          const newBest = { ...bestTimes }
          if (!newBest[key] || timerSec < newBest[key]) newBest[key] = timerSec
          const newStreak = levelStreak + 1

          set({
            liveGrid: newGrid,
            winModal: true,
            lastBreakdown: bd,
            totalScore: totalScore + bd.total,
            levelStreak: newStreak,
            bestStreak: Math.max(bestStreak, newStreak),
            bestTimes: newBest,
            perfectLevels: (mistakeCount === 0 && hintsUsed === 0) ? perfectLevels + 1 : perfectLevels,
          })
        } else {
          // ❌ Wrong
          set({
            liveGrid: newGrid,
            mistakeCount: mistakeCount + 1,
            levelStreak: 0,
            toast: "Something doesn't add up… streak reset!",
          })
          // Clear status after 1.6s
          setTimeout(() => {
            set(s => ({
              liveGrid: s.liveGrid.map(row =>
                row.map(cell => {
                  if (!cell || cell.t !== 'B') return cell
                  const { status: _s, ...rest } = cell as Extract<Cell, { t: 'B' }> & { status?: string }
                  return rest as Cell
                })
              ),
            }))
          }, 1600)
        }
      },

      nextLevel: () => {
        const { levelNum, levelSeed } = get()
        const newSeed = nextSeed(levelSeed)
        set({ levelNum: levelNum + 1, levelSeed: newSeed, winModal: false })
        get().initLevel()
      },

      changeLevel: (dir) => {
        const { levelNum, levelSeed } = get()
        const n = levelNum + dir
        if (n < 1) return
        const newSeed = dir > 0 ? nextSeed(levelSeed) : levelSeed
        set({ levelNum: n, levelSeed: newSeed })
        get().initLevel()
      },

      dismissToast:  () => set({ toast: null }),
      closeWinModal: () => set({ winModal: false }),
    }),
    {
      name: 'numcross-save',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),

      // Only persist meaningful state. levelData and all UI/ephemeral state
      // are intentionally excluded – levelData is always regenerated on boot,
      // and UI state (selRC, toast, winModal, lastBreakdown) should not survive
      // a page reload.
      partialize: (state) => ({
        // ── Safe: simple scalars / records that survive any version bump ──────
        levelNum:      state.levelNum,
        levelSeed:     state.levelSeed,
        totalScore:    state.totalScore,
        levelStreak:   state.levelStreak,
        bestStreak:    state.bestStreak,
        bestTimes:     state.bestTimes,
        perfectLevels: state.perfectLevels,
        // ── Fragile: discarded by migrate() when STORE_VERSION is bumped ─────
        liveGrid:     state.liveGrid,
        tileUsed:     state.tileUsed,
        timerSec:     state.timerSec,
        mistakeCount: state.mistakeCount,
        hintsUsed:    state.hintsUsed,
        undoStack:    state.undoStack,
      }),

      // Called whenever the stored version !== STORE_VERSION (i.e. after a
      // breaking app update). We preserve the safe scalar state so the player
      // keeps their level progress, score, and records, but we throw away the
      // fragile puzzle state so they never land on a broken/corrupt grid.
      // restoreLevel() will then regenerate a clean puzzle for their level.
      migrate: (stored: unknown) => {
        const s = (stored ?? {}) as Record<string, unknown>
        return {
          levelNum:      typeof s.levelNum      === 'number' ? s.levelNum      : 1,
          levelSeed:     typeof s.levelSeed     === 'number' ? s.levelSeed     : INITIAL_SEED,
          totalScore:    typeof s.totalScore    === 'number' ? s.totalScore    : 0,
          levelStreak:   typeof s.levelStreak   === 'number' ? s.levelStreak   : 0,
          bestStreak:    typeof s.bestStreak    === 'number' ? s.bestStreak    : 0,
          bestTimes:     s.bestTimes && typeof s.bestTimes === 'object' && !Array.isArray(s.bestTimes)
                           ? s.bestTimes as Record<string, number>
                           : {},
          perfectLevels: typeof s.perfectLevels === 'number' ? s.perfectLevels : 0,
          // Reset fragile state; restoreLevel() → initLevel() will rebuild it.
          liveGrid:     [],
          tileUsed:     [],
          timerSec:     0,
          mistakeCount: 0,
          hintsUsed:    0,
          undoStack:    [],
        }
      },
    }
  )
)
